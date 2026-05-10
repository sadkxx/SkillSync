from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Form
from pydantic import BaseModel
from app.services.file_parser import parse_file

router = APIRouter()

cv_store = {}

class AnalyzeRequest(BaseModel):
    # Direct testing without uploading a file
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
        cv_store["latest"] = text
        if job_text and job_text.strip():
            cv_store["job_latest"] = job_text
        return {
            "status": "success",
            "message": "CV basariyla yuklendi",
            "char_count": len(text),
            "job_text_char_count": len(job_text) if job_text else 0,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze")
def analyze():
    """
    Main flow:
    1) Upload CV via /upload-cv (file)
    2) Optionally include job_text in /upload-cv
    3) Call /analyze (no parameters)
    """
    cv_text = cv_store.get("latest")
    if not cv_text:
        raise HTTPException(status_code=400, detail="Once CV yukleyin.")

    job_text = cv_store.get("job_latest")
    try:
        # Lazy import so the API can start even if the ML model can't download at startup.
        from app.services.model import cv_analiz

        result = cv_analiz(cv_text, job_text=job_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-direct")
def analyze_direct(payload: AnalyzeRequest = Body(...)):
    """
    Debug/test flow without file upload.
    """
    if payload.job_text and payload.job_text.strip():
        cv_store["job_latest"] = payload.job_text
    try:
        from app.services.model import cv_analiz

        return cv_analiz(payload.cv_text, job_text=payload.job_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))