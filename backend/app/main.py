from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.jobs import router as jobs_router
from app.api.health import router as health_router
from app.core.config import ALLOWED_ORIGINS, RUN_SEED_ON_STARTUP, SKILLSYNC_JOB_POSTINGS_CSV
from app.core.db import Base, SessionLocal, engine
from app.core.logging_config import setup_logging
from app.core.startup import run_startup_checks

setup_logging()

app = FastAPI(title="SkillSync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(jobs_router)
app.include_router(health_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Invalid request body. /analyze expects JSON; /upload-cv expects multipart form-data."
        },
    )


@app.on_event("startup")
def _startup():
    Base.metadata.create_all(bind=engine)
    run_startup_checks()

    if RUN_SEED_ON_STARTUP:
        from app.services.job_importer import import_jobs_from_csv
        from app.services.model import invalidate_corpus_cache

        with SessionLocal() as db:
            import_jobs_from_csv(
                db, csv_path=SKILLSYNC_JOB_POSTINGS_CSV, limit=100, source="dataset"
            )
            invalidate_corpus_cache()
