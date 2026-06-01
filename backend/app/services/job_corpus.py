"""
Job corpus for CV–job similarity analysis.

Primary source: DB (after /jobs/seed). Fallback: CSV sample (dev/bootstrap).
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional, Tuple

import pandas as pd
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import (
    ANALYSIS_CORPUS_LIMIT,
    MIN_JOBS_FOR_DB_ANALYSIS,
    SKILLSYNC_JOB_POSTINGS_CSV,
)
from app.models.job import Job

_corpus_version = 0


def bump_corpus_version() -> None:
    global _corpus_version
    _corpus_version += 1


def get_corpus_version() -> int:
    return _corpus_version


def build_corpus_cache_key(db: Optional[Session], limit: int) -> str:
    """Deterministic cache key: version + source fingerprint + limit."""
    version = get_corpus_version()
    limit = min(limit, ANALYSIS_CORPUS_LIMIT)

    if db is not None:
        try:
            count = (
                db.execute(
                    select(func.count())
                    .select_from(Job)
                    .where(Job.full_text.isnot(None))
                    .where(Job.full_text != "")
                ).scalar()
                or 0
            )
            if count >= MIN_JOBS_FOR_DB_ANALYSIS:
                return f"v{version}:db:{count}:{limit}"
        except Exception:
            pass

    csv_path = Path(SKILLSYNC_JOB_POSTINGS_CSV)
    mtime = int(csv_path.stat().st_mtime) if csv_path.exists() else 0
    return f"v{version}:csv:{mtime}:{limit}"


def _csv_path() -> str:
    return SKILLSYNC_JOB_POSTINGS_CSV


def load_jobs_dataframe_from_csv(limit: int = 500) -> pd.DataFrame:
    df = pd.read_csv(_csv_path())
    df = df[df["fraudulent"] == 0].copy()
    df["full_text"] = (
        df["title"].fillna("")
        + " "
        + df["description"].fillna("")
        + " "
        + df["requirements"].fillna("")
    )
    df = df[df["full_text"].str.len() > 100].reset_index(drop=True)
    if len(df) > limit:
        df = df.sample(limit, random_state=42).reset_index(drop=True)
    return df


def load_jobs_dataframe_from_db(db: Session, limit: int = 500) -> pd.DataFrame:
    rows = (
        db.execute(
            select(Job)
            .where(Job.full_text.isnot(None))
            .where(Job.full_text != "")
            .limit(limit)
        )
        .scalars()
        .all()
    )
    if not rows:
        return pd.DataFrame()

    records = []
    for j in rows:
        records.append(
            {
                "id": j.id,
                "job_id": j.source_id,
                "title": j.title,
                "company": j.company or "",
                "location": j.location_raw or j.location or "",
                "industry": j.industry or "",
                "url": j.url or "",
                "lat": j.latitude,
                "lon": j.longitude,
                "description": j.description or "",
                "requirements": j.requirements or "",
                "full_text": j.full_text or "",
            }
        )
    df = pd.DataFrame(records)
    df = df[df["full_text"].str.len() > 100].reset_index(drop=True)
    return df


def resolve_analysis_dataframe(
    db: Optional[Session], limit: int = 500
) -> Tuple[pd.DataFrame, str]:
    """
    Returns (dataframe, source_label) where source_label is 'db' or 'csv'.
    """
    if db is not None:
        db_df = load_jobs_dataframe_from_db(db, limit=limit)
        if len(db_df) >= MIN_JOBS_FOR_DB_ANALYSIS:
            return db_df, "db"

    return load_jobs_dataframe_from_csv(limit=limit), "csv"
