# SkillSync — Ürün Backlog'u

> Story point tahmini: Küçük iş = 1–3 SP | Orta = 5 SP | Büyük = 8 SP

---

## US-01 — CV Yükleme & Temel Analiz

**Kullanıcı:** İş arayan biri  
**Hedef:** CV'mi PDF veya DOCX olarak yükleyip otomatik analiz sonucu görmek istiyorum.

| ID | Açıklama | Öncelik | SP | Durum |
|----|---------|---------|-----|-------|
| T-01 | PDF yükleme endpoint'i (`/upload-cv`) | Yüksek | 3 | Tamamlandı |
| T-02 | DOCX yükleme desteği | Yüksek | 2 | Tamamlandı |
| T-03 | Metin çıkarma servisi (`file_parser.py`) | Yüksek | 3 | Tamamlandı |
| T-04 | CV metnini geçici olarak saklama (`cv_store`) | Yüksek | 1 | Tamamlandı |
| T-05 | Analiz endpoint'i (`/analyze`) yanıt yapısı | Yüksek | 3 | Tamamlandı |
| T-06 | Dosya tipi doğrulama ve hata mesajları | Orta | 1 | Araştırma |

**Kabul Kriterleri:**
- Kullanıcı PDF veya DOCX yükleyebilmeli
- Desteklenmeyen dosya tipi hata mesajı üretmeli
- Analiz yanıtında en az: `match_percentage`, `missing_skills`, `top5_jobs` alanları bulunmalı
- 5 MB üzeri dosyalarda uyarı verilmeli

**US-01 Toplam: 13 SP**

---

## US-02 — İş İlanı Eşleştirme

**Kullanıcı:** İş arayan biri  
**Hedef:** CV'mi iş ilanı metniyle karşılaştırıp uyum yüzdesi ve en yakın pozisyonları görmek istiyorum.

| ID | Açıklama | Öncelik | SP | Durum |
|----|---------|---------|-----|-------|
| T-07 | `SentenceTransformer` embedding pipeline | Yüksek | 3 | Tamamlandı |
| T-08 | Cosine similarity hesaplama (`matcher.py`) | Yüksek | 2 | Tamamlandı |
| T-09 | CSV veri seti yükleme ve örnekleme (500 kayıt) | Yüksek | 2 | Tamamlandı |
| T-10 | Top 5 eşleşen iş ilanı listeleme | Yüksek | 3 | Tamamlandı |
| T-11 | Sektör istatistikleri (>50%, >70% eşleşme oranları) | Orta | 2 | Tamamlandı |
| T-12 | Embedding modelini tekleştirme (`embedding.py` vs `model.py` tutarsızlığı) | Orta | 1 | Araştırma |

> **Not:** T-12 için iki alternatif var:
> - *Seçenek A*: `model.py`'yi `all-MiniLM-L6-v2` kullanacak şekilde güncelle (daha hızlı)
> - *Seçenek B*: `embedding.py`'yi `paraphrase-multilingual-MiniLM-L12-v2` kullanacak şekilde güncelle (Türkçe desteği daha iyi)

**Kabul Kriterleri:**
- Uyum yüzdesi 0–100 arası sayısal değer döndürmeli
- En az 5 alternatif pozisyon listelenmeli
- Sektör dağılımı gösterilmeli
- Yanıt süresi < 10 saniye olmalı

**US-02 Toplam: 13 SP**

---

## US-03 — Eksik Beceri Önerileri

**Kullanıcı:** İş arayan biri  
**Hedef:** CV'imde eksik olan becerileri görmek ve bunları nasıl kazanabileceğime dair öneri almak istiyorum.

| ID | Açıklama | Öncelik | SP | Durum |
|----|---------|---------|-----|-------|
| T-13 | Skill extractor servisi (`skill_extractor.py`) | Yüksek | 3 | Tamamlandı |
| T-14 | CV'deki mevcut becerileri çıkarma | Yüksek | 2 | Tamamlandı |
| T-15 | İş ilanındaki eksik becerileri hesaplama | Yüksek | 2 | Tamamlandı |
| T-16 | Eksik beceri frontend UI kartları | Orta | 1 | Araştırma |

