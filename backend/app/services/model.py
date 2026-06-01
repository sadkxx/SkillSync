import logging
import html
import math
import re
from typing import Optional, Tuple
from urllib.parse import quote_plus

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

_CITY_COORDS = {
    "new york": (40.7128, -74.0060),
    "london": (51.5074, -0.1278),
    "berlin": (52.5200, 13.4050),
    "san francisco": (37.7749, -122.4194),
    "washington": (38.9072, -77.0369),
    "sydney": (-33.8688, 151.2093),
    "singapore": (1.3521, 103.8198),
    "toronto": (43.6532, -79.3832),
    "austin": (30.2672, -97.7431),
    "phoenix": (33.4484, -112.0740),
    "istanbul": (41.0082, 28.9784),
    "ankara": (39.9334, 32.8597),
    "izmir": (38.4237, 27.1428),
    "auckland": (-36.8509, 174.7645),
    "chicago": (41.8781, -87.6298),
    "boston": (42.3601, -71.0589),
    "seattle": (47.6062, -122.3321),
    "los angeles": (34.0522, -118.2437),
    "st. louis": (38.6270, -90.1994),
    "orlando": (28.5383, -81.3792),
    "jersey city": (40.7178, -74.0431),
    "tel aviv": (32.0853, 34.7818),
    "new jersey": (40.0583, -74.4057),
    "california": (36.7783, -119.4179),
    "florida": (27.6648, -81.5158),
    "texas": (31.9686, -99.9018),
    "usa northeast": (42.0000, -75.0000),
}

_COUNTRY_COORDS = {
    "us": (39.8283, -98.5795),
    "united states": (39.8283, -98.5795),
    "gb": (55.3781, -3.4360),
    "united kingdom": (55.3781, -3.4360),
    "de": (51.1657, 10.4515),
    "germany": (51.1657, 10.4515),
    "tr": (38.9637, 35.2433),
    "turkey": (38.9637, 35.2433),
    "ca": (56.1304, -106.3468),
    "canada": (56.1304, -106.3468),
    "au": (-25.2744, 133.7751),
    "australia": (-25.2744, 133.7751),
    "nz": (-40.9006, 174.8860),
    "new zealand": (-40.9006, 174.8860),
    "sg": (1.3521, 103.8198),
}


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


def _safe_text(value: object, default: str = "") -> str:
    if value is None or pd.isna(value):
        return default
    text = str(value).strip()
    return text if text else default


def _safe_float(value: object) -> Optional[float]:
    if value is None or pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _compact_text(value: object, limit: int = 520) -> str:
    text = _safe_text(value)
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"#URL_[A-Za-z0-9_]+#", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].strip() + "..."


def _coords_from_location(location: str) -> Tuple[Optional[float], Optional[float]]:
    normalized = location.lower()
    for key, coords in _CITY_COORDS.items():
        if key in normalized:
            return coords

    parts = [p.strip().lower() for p in location.split(",") if p.strip()]
    for part in parts:
        if part in _COUNTRY_COORDS:
            return _COUNTRY_COORDS[part]
    return (None, None)


def _job_coords(row: pd.Series) -> Tuple[Optional[float], Optional[float]]:
    lat = _safe_float(row.get("lat", row.get("latitude")))
    lon = _safe_float(row.get("lon", row.get("longitude")))
    if lat is not None and lon is not None:
        return (lat, lon)
    return _coords_from_location(_safe_text(row.get("location")))


