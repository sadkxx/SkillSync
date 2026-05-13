# SkillSync — AI Asistan Context Dosyası

SkillSync, kullanıcıların CV'lerini yükleyerek iş ilanlarıyla NLP tabanlı eşleştirme yapmasını sağlayan bir web uygulamasıdır. FastAPI backend + React frontend mimarisi kullanır; cosine similarity ve sentence transformer modelleriyle CV–ilan uyum skoru, eksik beceriler ve alternatif pozisyon önerileri üretir. Okul projesi olarak geliştirilmektedir.

---

## Takım

| Rol | Sorumluluk |
|-----|-----------|
| Veri toplama & işleme | `fake_job_postings.csv` temizleme, veri pipeline |
| Model geliştirme | SentenceTransformer, cosine similarity, skill extractor |
| Backend geliştirme | FastAPI routes, file_parser, API entegrasyonu |
| Arayüz geliştirme | React, Tailwind, App.jsx, mock → real API geçişi |

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|----------|
| Backend framework | FastAPI 0.128 + Uvicorn |
| Dil | Python 3.12.8 |
| ML / NLP | SentenceTransformers 5.x, HuggingFace Transformers 4.x, scikit-learn |
| Doküman parse | pdfplumber, PyPDF2, python-docx |
| Veri doğrulama | Pydantic v2 |
| Frontend | React 18 + Vite 5 |
| Stil | Tailwind CSS 3 + lucide-react |
| Veri seti | `data/fake_job_postings.csv` (50 MB+, 500 örnek kullanılıyor) |
| Veritabanı | Henüz yok — `cv_store = {}` in-memory dict |

---

## Klasör Yapısı

```
SkillSync/
├── CLAUDE.md                    ← bu dosya
├── docs/
│   ├── BACKLOG.md
│   ├── ROADMAP.md
│   └── ARCHITECTURE.md
├── data/
│   └── fake_job_postings.csv    ← iş ilanı veri seti
├── backend/
│   ├── requirements.txt
│   ├── .python-version          ← 3.12.8
│   └── app/
│       ├── main.py              ← FastAPI app, CORS, startup
│       ├── api/
│       │   └── routes.py        ← /upload-cv, /analyze endpoint'leri
│       └── services/
│           ├── model.py         ← ML pipeline (embedding + matching)
│           ├── embedding.py     ← SentenceTransformer wrapper
│           ├── matcher.py       ← cosine similarity
│           ├── skill_extractor.py ← 40+ skill, string matching
│           ├── file_parser.py   ← PDF/DOCX → düz metin
│           └── preprocessing.py ← lowercase, temizleme
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx             ← React entry point
        ├── App.jsx              ← Tüm sayfalar + routing (734 satır)
        ├── index.css            ← Global stiller + animasyonlar
        ├── components/
        │   └── Header.jsx       ← Sticky nav header
        ├── services/
        │   └── analysisService.js ← API katmanı (USE_MOCK_API flag burada)
        └── data/
            └── mockAnalysis.js  ← Geliştirme için mock response
```

---

## Mimari Kurallar

1. **Servis katmanı zorunlu**: Route'lar yalnızca request/response yönetir. İş mantığı `app/services/` altında olmalı.
2. **Mock flag**: `frontend/src/services/analysisService.js` içinde `USE_MOCK_API = true` satırı var. Gerçek backend bağlantısına geçmek için `false` yapılmalı.
3. **CV in-memory**: `cv_store["latest"]` şu an tek CV tutuyor. Birden fazla kullanıcı desteği için veritabanı gerekir.
4. **Veri seti örneklemesi**: `model.py` CSV'den rastgele 500 kayıt alır (`fraudulent == 0`). Performans/doğruluk dengesi için bu sayı ayarlanabilir.
5. **Model**: `paraphrase-multilingual-MiniLM-L12-v2` — Türkçe + İngilizce CV'leri destekler. `embedding.py` ise `all-MiniLM-L6-v2` kullanıyor (tutarsızlık var, dikkat edilmeli).

---

## Mevcut Rotalar

### Backend (FastAPI — port 8000)

| Metod | Rota | Bileşen | Açıklama | Durum |
|-------|------|---------|----------|-------|
| GET | `/` | `routes.py` | Health check | Tamamlandı |
| POST | `/upload-cv` | `routes.py` + `file_parser.py` | PDF/DOCX yükle, metni çıkar, `cv_store`'a yaz | Tamamlandı |
| POST | `/analyze` | `routes.py` + `model.py` | CV + iş metni → uyum skoru + öneriler | Tamamlandı |

### Frontend (React — port 5173)

| Rota | Bileşen | Modül | Durum |
|------|---------|-------|-------|
| `/` | `LandingPage()` | Anasayfa | Tamamlandı |
| `/cv-analizi` | `AnalyzePage()` | CV Analiz | Tamamlandı (mock) |

---

## Backlog & Öncelik Sırası

1. **[KRİTİK]** US-04 — Frontend-Backend entegrasyonu (CORS + `USE_MOCK_API=false`)
2. **[YÜKSEK]** US-01 — CV Yükleme & Temel Analiz (E2E test gerekli)
3. **[YÜKSEK]** US-02 — İş İlanı Eşleştirme (top 5 sonuç, sektör istatistikleri)
4. **[ORTA]** US-03 — Eksik Beceri Önerileri (skill gap UI)
5. **[DÜŞÜK]** US-05 — UI/UX polish (büyük ölçüde tamamlandı)

---

## Stil Rehberi (Tailwind Özel Renk Paleti)

| Değişken | Hex | Kullanım |
|---------|-----|---------|
| `ink` | `#121A2F` | Koyu arka plan, birincil metin |
| `mist` | `#F5F1E8` | Açık arka plan, kart zemini |
| `ember` | `#FF7A59` | CTA butonlar, vurgu |
| `gold` | `#F4C95D` | İkincil vurgu, başarı |
| `moss` | `#75B798` | Pozitif göstergeler, eşleşme yüzdesi |
| `slate` | `#5B6476` | Yardımcı metin, meta bilgi |

---

## Önemli Notlar

- **`USE_MOCK_API = true`**: Frontend şu an gerçek backend'e bağlanmıyor. İlk entegrasyon görevinde bu flag `false` yapılmalı ve CORS ayarları `main.py`'ye eklenmeli.
- **`cv_store["latest"]`**: Tek kullanıcı senaryosu için tasarlandı. Birden fazla eşzamanlı kullanıcı sorun çıkarır.
- **500 örneklem limiti**: `model.py` her başlatmada rastgele 500 kayıt seçiyor. Sonuçlar run'dan run'a değişebilir.
- **İki farklı model**: `embedding.py` → `all-MiniLM-L6-v2`, `model.py` → `paraphrase-multilingual-MiniLM-L12-v2`. Birleştirilmeli.
- **Veri seti yolu**: CSV, `../../data/fake_job_postings.csv` ile görece yoldan yükleniyor. Deployment'ta mutlak yol veya env variable kullanılmalı.

---

## Dokümanlar

| Dosya | İçerik |
|-------|--------|
| [docs/BACKLOG.md](docs/BACKLOG.md) | User story'ler, görev tabloları, story point'ler |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Sprint planı, zaman çizelgesi |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Mimari detaylar, veri akışı, katman sorumlulukları |
