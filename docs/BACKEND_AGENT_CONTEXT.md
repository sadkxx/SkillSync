# Backend Agent Context

Bu not, SkillSync projesinde backend tarafinda destek olacak agent icin hazirlandi. Amac, ana NLP analiz akisini ve frontend baglantisini bozmayacak sekilde backend'in demo icin daha stabil hale gelmesine yardim etmek.

## Proje Ozeti

SkillSync bir NLP dersi projesi. Temel fikir:

- Kullanici CV dosyasini yukler.
- Kullanici bir is ilani metni girer.
- Backend, CV ile is ilani arasindaki uyumu NLP/embedding tabanli analiz eder.
- Dataset icindeki benzer ilanlar onerilir.
- Frontend bu sonuclari kartlar ve harita uzerinden gosterir.

Backend FastAPI ile yazildi. NLP tarafinda `SentenceTransformer`, cosine similarity ve basit skill extraction kullaniliyor. Dataset `data/fake_job_postings.csv` dosyasindan geliyor.

## Onemli Sinirlar

Bu calismada ana hedef, backend'in demo sirasinda patlamamasini saglamak. Bu nedenle buyuk mimari degisikliklerden kacinmak iyi olur.

Lutfen mumkunse su dosyalara dokunma:

- `backend/app/services/model.py`
- `frontend/src/services/analysisService.js`
- `frontend/src/App.jsx`

Bu dosyalarda CV-ilan analiz sonucu, frontend response contract'i ve gercek veri baglantisi duzenlenecek. Ayni anda bu dosyalara dokunmak merge conflict veya davranis bozulmasi yaratabilir.

Eger bu dosyalardan birine dokunmak gerekli gorunurse once not dusup neden gerektigini belirtmek daha iyi olur.

## Senin Icin Uygun Gorevler

Asagidaki isler dusuk riskli ve backend stabilitesine direkt katkili.

### 1. Backend Kurulumunu Calisir Hale Getir

Su anda `backend/.venv` icinde eksik paket olabiliyor. Ornek olarak backend import edilirken `python-dotenv` eksik hatasi alinabiliyor.

Beklenenler:

- `backend/requirements.txt` ile ortam kurulabilsin.
- Su komut backend'i baslatabilsin:

```bash
cd backend
uvicorn app.main:app --reload
```

- Swagger dokumani acilabilsin:

```text
http://127.0.0.1:8000/docs
```

Gerekirse sadece dependency/install dokumantasyonu ekle. Gereksiz paket silme veya buyuk dependency degisikligi yapma.

### 2. Backend README Ekle

`backend/README.md` dosyasi eklenebilir.

Icerikte sunlar olsun:

- Python/venv kurulumu
- Dependency kurulumu
- Backend baslatma komutu
- Swagger URL'i
- Dataset yolu
- Opsiyonel env degiskenleri:
  - `DATABASE_URL`
  - `SKILLSYNC_JOB_POSTINGS_CSV`
  - `ALLOWED_ORIGINS`
  - `GEOCODE_API_KEY`
  - `RUN_SEED_ON_STARTUP`

README kisa ve uygulanabilir olsun.

### 3. Health Endpoint Ekle

Backend'in ayakta olup olmadigini kontrol etmek icin basit bir `/health` endpoint'i eklenebilir.

Onerilen response:

```json
{
  "status": "ok",
  "database": "ok",
  "csv_exists": true,
  "model": "lazy"
}
```

Notlar:

- Bu endpoint modeli yuklememeli. Model yuklemek yavas ve network/cache problemine sebep olabilir.
- Sadece DB baglantisi ve CSV varligi gibi hafif kontroller yapilmali.
- Tercihen yeni dosya kullan:
  - `backend/app/api/health.py`
- Sonra `backend/app/main.py` icinde router olarak ekle.

### 4. Hata Mesajlarini Netlestir

`/upload-cv` ve `/analyze` demo sirasinda frontend'e daha anlasilir hata mesajlari dondurmeli.

Kontrol edilecek durumlar:

