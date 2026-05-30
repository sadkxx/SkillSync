# SkillSync Backend

FastAPI tabanlı backend. CV yükleme, NLP analizi ve iş ilanı eşleştirme işlemlerini yönetir.

## Gereksinimler

- Python 3.10+
- pip

## Kurulum

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     
pip install -r requirements.txt
```

## Başlatma

```bash
uvicorn app.main:app --reload
```

## Swagger Dokümantasyonu
http://127.0.0.1:8000/docs

## Dataset

`data/fake_job_postings.csv` dosyası gereklidir. Backend başlarken otomatik kontrol edilir.

İlanları DB'ye aktarmak için:
POST /jobs/seed

## Ortam Değişkenleri (opsiyonel)

`.env` dosyası oluşturarak aşağıdaki değişkenleri ayarlayabilirsiniz:

| Değişken | Açıklama | Varsayılan |
|---|---|---|
| `DATABASE_URL` | SQLite veya PostgreSQL bağlantı URL'i | `sqlite:///./skillsync.db` |
| `SKILLSYNC_JOB_POSTINGS_CSV` | Dataset dosya yolu | `data/fake_job_postings.csv` |
| `ALLOWED_ORIGINS` | CORS izin verilen originler (virgülle ayrılmış) | `*` |
| `GEOCODE_API_KEY` | Geocoding API anahtarı (harita özelliği için) | — |
| `RUN_SEED_ON_STARTUP` | Başlangıçta otomatik seed çalıştır | `false` |
