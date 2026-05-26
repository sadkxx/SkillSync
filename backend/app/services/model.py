import logging
import re
from typing import Optional, Tuple

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.core.config import ANALYSIS_CORPUS_LIMIT, CORPUS_CACHE_MAX_ENTRIES
from app.core import corpus_cache
from app.services.job_corpus import build_corpus_cache_key, resolve_analysis_dataframe

logger = logging.getLogger("skillsync.model")

# Deduplicated skill list (word-boundary matching in extract_skills)
SKILL_LIST = sorted(
    set(
        [
            "python", "c", "c#", "c++", "java", "javascript", "typescript",
            "sql", "ms sql", "postgresql", "mongodb", "database",
            "git", "github", "linux", "ubuntu", "docker", "kubernetes",
            "fastapi", "django", "flask", "react", "node", "express",
            "rest api", "microservices", "aws", "gcp", "azure",
            "machine learning", "deep learning", "nlp", "pandas", "numpy",
            "scikit-learn", "tensorflow", "pytorch",
            "html", "css", "agile", "scrum",
            "communication", "teamwork", "leadership", "project management",
            "embedded systems", "iot", "cybersecurity", "oop",
            "object-oriented programming", "real-time", "networking",
        ]
    ),
    key=len,
    reverse=True,
)

_model: Optional[SentenceTransformer] = None

corpus_cache.configure_max_entries(CORPUS_CACHE_MAX_ENTRIES)


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info("Loading SentenceTransformer model...")
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model


def invalidate_corpus_cache() -> None:
    """Call after /jobs/seed so the next analysis uses fresh DB data."""
    corpus_cache.clear_corpus_cache()


def _get_corpus(db: Optional[Session], limit: int = 500) -> Tuple[pd.DataFrame, np.ndarray, str]:
    limit = min(limit, ANALYSIS_CORPUS_LIMIT)
    cache_key = build_corpus_cache_key(db, limit)
    cached = corpus_cache.get_cached(cache_key)
    if cached is not None:
        return cached

    df, source = resolve_analysis_dataframe(db, limit=limit)
    if df.empty:
        raise RuntimeError(
            "No job corpus available. Run POST /jobs/seed or ensure CSV exists."
        )

    embeddings = _get_model().encode(df["full_text"].tolist(), show_progress_bar=False)
    corpus_cache.set_cached(cache_key, (df, embeddings, source))
    return df, embeddings, source


def extract_skills(text: str) -> list[str]:
    text = text.lower()
    found = []
    for skill in SKILL_LIST:
        pattern = re.escape(skill).replace(r"\ ", r"\s+")
        if re.search(rf"(?<!\w){pattern}(?!\w)", text):
            found.append(skill)
    return list(set(found))


def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s]", "", text)
    return text.strip()


def _scale_cosine(score: float) -> float:
    return max(0.0, min((float(score) + 1.0) / 2.0, 1.0))


def analiz_raporu(cv_text: str, cv_skills: list[str], df_scored: pd.DataFrame) -> dict:
    best = df_scored.iloc[0]
    best_skills = extract_skills(str(best["full_text"]))
    matched = [s for s in best_skills if s in cv_skills]
    missing = [s for s in best_skills if s not in cv_skills]
    tahmini = min(float(best["uyum_skoru"]) + len(missing) * 0.04, 1.0)

    top5 = []
    for _, row in df_scored.head(5).iterrows():
        top5.append(
            {
                "title": str(row["title"]),
                "uyum": round(float(row["uyum_skoru"]) * 100, 1),
            }
        )

    top_sektorler = {
        str(k): int(v)
        for k, v in df_scored["industry"].value_counts().head(5).to_dict().items()
    }

    return {
        "match_percentage": round(float(best["uyum_skoru"]) * 100, 1),
        "best_job": {
            "title": str(best["title"]),
            "location": str(best.get("location", "")),
            "industry": str(best["industry"]) if pd.notna(best.get("industry")) else "Belirtilmemis",
        },
        "matched_skills": matched,
        "missing_skills": missing,
        "improved_match": round(tahmini * 100, 1),
        "top5_jobs": top5,
        "alan_istatistikleri": {
            "toplam_ilan": int(len(df_scored)),
            "yuzde50_uzeri": int((df_scored["uyum_skoru"] > 0.5).sum()),
            "yuzde70_uzeri": int((df_scored["uyum_skoru"] > 0.7).sum()),
            "ortalama_uyum": round(float(df_scored["uyum_skoru"].mean()) * 100, 1),
        },
        "top_sektorler": top_sektorler,
    }


def _target_job_analiz(cv_text: str, job_text: str) -> dict:
    cv_skills = extract_skills(cv_text)
    job_skills = extract_skills(job_text)

    matched = [s for s in job_skills if s in cv_skills]
    missing = [s for s in job_skills if s not in cv_skills]

    model = _get_model()
    cv_embedding = model.encode([preprocess(cv_text)])
    job_embedding = model.encode([preprocess(job_text)])
    sim = _scale_cosine(float(cosine_similarity(cv_embedding, job_embedding)[0][0]))
    improved = min(sim + len(missing) * 0.04, 1.0)

    return {
        "match_percentage": round(sim * 100, 1),
        "matched_skills": matched,
        "missing_skills": missing,
        "improved_match": round(improved * 100, 1),
    }


def cv_analiz(
    cv_text: str,
    job_text: Optional[str] = None,
    db: Optional[Session] = None,
) -> dict:
    """
    Compare CV against the job corpus (DB first, CSV fallback) and optionally
    against a user-provided target job posting text.
    """
    cv_skills = extract_skills(cv_text)
    sample_df, job_embeddings, corpus_source = _get_corpus(db)

    model = _get_model()
    cv_embedding = model.encode([preprocess(cv_text)])
    scores = cosine_similarity(cv_embedding, job_embeddings)[0]
    scores = [_scale_cosine(s) for s in scores]

    df_scored = sample_df.copy()
    df_scored["uyum_skoru"] = scores
    df_scored = df_scored.sort_values("uyum_skoru", ascending=False).reset_index(drop=True)

    dataset_result = analiz_raporu(cv_text, cv_skills, df_scored)
    dataset_result["corpus_source"] = corpus_source

    if job_text and str(job_text).strip():
        dataset_result["target_job_analysis"] = _target_job_analiz(cv_text, job_text)

    return dataset_result
