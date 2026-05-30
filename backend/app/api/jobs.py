import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.api_errors import http_500_safe
from app.core.config import (
    DATABASE_URL,
    SEED_DEFAULT_LIMIT,
    SEED_MAX_SAFE_LIMIT,
    SKILLSYNC_JOB_POSTINGS_CSV,
)
from app.core.db import get_db
from app.models.job import Job
from app.services import cv_session
from app.services.job_importer import import_jobs_from_csv
from app.services.job_providers.jobspy_provider import JobSpyProvider
from app.services.live_job_ingest import ingest_external_jobs
from app.services.model import invalidate_corpus_cache

logger = logging.getLogger("skillsync.jobs")

router = APIRouter(prefix="/jobs", tags=["jobs"])

_REQUIRED_JOB_COLUMNS = {
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
    "description",
    "requirements",
    "full_text",
}


def _check_jobs_schema(db: Session) -> None:
    if not DATABASE_URL.startswith("sqlite"):
        return
    rows = db.execute(text("PRAGMA table_info(jobs)")).fetchall()
    existing_cols = {r[1] for r in rows}
    missing = sorted(_REQUIRED_JOB_COLUMNS - existing_cols)
    if missing:
        raise HTTPException(
            status_code=500,
            detail=(
                "DB schema is outdated (jobs table missing columns: "
                + ", ".join(missing)
                + "). Delete backend/skillsync.db, restart, then POST /jobs/seed."
            ),
        )


def _clamp_seed_limit(limit: int) -> tuple[int, Optional[str]]:
    if limit <= SEED_MAX_SAFE_LIMIT:
        return limit, None
    return (
        SEED_MAX_SAFE_LIMIT,
        f"limit clamped to {SEED_MAX_SAFE_LIMIT} for demo stability",
    )


@router.get("/map")
def jobs_map(
    source: Optional[str] = Query(default=None),
    industry: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None, description="Search in title/company"),
    include_ungocoded: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    try:
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

        result: List[Dict[str, Any]] = []
        for j in jobs:
            try:
                result.append(
                    {
                        "id": j.id,
                        "title": j.title or "",
                        "company": j.company or "",
                        "lat": float(j.latitude) if j.latitude is not None else None,
                        "lon": float(j.longitude) if j.longitude is not None else None,
                    }
                )
            except (TypeError, ValueError) as exc:
                logger.warning("Skipping job id=%s in map response: %s", j.id, exc)
                continue
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise http_500_safe(exc, context="GET /jobs/map")


@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):
    try:
        cv_text = cv_session.get_cv() or ""
        if not cv_text.strip():
            return []

        stmt = select(Job).where(
            Job.latitude.is_not(None),
            Job.longitude.is_not(None),
        )
        jobs = db.execute(stmt).scalars().all()

        cv_words = set(cv_text.lower().split())
        if not cv_words:
            return []

        results: List[Dict[str, Any]] = []
        for job in jobs:
            try:
                if job.latitude is None or job.longitude is None:
                    continue
                job_text = job.full_text or f"{job.title or ''} {job.description or ''}"
                job_words = set(job_text.lower().split())
                common = cv_words & job_words
                score = round((len(common) / max(len(cv_words), 1)) * 100, 1)

                results.append(
                    {
                        "id": job.id,
                        "title": job.title or "",
                        "company": job.company or "",
                        "location": job.location_raw or "",
                        "lat": float(job.latitude),
                        "lon": float(job.longitude),
                        "match_score": score,
                        "url": job.url or "",
                    }
                )
            except (TypeError, ValueError, AttributeError) as exc:
                logger.warning("Skipping job id=%s in recommendations: %s", job.id, exc)
                continue

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:20]
    except HTTPException:
        raise
    except Exception as exc:
        raise http_500_safe(exc, context="GET /jobs/recommendations")


@router.post("/seed")
def seed_jobs(
    provider: str = Query(default="dataset", description="dataset (default) or jobspy"),
    query: str = Query(default="software engineer", description="Used only for provider=jobspy"),
    location: Optional[str] = Query(default=None, description="Used only for provider=jobspy"),
    limit: int = Query(default=SEED_DEFAULT_LIMIT, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    try:
        _check_jobs_schema(db)
        effective_limit, warning = _clamp_seed_limit(limit)

        if provider == "dataset":
            csv_path = SKILLSYNC_JOB_POSTINGS_CSV
            if not Path(csv_path).exists():
                raise HTTPException(status_code=400, detail=f"CSV not found at {csv_path}")

            affected = import_jobs_from_csv(
                db, csv_path=csv_path, limit=effective_limit, source="dataset"
            )
            invalidate_corpus_cache()
            payload: Dict[str, Any] = {
                "status": "ok",
                "provider": provider,
                "affected": affected,
                "csv_path": csv_path,
                "limit_applied": effective_limit,
                "message": "Dataset jobs imported successfully",
            }
            if warning:
                payload["warning"] = warning
            return payload

        if provider == "jobspy":
            raise HTTPException(
                status_code=400,
                detail="jobspy provider is not enabled for demo. Use provider=dataset.",
            )
            affected = ingest_external_jobs(db, source="jobspy", jobs=jobs, geocode=True)
            invalidate_corpus_cache()
            payload = {
                "status": "ok",
                "provider": provider,
                "affected": affected,
                "limit_applied": effective_limit,
            }
            if warning:
                payload["warning"] = warning
            return payload

        raise HTTPException(
            status_code=400,
            detail="Unknown provider. Use provider=dataset or provider=jobspy.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise http_500_safe(exc, context="POST /jobs/seed")
