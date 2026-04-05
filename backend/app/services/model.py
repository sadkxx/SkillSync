import pandas as pd
import PyPDF2
from docx import Document
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import os

SKILL_LIST = [
    "python", "c", "c#", "c++", "java", "javascript", "sql",
    "ms sql", "git", "github", "linux", "ubuntu", "vs code",
    "visual studio", "esp32", "freertos", "uart", "i2c", "spi",
    "embedded systems", "sensor", "iot", "cybersecurity",
    "object-oriented programming", "oop", "database",
    "machine learning", "deep learning", "nlp", "tensorflow",
    "pytorch", "docker", "flask", "django", "react", "aws",
    "html", "css", "agile", "scrum", "communication",
    "teamwork", "leadership", "project management",
    "real-time", "networking", "rtos",
    "microcontroller", "firmware", "driver"
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "fake_job_postings.csv")

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
    return list(set([s for s in SKILL_LIST if s in text]))

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

def cv_analiz(cv_text):
    cv_skills = extract_skills(cv_text)
    cv_embedding = model.encode([preprocess(cv_text)])
    scores = cosine_similarity(cv_embedding, job_embeddings)[0]
    df_scored = sample_df.copy()
    df_scored["uyum_skoru"] = scores
    df_scored = df_scored.sort_values("uyum_skoru", ascending=False).reset_index(drop=True)
    return analiz_raporu(cv_text, cv_skills, df_scored)