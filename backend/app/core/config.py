import logging
import os
from pathlib import Path

from dotenv import load_dotenv

# backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_DIR = BACKEND_DIR.parent

load_dotenv(BACKEND_DIR / ".env")

_log = logging.getLogger("skillsync.config")


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        _log.warning("Invalid %s=%r; using default %s", name, raw, default)
        return default


# Resolve SQLite to an absolute path under backend/ (avoids cwd surprises)
_raw_db = os.getenv("DATABASE_URL", "sqlite:///./skillsync.db")
if _raw_db.startswith("sqlite:///./"):
    _db_file = BACKEND_DIR / "skillsync.db"
    DATABASE_URL = f"sqlite:///{_db_file}"
else:
    DATABASE_URL = _raw_db

GEOCODE_API_KEY = os.getenv("GEOCODE_API_KEY")
SKILLSYNC_JOB_POSTINGS_CSV = os.getenv(
    "SKILLSYNC_JOB_POSTINGS_CSV",
    str(REPO_DIR / "data" / "fake_job_postings.csv"),
)
RUN_SEED_ON_STARTUP = os.getenv("RUN_SEED_ON_STARTUP") == "1"

_default_origins = "http://localhost:5173,http://localhost:3000"
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if o.strip()
]

MIN_JOBS_FOR_DB_ANALYSIS = _env_int("MIN_JOBS_FOR_DB_ANALYSIS", 10)
MIN_CV_TEXT_LENGTH = _env_int("MIN_CV_TEXT_LENGTH", 50)
MAX_UPLOAD_BYTES = _env_int("MAX_UPLOAD_BYTES", 10 * 1024 * 1024)
CORPUS_CACHE_MAX_ENTRIES = _env_int("CORPUS_CACHE_MAX_ENTRIES", 4)
SEED_DEFAULT_LIMIT = _env_int("SEED_DEFAULT_LIMIT", 100)
SEED_MAX_SAFE_LIMIT = _env_int("SEED_MAX_SAFE_LIMIT", 300)
GEOCODE_TIMEOUT_SECONDS = _env_int("GEOCODE_TIMEOUT_SECONDS", 5)
ANALYSIS_CORPUS_LIMIT = _env_int("ANALYSIS_CORPUS_LIMIT", 500)
