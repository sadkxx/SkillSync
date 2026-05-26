from __future__ import annotations

from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.services.geocoding_service import geocode_location
from app.services.location_parser import normalize_location
from app.services.job_providers.base import ExternalJob


def ingest_external_jobs(
    db: Session,
    *,
    source: str,
    jobs: Iterable[ExternalJob],
    geocode: bool = True,
) -> int:
    """
    Upsert by (source, source_id). Geocoding is performed only during ingest.
    """
    affected = 0
    for j in jobs:
        if not j.source_id or not j.title:
            continue

        row = (
            db.execute(select(Job).where(Job.source == source, Job.source_id == j.source_id))
            .scalars()
            .first()
        )

        location_raw = j.location
        clean_location = normalize_location(location_raw) if location_raw else None
        lat, lon = (None, None)
        if geocode and clean_location:
            lat, lon = geocode_location(clean_location)

        if row is None:
            row = Job(
                source=source,
                source_id=j.source_id,
                title=j.title,
                company=j.company,
                location_raw=location_raw,
                location_normalized=clean_location,
                location=clean_location or location_raw,
                url=j.url,
                industry=j.industry,
                latitude=lat,
                longitude=lon,
            )
            db.add(row)
        else:
            row.title = j.title
            row.company = j.company
            row.location_raw = location_raw
            row.location_normalized = clean_location
            row.location = clean_location or location_raw
            row.url = j.url
            row.industry = j.industry
            if lat is not None and lon is not None:
                row.latitude = lat
                row.longitude = lon

        affected += 1

    if affected:
        db.commit()
    return affected

