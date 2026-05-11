import os
from pathlib import Path

from fastapi import FastAPI

from app.api.routes import router as api_router
from app.api.jobs import router as jobs_router
from app.core.db import Base, SessionLocal, engine

app = FastAPI(title="SkillSync API")

app.include_router(api_router)
app.include_router(jobs_router)


@app.on_event("startup")
def _startup():
    # Create tables (Alembic is recommended for production, but this keeps dev simple)
    Base.metadata.create_all(bind=engine)

    # NOTE: seeding/import is explicit via POST /jobs/seed.
    # For local convenience you can auto-seed by setting RUN_SEED_ON_STARTUP=1.
    if os.getenv("RUN_SEED_ON_STARTUP") == "1":
        from app.services.job_importer import import_jobs_from_csv

        app_dir = Path(__file__).resolve().parent  # backend/app
        repo_dir = app_dir.parents[1]
        default_csv = str(repo_dir / "data" / "fake_job_postings.csv")
        csv_path = os.getenv("SKILLSYNC_JOB_POSTINGS_CSV", default_csv)
        with SessionLocal() as db:
            import_jobs_from_csv(db, csv_path=csv_path, limit=500, source="dataset")