def _distance_km(
    lat1: Optional[float],
    lon1: Optional[float],
    lat2: Optional[float],
    lon2: Optional[float],
) -> Optional[float]:
    if None in (lat1, lon1, lat2, lon2):
        return None
    radius_km = 6371.0
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lon2) - float(lon1))
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return round(radius_km * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


def _map_url(title: str, company: str, location: str, lat: Optional[float], lon: Optional[float]) -> str:
    if lat is not None and lon is not None:
        return f"https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=12/{lat}/{lon}"
    query = quote_plus(" ".join(filter(None, [company, title, location])))
    return f"https://www.openstreetmap.org/search?query={query}"


def _clean_location_label(location: str) -> str:
    parts = [p.strip() for p in location.split(",") if p.strip()]
    if not parts:
        return "Konum belirtilmemis"
    if len(parts) >= 2:
        city = parts[-1]
        country = parts[0]
        return f"{city}, {country}"
    return parts[0]


def _extract_company_from_profile(profile: str) -> Optional[str]:
    if not profile:
        return None

    text = " ".join(profile.replace("\xa0", " ").replace("\u2019", "'").split())
    suffix_match = re.search(
        r"\b([A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,3}\s+"
        r"(?:LLC|Inc|Ltd|AG|GmbH|Corporation|Corp|Solutions|Software|Services))\b",
        text,
    )
    if suffix_match:
        return suffix_match.group(1).strip(" .,'")

    patterns = [
        r"^(?:We're|We are)\s+([A-Z0-9][A-Za-z0-9&.'-]*(?:\s+[A-Z0-9][A-Za-z0-9&.'-]*){0,3})\b",
        r"^([A-Z0-9][A-Za-z0-9&.'-]*(?:\s+[A-Z0-9][A-Za-z0-9&.'-]*){0,3})(?:\s+(?:is|are|provides|offers|develops|creates|builds)|,)",
        r"\b([A-Z][A-Za-z0-9&.'-]{2,})'s\b",
        r"\b(?:at|by)\s+([A-Z0-9][A-Za-z0-9&.'-]*(?:\s+[A-Z0-9][A-Za-z0-9&.'-]*){0,3})\b",
    ]
    blocked = {"Our", "The", "This", "We", "Founded", "Headquartered"}
    for pattern in patterns:
        match = re.search(pattern, text)
        if not match:
            continue
        candidate = match.group(1).strip(" .,'")
        first = candidate.split()[0] if candidate else ""
        if first not in blocked and len(candidate) <= 48:
            return candidate
    return None


def _work_model(location: str, text: str) -> str:
    lowered = f"{location} {text}".lower()
    if "remote" in lowered or "uzaktan" in lowered:
        return "Uzaktan"
    if "hybrid" in lowered or "hibrit" in lowered:
        return "Hibrit"
    return "Ofis"


def _company_from_row(row: pd.Series) -> Tuple[str, bool]:
    company = _safe_text(row.get("company"))
    if company and len(company) <= 48 and len(company.split()) <= 6:
        return company[:80], True
    profile = _safe_text(row.get("company_profile"))
    extracted = _extract_company_from_profile(profile)
    if extracted:
        return extracted, True
    return "", False


def _display_org_label(company: str, company_known: bool, industry: str, location: str, title: str) -> str:
    if company_known:
        return company
    if industry and industry != "Belirtilmemis":
        return f"{industry} pozisyonu"
    words = [w for w in re.split(r"\s+", title) if w]
    if words:
        return " ".join(words[:3])
    return _clean_location_label(location)


def _job_payload(
    row: pd.Series,
    cv_skills: list[str],
    *,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
) -> dict:
    title = _safe_text(row.get("title"), "Baslik belirtilmemis")
    location = _safe_text(row.get("location"), "Konum belirtilmemis")
    industry = _safe_text(row.get("industry"), "Belirtilmemis")
    location_label = _clean_location_label(location)
    company, company_known = _company_from_row(row)
    display_company = _display_org_label(company, company_known, industry, location, title)
    full_text = _safe_text(row.get("full_text"))
    job_skills = extract_skills(full_text)
    matched = [s for s in job_skills if s in cv_skills]
    missing = [s for s in job_skills if s not in cv_skills]
    lat, lon = _job_coords(row)
    distance = _distance_km(user_lat, user_lon, lat, lon)
    raw_id = row.get("id", row.get("job_id", title))
    job_id = _safe_text(raw_id, title)

    payload = {
        "id": job_id,
        "title": title,
        "company": display_company,
        "company_name": company,
        "company_known": company_known,
        "display_company": display_company,
        "location": location,
        "location_label": location_label,
        "industry": industry,
        "match_score": round(float(row["uyum_skoru"]) * 100, 1),
        "uyum": round(float(row["uyum_skoru"]) * 100, 1),
        "lat": lat,
        "lon": lon,
        "distance_km": distance,
        "work_model": _work_model(location, full_text),
        "salary_range": _safe_text(row.get("salary_range"), "Belirtilmemis"),
        "department": _safe_text(row.get("department")),
        "employment_type": _safe_text(row.get("employment_type")),
        "required_experience": _safe_text(row.get("required_experience")),
        "required_education": _safe_text(row.get("required_education")),
        "function": _safe_text(row.get("function")),
        "description": _compact_text(row.get("description"), limit=650),
        "requirements": _compact_text(row.get("requirements"), limit=520),
        "benefits": _compact_text(row.get("benefits"), limit=380),
        "matched_skills": matched,
        "missing_skills": missing,
        "url": _safe_text(row.get("url")),
        "map_url": _map_url(title, display_company, location, lat, lon),
    }
    return payload


def _build_market_info(stats: dict, sectors: dict) -> str:
    parts = []
    total = stats.get("toplam_ilan")
    if isinstance(total, int):
        parts.append(f"Veri setinde {total} ilan NLP modeliyle karsilastirildi.")
    avg = stats.get("ortalama_uyum")
    if isinstance(avg, (int, float)):
        parts.append(f"Ortalama uyum seviyesi %{avg}.")
    if sectors:
        top = ", ".join([f"{k} ({v})" for k, v in list(sectors.items())[:3]])
        parts.append(f"One cikan sektorler: {top}.")
    return " ".join(parts) or "Piyasa ozeti hazirlanamadi."


def _nearby_jobs(
    df_scored: pd.DataFrame,
    cv_skills: list[str],
    user_lat: Optional[float],
    user_lon: Optional[float],
    limit: int = 5,
) -> list[dict]:
    jobs = [
        _job_payload(row, cv_skills, user_lat=user_lat, user_lon=user_lon)
        for _, row in df_scored.iterrows()
    ]
    with_coords = [j for j in jobs if j["lat"] is not None and j["lon"] is not None]
    if user_lat is not None and user_lon is not None:
        with_distance = [j for j in with_coords if j["distance_km"] is not None]
        top_score = max((j["match_score"] for j in jobs), default=0)
        close_score_cutoff = max(55.0, top_score - 18.0)
        good_matches = [j for j in with_distance if j["match_score"] >= close_score_cutoff]
        sortable = good_matches if len(good_matches) >= limit else with_distance
        sortable.sort(key=lambda j: (-j["match_score"], j["distance_km"]))
        if sortable:
            return sortable[:limit]
    fallback = with_coords or jobs
    fallback.sort(key=lambda j: -j["match_score"])
    return fallback[:limit]


def analiz_raporu(
    cv_text: str,
    cv_skills: list[str],
    df_scored: pd.DataFrame,
    *,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
) -> dict:
    best = df_scored.iloc[0]
    best_skills = extract_skills(str(best["full_text"]))
    matched = [s for s in best_skills if s in cv_skills]
    missing = [s for s in best_skills if s not in cv_skills]
    tahmini = min(float(best["uyum_skoru"]) + len(missing) * 0.04, 1.0)

    top5 = [
        _job_payload(row, cv_skills, user_lat=user_lat, user_lon=user_lon)
        for _, row in df_scored.head(5).iterrows()
    ]

    top_sektorler = {
        str(k): int(v)
        for k, v in df_scored["industry"].value_counts().head(5).to_dict().items()
    }

    stats = {
        "toplam_ilan": int(len(df_scored)),
        "yuzde50_uzeri": int((df_scored["uyum_skoru"] > 0.5).sum()),
        "yuzde70_uzeri": int((df_scored["uyum_skoru"] > 0.7).sum()),
        "ortalama_uyum": round(float(df_scored["uyum_skoru"].mean()) * 100, 1),
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
        "alternative_jobs": list(dict.fromkeys([j["title"] for j in top5 if j["title"]]))[:3],
        "nearby_jobs": _nearby_jobs(df_scored, cv_skills, user_lat, user_lon),
        "alan_istatistikleri": stats,
        "top_sektorler": top_sektorler,
        "market_info": _build_market_info(stats, top_sektorler),
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
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
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

    dataset_result = analiz_raporu(
        cv_text,
        cv_skills,
        df_scored,
        user_lat=user_lat,
        user_lon=user_lon,
    )
    dataset_result["corpus_source"] = corpus_source
    if user_lat is not None and user_lon is not None:
        dataset_result["user_location"] = {"lat": user_lat, "lon": user_lon}
    else:
        dataset_result["user_location"] = None

    if job_text and str(job_text).strip():
        target_result = _target_job_analiz(cv_text, job_text)
        dataset_result["target_job_analysis"] = target_result
        dataset_result["dataset_match_percentage"] = dataset_result["match_percentage"]
        dataset_result["dataset_matched_skills"] = dataset_result["matched_skills"]
        dataset_result["dataset_missing_skills"] = dataset_result["missing_skills"]
        dataset_result["dataset_improved_match"] = dataset_result["improved_match"]
        dataset_result.update(target_result)

    return dataset_result
