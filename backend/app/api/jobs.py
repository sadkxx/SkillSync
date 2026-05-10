import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.job import Job
from app.services.job_importer import import_jobs_from_csv
from app.services.job_providers.jobspy_provider import JobSpyProvider
from app.services.live_job_ingest import ingest_external_jobs


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/map")
def jobs_map(
    source: Optional[str] = Query(default=None),
    industry: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, description="Search in title/company"),
    include_ungocoded: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    stmt = select(Job)
    if not include_ungocoded:
        stmt = stmt.where(Job.latitude.is_not(None), Job.longitude.is_not(None))
    if source:
        stmt = stmt.where(Job.source == source)
    if industry:
        stmt = stmt.where(Job.industry == industry)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where((Job.title.ilike(like)) | (Job.company.ilike(like)))

    jobs = db.execute(stmt).scalars().all()

    return [
        {
            "id": j.id,
            "title": j.title,
            "company": j.company or "",
            "lat": float(j.latitude) if j.latitude is not None else None,
            "lon": float(j.longitude) if j.longitude is not None else None,
        }
        for j in jobs
    ]


@router.post("/seed")
def seed_jobs(
    provider: str = Query(default="dataset", description="dataset (default) or jobspy"),
    query: str = Query(default="software engineer", description="Used only for provider=jobspy"),
    location: Optional[str] = Query(default=None, description="Used only for provider=jobspy"),
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    """
    Explicit seed/import endpoint. Geocoding happens only during this call.
    """
    # Basic schema guard: if the DB was created with an older Job model, SQLite won't
    # auto-add columns. Detect and instruct to recreate the DB in dev.
    try:
        rows = db.execute("PRAGMA table_info(jobs)").fetchall()
        existing_cols = {r[1] for r in rows}  # (cid, name, type, notnull, dflt_value, pk)
        required = {
            "id",
            "source",
            "source_id",
            "title",
            "company",
            "location_raw",
            "location_normalized",
            "location",
            "url",
            "industry",
            "latitude",
            "longitude",
        }
        missing = sorted(required - existing_cols)
        if missing:
            raise HTTPException(
                status_code=500,
                detail=(
                    "DB schema is outdated (jobs table missing columns: "
                    + ", ".join(missing)
                    + "). In dev, delete backend/skillsync.db and restart, then call /jobs/seed again."
                ),
            )
    except HTTPException:
        raise
    except Exception:
        # If PRAGMA fails, let seed attempt and return importer result.
        pass

    if provider == "dataset":
        app_dir = Path(__file__).resolve().parents[1]  # backend/app
        backend_dir = app_dir.parent  # backend
        repo_dir = backend_dir.parent  # repo root
        default_csv = str(repo_dir / "data" / "fake_job_postings.csv")
        csv_path = os.getenv("SKILLSYNC_JOB_POSTINGS_CSV", default_csv)
        if not Path(csv_path).exists():
            raise HTTPException(status_code=400, detail=f"CSV not found at {csv_path}")

        affected = import_jobs_from_csv(db, csv_path=csv_path, limit=limit, source="dataset")
        return {"status": "ok", "provider": provider, "affected": affected, "csv_path": csv_path}

    if provider == "jobspy":
        try:
            jobs = JobSpyProvider().fetch(query=query, location=location, limit=limit)
            affected = ingest_external_jobs(db, source="jobspy", jobs=jobs, geocode=True)
            return {"status": "ok", "provider": provider, "affected": affected}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    raise HTTPException(status_code=400, detail="Unknown provider. Use provider=dataset or provider=jobspy.")

