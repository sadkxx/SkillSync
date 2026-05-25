from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Form, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.api_errors import http_500_safe
from app.core.db import get_db
from app.services import cv_session
from app.services.file_parser import parse_file, validate_cv_text

router = APIRouter()


class AnalyzeRequest(BaseModel):
    job_text: Optional[str] = None


class AnalyzeDirectRequest(BaseModel):
    cv_text: str
    job_text: Optional[str] = None


@router.get("/")
def root():
    return {"message": "SkillSync API running"}


@router.post("/upload-cv")
async def upload_cv(
    file: UploadFile = File(...),
    job_text: Optional[str] = Form(default=None),
):
    try:
        text = await parse_file(file)
        cv_session.set_cv(text)
        cv_session.set_job_text(job_text)
        return {
            "status": "success",
            "message": "CV basariyla yuklendi",
            "char_count": len(text),
            "job_text_char_count": len(job_text) if job_text else 0,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze")
def analyze(
    request: AnalyzeRequest = Body(default_factory=AnalyzeRequest),
    db: Session = Depends(get_db),
):
    cv_text = cv_session.get_cv()
    if not cv_text:
        raise HTTPException(status_code=400, detail="Once CV yukleyin.")

    try:
        cv_text = validate_cv_text(cv_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if request.job_text and request.job_text.strip():
        cv_session.set_job_text(request.job_text)
    job_text = cv_session.get_job_text()

    try:
        from app.services.model import cv_analiz

        return cv_analiz(cv_text, job_text=job_text, db=db)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise http_500_safe(e, context="POST /analyze")


@router.post("/analyze-direct")
def analyze_direct(
    payload: AnalyzeDirectRequest = Body(...),
    db: Session = Depends(get_db),
):
    try:
        cv_text = validate_cv_text(payload.cv_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    cv_session.set_cv(cv_text)
    cv_session.set_job_text(payload.job_text)
    try:
        from app.services.model import cv_analiz

        return cv_analiz(cv_text, job_text=payload.job_text, db=db)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise http_500_safe(e, context="POST /analyze-direct")
