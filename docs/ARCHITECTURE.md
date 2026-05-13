# SkillSync — Mimari Dokümantasyonu

---

## Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Rol |
|--------|----------|---------|-----|
| Backend framework | FastAPI | 0.128.8 | REST API sunucusu |
| ASGI sunucu | Uvicorn | 0.39.0 | HTTP sunucu runtime |
| Dil | Python | 3.12.8 | Backend dili |
| Semantic embedding | SentenceTransformers | 5.1.2 | Metin vektörizasyonu |
| ML framework | Transformers (HuggingFace) | 4.57.6 | Model yükleme |
| Derin öğrenme | PyTorch | 2.8.0 | Transformers backend |
| Benzerlik hesaplama | scikit-learn | 1.6.1 | Cosine similarity |
| PDF parse | pdfplumber + PyPDF2 | — | PDF metin çıkarma |
| DOCX parse | python-docx | — | Word dosyası okuma |
| Veri doğrulama | Pydantic | v2 | Request/response modelleri |
| Frontend | React | 18.3.1 | SPA kullanıcı arayüzü |
| Build tool | Vite | 5.4.12 | Frontend bundler |
| Stil | Tailwind CSS | 3.4.17 | Utility-first CSS |
| İkon seti | lucide-react | 0.511.0 | SVG ikonlar |
| Veri seti | fake_job_postings.csv | — | 50MB+ iş ilanı verisi |

---

## Klasör Yapısı

```
SkillSync/
├── CLAUDE.md                        ← AI asistan context dosyası
├── docs/
│   ├── BACKLOG.md                   ← User story + story point backlog
│   ├── ROADMAP.md                   ← Sprint planı
│   └── ARCHITECTURE.md              ← Bu dosya
├── data/
│   └── fake_job_postings.csv        ← İş ilanı veri seti (50MB+)
│
├── backend/
│   ├── .python-version              ← pyenv için Python versiyonu (3.12.8)
│   ├── requirements.txt             ← Python bağımlılıkları
│   └── app/
│       ├── main.py                  ← FastAPI uygulaması, CORS, startup olayları
│       ├── api/
│       │   └── routes.py            ← HTTP endpoint'leri (GET /, POST /upload-cv, POST /analyze)
│       └── services/
│           ├── model.py             ← Ana ML pipeline (embedding + dataset karşılaştırma + rapor)
│           ├── embedding.py         ← SentenceTransformer wrapper (get_embedding fonksiyonu)
│           ├── matcher.py           ← Cosine similarity hesaplama
│           ├── skill_extractor.py   ← 40+ skill listesi + string matching
│           ├── file_parser.py       ← PDF/DOCX → düz metin dönüşümü
│           └── preprocessing.py     ← Lowercase, özel karakter temizleme
│
└── frontend/
    ├── package.json
    ├── vite.config.js               ← Dev server port 5173
    ├── tailwind.config.js           ← Özel renk paleti tanımları
    ├── postcss.config.js
    ├── index.html                   ← HTML giriş noktası
    └── src/
        ├── main.jsx                 ← React root render
        ├── App.jsx                  ← Tüm sayfa bileşenleri + client-side routing (734 satır)
        ├── index.css                ← Global stiller, özel animasyonlar
        ├── components/
        │   └── Header.jsx           ← Sticky navigasyon header
        ├── services/
        │   └── analysisService.js   ← API çağrı katmanı (USE_MOCK_API flag burada)
        └── data/
            └── mockAnalysis.js      ← Geliştirme sırasında kullanılan örnek yanıt
```

---

## Katman Sorumlulukları

### `app/api/` — HTTP Katmanı
- **Tek sorumluluk**: HTTP request'i al, servisi çağır, HTTP response döndür.
- Route handler'lar iş mantığı içermemeli.
- Dosya tipi doğrulama bu katmanda yapılabilir.
- `cv_store` geçici state burada tutuluyor (üretimde veritabanına taşınmalı).

### `app/services/model.py` — Orkestrasyon Katmanı
- Diğer servisleri koordine eden ana pipeline.
- CSV'yi yükler, örnekler, embedding üretir, cosine similarity hesaplar.
- Rapor yapısını oluşturur: `match_percentage`, `missing_skills`, `top5_jobs`, `alan_istatistikleri`.

### `app/services/embedding.py` + `matcher.py` — ML Altyapı Katmanı
- `embedding.py`: Ham metni vektöre dönüştürür.
- `matcher.py`: İki vektör arasındaki benzerliği hesaplar.
- Bu iki servis birbirinden bağımsız ve test edilebilir olmalı.

### `app/services/skill_extractor.py` — Kural Tabanlı NLP Katmanı
- Önceden tanımlı 40+ beceri listesiyle string matching yapar.
- CV ve iş ilanındaki becerileri ayrı ayrı çıkarır.
- `matched_skills` ve `missing_skills` listelerini üretir.

### `app/services/file_parser.py` — Doküman Katmanı
- Format agnostik: PDF veya DOCX fark etmeksizin düz metin döndürür.
- Async destekli (`UploadFile` ile çalışır).

### `app/services/preprocessing.py` — Metin Temizleme Katmanı
- Embedding öncesi standartlaştırma: lowercase, özel karakter kaldırma, boşluk normalizasyonu.

