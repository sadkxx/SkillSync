import logging
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import SKILLSYNC_JOB_POSTINGS_CSV
from app.core.db import get_db

logger = logging.getLogger("skillsync.health")

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # DB kontrolü
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.warning("Health check DB error: %s", e)
        db_status = "error"

    # CSV varlık kontrolü
    csv_exists = Path(SKILLSYNC_JOB_POSTINGS_CSV).exists()

    return {
        "status": "ok",
        "database": db_status,
        "csv_exists": csv_exists,
        "model": "lazy",
    }