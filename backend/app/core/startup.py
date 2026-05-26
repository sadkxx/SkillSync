import logging
from pathlib import Path

from app.core.config import (
    BACKEND_DIR,
    DATABASE_URL,
    GEOCODE_API_KEY,
    SKILLSYNC_JOB_POSTINGS_CSV,
)

logger = logging.getLogger("skillsync.startup")


def run_startup_checks() -> None:
    if not GEOCODE_API_KEY:
        logger.warning(
            "GEOCODE_API_KEY is not set. /jobs/map may return empty until geocoding is configured."
        )

    csv_path = Path(SKILLSYNC_JOB_POSTINGS_CSV)
    if not csv_path.exists():
        logger.warning("Job postings CSV not found at %s (seed dataset will fail).", csv_path)

    if DATABASE_URL.startswith("sqlite"):
        logger.info("SQLite database in use. Start uvicorn from backend/ for a stable DB path.")

    logger.info("SkillSync backend ready (config loaded from %s)", BACKEND_DIR)
