# SkillSync

SkillSync, CV ile iş ilanı metni arasındaki uyumu NLP tabanlı analiz eden bir web uygulamasıdır. Kullanıcı CV dosyasını yükler, başvurmak istediği iş ilanı metnini yapıştırır ve sistem uyum skoru, eşleşen beceriler, eksik beceriler, önerilen roller ve dataset üzerinden seçilen yakın ilanları gösterir.

## Özellikler

- PDF/DOCX CV yükleme
- İş ilanı metni ile gerçek NLP/embedding tabanlı eşleşme analizi
- Top-level uyum skoru, eşleşen beceriler ve eksik beceriler
- Dataset ilanlarından en uygun rol/ilan önerileri
- Kullanıcı konumu izinliyse yakın ilanların harita üzerinde gösterimi
- Login gerektirmeyen `session_id` tabanlı CV izolasyonu
- FastAPI backend ve React/Vite frontend

## Teknoloji

| Katman | Teknoloji |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Leaflet |
| Backend | FastAPI, SQLAlchemy |
| NLP | SentenceTransformers, scikit-learn cosine similarity |
| Dosya okuma | pdfplumber, python-docx |
| Veri | `data/fake_job_postings.csv` |

## Proje Yapısı

```text
SkillSync/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # HTTP endpointleri
│   │   ├── core/            # config, db, startup
│   │   ├── models/          # SQLAlchemy modelleri
│   │   └── services/        # NLP, dosya parse, session, dataset servisleri
│   ├── tests/               # backend testleri
│   ├── requirements.txt
│   └── railway.json         # Railway deploy config
├── frontend/                # React/Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── fake_job_postings.csv
├── docs/
└── netlify.toml             # Netlify deploy config
```

## Local Çalıştırma

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend varsayılan olarak:

```text
http://127.0.0.1:8000
```

Kontrol:

```bash
curl http://127.0.0.1:8000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak:

```text
http://localhost:5173
```

Local gerçek backend kullanımı için frontend env:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Ortam Değişkenleri

### Backend

| Değişken | Açıklama | Örnek |
|---|---|---|
| `ALLOWED_ORIGINS` | Frontend domainleri için CORS izni | `https://skillsync.netlify.app` |
| `DATABASE_URL` | SQLite/PostgreSQL bağlantısı | `sqlite:///./skillsync.db` |
| `SKILLSYNC_JOB_POSTINGS_CSV` | Dataset dosya yolu | `data/fake_job_postings.csv` |
| `RUN_SEED_ON_STARTUP` | Başlangıçta DB seed çalıştırma | `0` |
| `ANALYSIS_CORPUS_LIMIT` | Analizde taranacak ilan limiti | `500` |
| `GEOCODE_API_KEY` | Opsiyonel geocoding anahtarı | boş bırakılabilir |

### Frontend

| Değişken | Açıklama | Örnek |
|---|---|---|
| `VITE_API_BASE_URL` | Railway backend URL'i | `https://skill-sync.up.railway.app` |
| `VITE_USE_MOCK_API` | Mock API kullanımı | `false` |

## Test

Backend testleri:

```bash
cd backend
source .venv/bin/activate
pytest tests
```

Beklenen sonuç:

```text
7 passed
```

Frontend production build:

```bash
cd frontend
npm run build
```

Vite chunk size uyarısı görülebilir; bu demo için bloklayıcı değildir.

## Deploy

### Railway Backend

Railway'de backend service için root directory:

```text
backend
```

Start command `backend/railway.json` içinde tanımlıdır:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Railway variables:

```env
ALLOWED_ORIGINS=https://NETLIFY_DOMAININ.netlify.app
RUN_SEED_ON_STARTUP=0
ANALYSIS_CORPUS_LIMIT=500
```

Deploy sonrası kontrol:

```text
https://RAILWAY_BACKEND_URL/health
```

### Netlify Frontend

`netlify.toml` frontend klasörünü build base olarak ayarlar.

Netlify variables:

```env
VITE_API_BASE_URL=https://RAILWAY_BACKEND_URL
VITE_USE_MOCK_API=false
```

Env değişkenleri eklendikten sonra Netlify'da yeniden deploy gerekir.

## Demo Notları

- İlk analiz model yükleme nedeniyle yavaş olabilir. Sunumdan önce bir CV + ilan ile warm-up analizi yapmak iyi olur.
- Login sistemi yoktur. CV karışmasını önlemek için frontend `localStorage` üzerinden `session_id` üretir ve backend CV'yi session bazlı tutar.
- Backend process restart olursa in-memory CV sessionları silinir. Kullanıcı tekrar CV yüklemelidir.
- Harita OpenStreetMap/Leaflet ile çalışır; konum izni reddedilirse analiz devam eder, yakın ilanlar mesafesiz gösterilebilir.

## Ana Endpointler

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/` | API ayakta mı kontrolü |
| `GET` | `/health` | Health check |
| `POST` | `/upload-cv` | CV upload |
| `POST` | `/analyze` | Yüklenen CV + ilan metni analizi |
| `POST` | `/analyze-direct` | CV metni + ilan metni ile direkt analiz |

## Dokümantasyon

- [Backend README](backend/README.md)
- [Analiz Çıktısı Rehberi](docs/ANALYSIS_OUTPUT_GUIDE.md)
- [Mimari Dokümantasyon](docs/ARCHITECTURE.md)
