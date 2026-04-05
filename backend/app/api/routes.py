from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_parser import parse_file
from app.services.model import cv_analiz

router = APIRouter()

cv_store = {}

@router.get("/")
def root():
    return {"message": "SkillSync API running"}

@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    try:
        text = await parse_file(file)
        cv_store["latest"] = text
        return {
            "status": "success",
            "message": "CV basariyla yuklendi",
            "char_count": len(text)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze")
def analyze():
    if "latest" not in cv_store:
        raise HTTPException(status_code=400, detail="Once CV yukleyin.")
    try:
        result = cv_analiz(cv_store["latest"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))