### `frontend/src/App.jsx` — Sayfa Katmanı
- `LandingPage()`: Hero, nasıl çalışır, örnek sonuçlar.
- `AnalyzePage()`: Dosya yükleme formu, analiz sonuç panelleri.
- `AnalysisLoader()`: Yükleme animasyonu overlay.
- Client-side routing: `window.history.pushState` (router kütüphanesi yok).

### `frontend/src/services/analysisService.js` — Frontend API Katmanı
- Backend ile tüm iletişim bu servis üzerinden geçer.
- `USE_MOCK_API = true` → mock data kullanır; `false` → gerçek backend çağırır.
- Bağımsız test edilebilir; bileşenler API detaylarını bilmez.

### `frontend/src/components/` — Yeniden Kullanılabilir UI Katmanı
- `Header.jsx`: Navigasyon, tüm sayfalarda aynı.
- Gelecekte: `StatCard`, `InsightPanel`, `EmptyState` bileşenlerinin buraya taşınması önerilir.

### `frontend/src/data/` — Mock Veri Katmanı
- Sadece geliştirme aşamasında kullanılır.
- Gerçek API'ye geçildiğinde bu klasör kaldırılabilir.

---

## Veri Akışı

```
Kullanıcı
   │
   │  1. PDF/DOCX dosyası seçer
   ▼
frontend/src/App.jsx (AnalyzePage)
   │
   │  2. analysisService.uploadCV(file) çağrısı
   ▼
frontend/src/services/analysisService.js
   │
   │  3. POST /upload-cv  (multipart/form-data)
   ▼
backend/app/api/routes.py
   │
   │  4. file_parser.extract_text(file) → düz metin
   ▼
backend/app/services/file_parser.py
   │
   │  5. CV metni cv_store["latest"]'e yazılır
   ▼
backend/app/api/routes.py (cv_store)
   │
   ╔══════════════════════════════════════════╗
   ║  Kullanıcı iş ilanı metnini yapıştırır  ║
   ╚══════════════════════════════════════════╝
   │
   │  6. analysisService.analyzeCV(jobText) çağrısı
   ▼
frontend/src/services/analysisService.js
   │
   │  7. POST /analyze  {job_text: "..."}
   ▼
backend/app/api/routes.py
   │
   │  8. cv_store["latest"] + job_text → model.analyze()
   ▼
backend/app/services/model.py
   │  ├── preprocessing.clean(cv_text)
   │  ├── embedding.get_embedding(cv_text)         → cv_vector
   │  ├── embedding.get_embedding(job_text)        → job_vector
   │  ├── matcher.cosine_similarity(cv, job)       → match_score
   │  ├── [CSV dataset embeddings karşılaştırması] → top5_jobs
   │  └── skill_extractor.extract(cv, job)         → missing_skills
   │
   │  9. Rapor JSON olarak döner
   ▼
backend/app/api/routes.py
   │
   │  10. JSON response
   ▼
frontend/src/App.jsx (AnalyzePage)
   │
   │  11. Sonuçlar state'e yazılır, UI render edilir
   ▼
Kullanıcı (sonuç panelleri görür)
```

---

## Stil Yaklaşımı

Proje **utility-first** Tailwind CSS kullanır. Özel renk paleti `tailwind.config.js`'te tanımlıdır.

### Özel Renk Paleti

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      ink:   '#121A2F',  // Koyu arka plan, birincil metin
      mist:  '#F5F1E8',  // Açık arka plan, kart zemini
      ember: '#FF7A59',  // CTA buton, birincil vurgu
      gold:  '#F4C95D',  // İkincil vurgu, başarı
      moss:  '#75B798',  // Eşleşme yüzdesi, pozitif gösterge
      slate: '#5B6476',  // Yardımcı metin, meta bilgi
    }
  }
}
```

### Örnek Kullanım

```jsx
// Birincil CTA butonu
<button className="bg-ember hover:bg-ember/90 text-white px-6 py-3 rounded-xl font-semibold">
  Analizi Başlat
</button>

// Eşleşme yüzdesi göstergesi
<span className="text-moss text-4xl font-bold">
  {matchPercentage}%
</span>

// Kart bileşeni
<div className="bg-mist border border-slate/20 rounded-2xl p-6">
  <h3 className="text-ink font-semibold">Eksik Beceriler</h3>
  <p className="text-slate text-sm mt-1">...</p>
</div>
```

### Özel Animasyonlar (`index.css`)

- `orbit`: CV analiz ekranındaki dönen halka animasyonu
- `pulse-ring`: Yükleme sırasındaki nabız efekti
- Tüm özel animasyonlar `@keyframes` ile tanımlı, Tailwind `animate-*` class'larıyla kullanılıyor

---

## Bilinen Teknik Borçlar

| Sorun | Konum | Önem |
|-------|-------|------|
| İki farklı embedding modeli | `embedding.py` vs `model.py` | Yüksek |
| In-memory CV storage | `routes.py` — `cv_store` | Yüksek |
| Hardcoded CSV yolu | `model.py` | Orta |
| Mock API aktif | `analysisService.js` | Yüksek |
| Test yok | Tüm servisler | Orta |
| CORS yapılandırılmamış | `main.py` | Yüksek |
