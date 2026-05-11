import pandas as pd
import PyPDF2
from docx import Document
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import os
from pathlib import Path
from typing import Optional

SKILL_LIST = [
# CV'dekiler
"python", "c", "c#", "c++", "java", "javascript", "sql",
"ms sql", "git", "github", "linux", "ubuntu", "vs code",
"visual studio", "esp32", "freertos", "uart", "i2c", "spi",
"embedded systems", "sensor", "iot", "cybersecurity",
"object-oriented programming", "oop", "database",
# Genel teknik
"machine learning", "deep learning", "nlp", "tensorflow",
"pytorch", "docker", "flask", "django", "react", "aws",
"html", "css", "agile", "scrum", "communication",
"teamwork", "leadership", "project management",
"real-time", "networking", "freertos", "rtos",
"microcontroller", "firmware", "driver"

"python", "java", "javascript",
    "fastapi", "django", "flask",
    "react", "node", "express",
    "sql", "postgresql", "mongodb",
    "docker", "kubernetes",
    "aws", "gcp", "azure",
    "git", "linux",
    "machine learning", "deep learning",
    "nlp", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch",
    "rest api", "microservices"
]

APP_DIR = Path(__file__).resolve().parents[1]  # backend/app
REPO_DIR = APP_DIR.parents[1]  # repo root (.. / ..)

# Prefer an explicit path if provided, otherwise fall back to common repo locations.
_csv_env = os.getenv("SKILLSYNC_JOB_POSTINGS_CSV")
CSV_PATH = str(
    Path(_csv_env).expanduser().resolve()
    if _csv_env
    else (
        APP_DIR / "fake_job_postings.csv"
        if (APP_DIR / "fake_job_postings.csv").exists()
        else (REPO_DIR / "data" / "fake_job_postings.csv")
    )
)

print("Model yükleniyor...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

df = pd.read_csv(CSV_PATH)
df = df[df["fraudulent"] == 0].copy()
df["full_text"] = df["title"].fillna("") + " " + \
                  df["description"].fillna("") + " " + \
                  df["requirements"].fillna("")
df = df[df["full_text"].str.len() > 100].reset_index(drop=True)
sample_df = df.sample(500, random_state=42).reset_index(drop=True)

print("İş ilanı embeddingleri hesaplanıyor...")
job_embeddings = model.encode(sample_df["full_text"].tolist(), show_progress_bar=True)
print("Hazır!")

def extract_skills(text):
    text = text.lower()
    found = []
    for skill in SKILL_LIST:
        # Match whole terms instead of substrings (e.g. avoid matching "go" inside "looking")
        pattern = re.escape(skill).replace(r"\ ", r"\s+")
        if re.search(rf"(?<!\w){pattern}(?!\w)", text):
            found.append(skill)
    return list(set(found))

def preprocess(text):
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

def extract_text_from_pdf(path):
    text = ""
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(path):
    doc = Document(path)
    return " ".join([p.text for p in doc.paragraphs])

def analiz_raporu(cv_text, cv_skills, df_scored):
    best = df_scored.iloc[0]
    best_skills = extract_skills(str(best["full_text"]))
    matched = [s for s in best_skills if s in cv_skills]
    missing = [s for s in best_skills if s not in cv_skills]
    tahmini = min(float(best["uyum_skoru"]) + len(missing) * 0.04, 1.0)

    top5 = []
    for i, row in df_scored.head(5).iterrows():
        top5.append({
            "title": str(row["title"]),
            "uyum": round(float(row["uyum_skoru"]) * 100, 1)
        })

    top_sektorler = {str(k): int(v) for k, v in df_scored["industry"].value_counts().head(5).to_dict().items()}

    return {
        "match_percentage": round(float(best["uyum_skoru"]) * 100, 1),
        "best_job": {
            "title": str(best["title"]),
            "location": str(best["location"]),
            "industry": str(best["industry"]) if pd.notna(best["industry"]) else "Belirtilmemis"
        },
        "matched_skills": matched,
        "missing_skills": missing,
        "improved_match": round(tahmini * 100, 1),
        "top5_jobs": top5,
        "alan_istatistikleri": {
            "toplam_ilan": int(len(df_scored)),
            "yuzde50_uzeri": int((df_scored["uyum_skoru"] > 0.5).sum()),
            "yuzde70_uzeri": int((df_scored["uyum_skoru"] > 0.7).sum()),
            "ortalama_uyum": round(float(df_scored["uyum_skoru"].mean()) * 100, 1)
        },
        "top_sektorler": top_sektorler
    }

def _target_job_analiz(cv_text: str, job_text: str):
    cv_skills = extract_skills(cv_text)
    job_skills = extract_skills(job_text)

    matched = [s for s in job_skills if s in cv_skills]
    missing = [s for s in job_skills if s not in cv_skills]

    cv_embedding = model.encode([preprocess(cv_text)])
    job_embedding = model.encode([preprocess(job_text)])
    sim = float(cosine_similarity(cv_embedding, job_embedding)[0][0])
    # cosine similarity is [-1, 1]; scale to [0, 1] for percentage output
    sim = (sim + 1) / 2
    sim = max(0.0, min(sim, 1.0))

    improved = min(sim + len(missing) * 0.04, 1.0)

    return {
        "match_percentage": round(sim * 100, 1),
        "matched_skills": matched,
        "missing_skills": missing,
        "improved_match": round(improved * 100, 1),
    }


def cv_analiz(cv_text: str, job_text: Optional[str] = None):
    cv_skills = extract_skills(cv_text)
    cv_embedding = model.encode([preprocess(cv_text)])
    scores = cosine_similarity(cv_embedding, job_embeddings)[0]
    # cosine similarity is [-1, 1]; scale to [0, 1] for percentage output
    scores = (scores + 1) / 2
    scores = [max(0.0, min(float(s), 1.0)) for s in scores]

    df_scored = sample_df.copy()
    df_scored["uyum_skoru"] = scores
    df_scored = df_scored.sort_values("uyum_skoru", ascending=False).reset_index(drop=True)
    dataset_result = analiz_raporu(cv_text, cv_skills, df_scored)

    if job_text and str(job_text).strip():
        dataset_result["target_job_analysis"] = _target_job_analiz(cv_text, job_text)

    return dataset_result