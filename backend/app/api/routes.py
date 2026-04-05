from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.preprocessing import preprocess_text
from app.services.embedding import get_embedding
from app.services.matcher import calculate_similarity
from app.services.file_parser import parse_file
from app.services.skill_extractor import find_missing_skills, get_alternative_jobs, get_market_info

router = APIRouter()

cv_store = {}

class MatchRequest(BaseModel):
    cv_text: str
    job_text: str

class AnalyzeRequest(BaseModel):
    job_text: str

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
def analyze(request: AnalyzeRequest):
    if "latest" not in cv_store:
        raise HTTPException(status_code=400, detail="Once CV yukleyin.")
    try:
        cv_text = cv_store["latest"]
        cv_clean = preprocess_text(cv_text)
        job_clean = preprocess_text(request.job_text)
        cv_vec = get_embedding(cv_clean)
        job_vec = get_embedding(job_clean)
        score = calculate_similarity(cv_vec, job_vec)
        match_percentage = round(score * 100, 2)
        missing = find_missing_skills(cv_text, request.job_text)
        improved = round(min(match_percentage + len(missing) * 3, 100), 2)
        alternative_jobs = get_alternative_jobs(cv_text)
        market_info = get_market_info(request.job_text)
        return {
            "match_percentage": match_percentage,
            "missing_skills": missing,
            "improved_match": improved,
            "alternative_jobs": alternative_jobs,
            "market_info": market_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match")
def match_cv_job(request: MatchRequest):
    cv_clean = preprocess_text(request.cv_text)
    job_clean = preprocess_text(request.job_text)
    cv_vec = get_embedding(cv_clean)
    job_vec = get_embedding(job_clean)
    score = calculate_similarity(cv_vec, job_vec)
    return {
        "matching_score": round(score * 100, 2),
        "status": "success"
    }