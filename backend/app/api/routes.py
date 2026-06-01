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
    session_id: Optional[str] = None
    job_text: Optional[str] = None
    user_lat: Optional[float] = None
    user_lon: Optional[float] = None


class AnalyzeDirectRequest(BaseModel):
    session_id: Optional[str] = None
    cv_text: str
    job_text: Optional[str] = None
    user_lat: Optional[float] = None
    user_lon: Optional[float] = None


@router.get("/")
def root():
    return {"message": "SkillSync API running"}


@router.post("/upload-cv")
async def upload_cv(
    file: UploadFile = File(...),
    job_text: Optional[str] = Form(default=None),
    session_id: Optional[str] = Form(default=None),
):
    try:
        text = await parse_file(file)
        cv_session.set_cv(text, session_id=session_id)
        cv_session.set_job_text(job_text, session_id=session_id)
        return {
            "status": "success",
            "message": "CV başarıyla yüklendi",
            "session_id": session_id,
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
    cv_text = cv_session.get_cv(session_id=request.session_id)
    if not cv_text:
        raise HTTPException(status_code=400, detail="Bu oturum için önce CV yükleyin.")

    try:
        cv_text = validate_cv_text(cv_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if request.job_text and request.job_text.strip():
        cv_session.set_job_text(request.job_text, session_id=request.session_id)
    job_text = cv_session.get_job_text(session_id=request.session_id)

    try:
        from app.services.model import cv_analiz

        return cv_analiz(
            cv_text,
            job_text=job_text,
            db=db,
            user_lat=request.user_lat,
            user_lon=request.user_lon,
        )
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

    cv_session.set_cv(cv_text, session_id=payload.session_id)
    cv_session.set_job_text(payload.job_text, session_id=payload.session_id)
    try:
        from app.services.model import cv_analiz

        return cv_analiz(
            cv_text,
            job_text=payload.job_text,
            db=db,
            user_lat=payload.user_lat,
            user_lon=payload.user_lon,
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise http_500_safe(e, context="POST /analyze-direct")