- Desteklenmeyen dosya tipi
- Bos dosya
- CV metninin cikarilamamasi
- CV metninin cok kisa olmasi
- CV yuklenmeden analiz istenmesi

Notlar:

- 4xx hatalarinda kullaniciya anlasilir mesaj donulebilir.
- 500 hatalari generic kalabilir; loglama bozulmamali.
- Response field isimlerini degistirme.

Ilgili dosyalar:

- `backend/app/api/routes.py`
- `backend/app/services/file_parser.py`
- `backend/app/core/api_errors.py`

### 5. Seed Endpoint'ini Demo Icin Daha Acik Hale Getir

`POST /jobs/seed` dataset'ten ilanlari DB'ye aktariyor. Demo oncesi bu endpoint'in ne yaptigini anlamak kolay olmali.

Beklenenler:

- Basarili response daha acik olabilir:

```json
{
  "status": "ok",
  "provider": "dataset",
  "affected": 100,
  "csv_path": "...",
  "limit_applied": 100,
  "message": "Dataset jobs imported successfully"
}
```

- CSV yoksa net bir `400` mesaji donsun.
- `provider=jobspy` canli ilan icin su an kritik degil. Istersen kontrollu sekilde "not enabled for demo" gibi bir hata dondurebilirsin. Ama dataset seed akisini bozma.

Ilgili dosya:

- `backend/app/api/jobs.py`

### 6. Basit Smoke Testler Ekle

Agir NLP modeli indirmeyen, hizli testler faydali olur.

Onerilen testler:

- `GET /` 200 donuyor mu?
- `GET /health` 200 donuyor mu?
- CV yuklenmeden `POST /analyze` 400 donuyor mu?
- Desteklenmeyen dosya uzantisi `POST /upload-cv` icin 400 donuyor mu?

Notlar:

- Testler modeli yuklememeli.
- Gercek analiz testi yazma; model indirme veya embedding hesaplama CI/local ortamda sorun cikarabilir.
- Gerekirse `pytest` ve `httpx` requirements'a eklenebilir.

Onerilen dosyalar:

- `backend/tests/test_health.py`
- `backend/tests/test_routes.py`

## Simdilik Scope Disinda Kalsin

Asagidaki isler daha merkezi ve frontend/NLP response yapisiyla cakisma ihtimali yuksek. Bunlari baska bir dalda ele almak daha iyi olur.

- `/analyze` response contract'ini yeniden tasarlamak
- `target_job_analysis`, `recommended_jobs`, `nearby_jobs` alanlarini ana response'a baglamak
- Frontend mock verisini kaldirmak
- Harita entegrasyonunu gercek marker'lara cevirmek
- Browser geolocation eklemek
- `model.py` icindeki NLP skorlamasini degistirmek
- Eski servisleri silmek veya birlestirmek
- Buyuk migration/alembic yapisi kurmak

## Merge Conflict Riskleri

Dusuk riskli dosyalar:

- `backend/README.md`
- `backend/app/api/health.py`
- `backend/tests/...`

Orta riskli dosyalar:

- `backend/app/main.py`
- `backend/app/api/routes.py`
- `backend/app/api/jobs.py`
- `backend/requirements.txt`

Yuksek riskli dosyalar:

- `backend/app/services/model.py`
- `frontend/src/services/analysisService.js`
- `frontend/src/App.jsx`

Orta riskli dosyalarda calisirken degisiklikleri kucuk tutmak iyi olur. Ozellikle `main.py`, `routes.py`, `jobs.py` dosyalarinda sadece ilgili endpoint veya router eklemesi yapmaya calis.

## Beklenen Teslim

Calisma sonunda kisa bir not yeterli:

- Hangi dosyalar degisti?
- Backend hangi komutla calistirildi?
- Hangi endpointler manuel/test ile kontrol edildi?
- Calismayan veya eksik kalan bir sey var mi?

Amac, ana analiz akisini bozmadan backend'in demo icin daha guvenilir hale gelmesi.