> **Not:** T-16 için iki alternatif var:
> - *Seçenek A*: Mevcut mock UI'ı gerçek API verisine bağla (daha az iş)
> - *Seçenek B*: Her eksik beceri için kurs/kaynak önerisi ekle (daha kapsamlı, süre riski)

**Kabul Kriterleri:**
- Eksik beceriler iş ilanıyla karşılaştırmalı listelenmeli
- Mevcut beceriler ayrı alanda gösterilmeli
- `improved_match` skoru (eksikler eklenirse tahmini uyum) hesaplanmalı

**US-03 Toplam: 8 SP**

---

## US-04 — Frontend-Backend Entegrasyonu

**Kullanıcı:** Geliştirici (takım içi)  
**Hedef:** Frontend'in mock API yerine gerçek FastAPI backend'ini kullanmasını sağlamak istiyorum.

| ID | Açıklama | Öncelik | SP | Durum |
|----|---------|---------|-----|-------|
| T-17 | FastAPI'ye CORS middleware ekle | Yüksek | 1 | Araştırma |
| T-18 | `USE_MOCK_API = false` yap ve gerçek endpoint'lere bağla | Yüksek | 2 | Araştırma |
| T-19 | Hata durumu yönetimi (network error, timeout, 4xx/5xx) | Yüksek | 2 | Araştırma |
| T-20 | Yükleme + analiz E2E testi (gerçek PDF ile) | Yüksek | 2 | Araştırma |
| T-21 | Backend base URL'i env variable'a taşı | Orta | 1 | Araştırma |

**Kabul Kriterleri:**
- Gerçek PDF yüklendiğinde `/upload-cv` endpoint'i çağrılmalı
- Analiz butonu gerçek `/analyze` endpoint'ini tetiklemeli
- Ağ hatası durumunda kullanıcıya anlamlı mesaj gösterilmeli
- Localhost'ta end-to-end çalışır hale gelmeli

**US-04 Toplam: 8 SP**

---

## US-05 — Kullanıcı Arayüzü

**Kullanıcı:** İş arayan biri  
**Hedef:** Sezgisel, hızlı ve güzel bir arayüzden CV analizimi yapmak istiyorum.

| ID | Açıklama | Öncelik | SP | Durum |
|----|---------|---------|-----|-------|
| T-22 | Landing page (hero, nasıl çalışır, örnek sonuçlar) | Yüksek | 3 | Tamamlandı |
| T-23 | Analiz sayfası (upload form + sonuç panelleri) | Yüksek | 3 | Tamamlandı |
| T-24 | Yükleme animasyonu (`AnalysisLoader`) | Orta | 1 | Tamamlandı |
| T-25 | Responsive tasarım (mobil/tablet) | Orta | 1 | Tamamlandı |

**Kabul Kriterleri:**
- Landing page'den analiz sayfasına geçiş sorunsuz çalışmalı
- Analiz süresi boyunca loading animasyonu gösterilmeli
- Sonuç kartları match yüzdesi, eksik beceriler ve top 5 pozisyonu içermeli
- 375px genişliğinde (iPhone SE) bozulma olmamalı

**US-05 Toplam: 8 SP**

---

## Özet Tablo

| User Story | Açıklama | SP | Durum |
|-----------|---------|-----|-------|
| US-01 | CV Yükleme & Temel Analiz | 13 | Kısmen Tamamlandı |
| US-02 | İş İlanı Eşleştirme | 13 | Kısmen Tamamlandı |
| US-03 | Eksik Beceri Önerileri | 8 | Kısmen Tamamlandı |
| US-04 | Frontend-Backend Entegrasyonu | 8 | Araştırma |
| US-05 | Kullanıcı Arayüzü | 8 | Büyük Ölçüde Tamamlandı |
| **TOPLAM** | | **50 SP** | |

> **Uyarı (Scope Creep):** Kullanıcı auth, analiz geçmişi kaydetme ve kurs önerisi ekleme özellikleri cazip görünebilir ancak her biri 8–13 SP ekler. Okul projesi deadline'ı gözetildiğinde bu özellikler şimdilik scope dışında tutulmalıdır.
