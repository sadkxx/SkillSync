import csv
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.services.geocoding_service import geocode_location
from app.services.location_parser import normalize_location


def import_jobs_from_csv(
    db: Session,
    csv_path: str,
    limit: int = 500,
    source: str = "dataset",
) -> int:
    """
    Imports jobs into DB and geocodes only during import.
    Safe to call multiple times; it upserts by (source, source_id).
    """
    path = Path(csv_path)
    if not path.exists():
        return 0

    affected = 0
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                if row.get("fraudulent") == "1":
                    continue

                source_id = str(row.get("job_id") or "").strip()
                if not source_id:
                    continue
                title = (row.get("title") or "").strip() or "Unknown"
                company = (row.get("company_profile") or "").strip() or None
                location_raw = (row.get("location") or "").strip() or None
                industry = (row.get("industry") or "").strip() or None

                job = (
                    db.execute(
                        select(Job).where(Job.source == source, Job.source_id == source_id)
                    )
                    .scalars()
                    .first()
                )

                clean_location = normalize_location(location_raw) if location_raw else None
                lat, lon = (None, None)
                # Geocode only during ingest (seed/import). Never per request.
                if clean_location:
                    lat, lon = geocode_location(clean_location)

                if job is None:
                    job = Job(
                        source=source,
                        source_id=source_id,
                        title=title,
                        company=company,
                        location_raw=location_raw,
                        location_normalized=clean_location,
                        location=clean_location or location_raw,
                        url=None,
                        industry=industry,
                        latitude=lat,
                        longitude=lon,
                    )
                    db.add(job)
                else:
                    job.title = title
                    job.company = company
                    job.location_raw = location_raw
                    job.location_normalized = clean_location
                    job.location = clean_location or location_raw
                    job.industry = industry
                    # only fill coordinates if we got a fresh geocode result
                    if lat is not None and lon is not None:
                        job.latitude = lat
                        job.longitude = lon

                affected += 1
                if affected >= limit:
                    break
            except Exception:
                continue

    if affected:
        db.commit()
    return affected

