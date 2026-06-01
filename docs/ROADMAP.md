# SkillSync — Sprint Planı & Yol Haritası

---

## Mevcut Durum Özeti

| Alan | Durum | Notlar |
|------|-------|-------|
| Backend iskeleti | Tamamlandı | FastAPI app, 2 endpoint çalışıyor |
| ML pipeline | Tamamlandı | Embedding + cosine similarity aktif |
| Skill extractor | Tamamlandı | 40+ skill, string matching |
| Frontend UI | Büyük Ölçüde Tamamlandı | Landing page + analiz sayfası |
| Frontend-Backend bağlantısı | Araştırma | `USE_MOCK_API = true` — gerçek API bağlı değil |
| Veritabanı | Araştırma | In-memory, kalıcı değil |
| Test | Araştırma | Henüz test yazılmadı |

**Tamamlanan SP:** ~25 / 50  
**Kalan SP:** ~25

---

## Sprint 1 — Proje Kurulumu & İskelet (Tamamlandı)

**Hedef:** Çalışan bir proje iskeleti oluşturmak; backend ve frontend'in bağımsız olarak ayağa kalkması.

| Görev | SP | Durum |
|-------|-----|-------|
| FastAPI app kurulumu + uvicorn | 1 | Tamamlandı |
| `/upload-cv` endpoint (PDF/DOCX parse) | 3 | Tamamlandı |
| `/analyze` endpoint (model entegrasyonu) | 3 | Tamamlandı |
| Embedding pipeline (`SentenceTransformer`) | 3 | Tamamlandı |
| Cosine similarity (`matcher.py`) | 2 | Tamamlandı |
| Skill extractor servisi | 3 | Tamamlandı |
| React + Vite kurulumu | 1 | Tamamlandı |
| Landing page UI | 3 | Tamamlandı |
| Analiz sayfası UI (mock veri ile) | 3 | Tamamlandı |
| Tailwind özel renk paleti | 1 | Tamamlandı |

**Sprint 1 Toplam: 23 SP**

---

## Sprint 2 — Frontend-Backend Entegrasyonu (Aktif)

**Hedef:** Mock API'yi kaldırıp frontend'i gerçek FastAPI backend'ine bağlamak; projenin uçtan uca çalışır hale gelmesi.

| Görev | SP | Durum |
|-------|-----|-------|
| CORS middleware ekle (`main.py`) | 1 | Araştırma |
| `USE_MOCK_API = false`, endpoint URL'lerini bağla | 2 | Araştırma |
| Backend base URL'ini env variable'a taşı | 1 | Araştırma |
| Hata yönetimi (network error, 4xx, 5xx) | 2 | Araştırma |
| E2E testi: gerçek PDF yükle → analiz al | 2 | Araştırma |
| Embedding model tutarsızlığını gider | 1 | Araştırma |

**Sprint 2 Toplam: 9 SP**

---

## Sprint 3 — İş İlanı Eşleştirme & Beceri Önerileri

**Hedef:** ML eşleştirme sonuçlarını arayüzde doğru şekilde göstermek; eksik beceri önerisi özelliğini tamamlamak.

| Görev | SP | Durum |
|-------|-----|-------|
| Top 5 eşleşen ilan UI (gerçek veriden) | 2 | Bekliyor |
| Sektör istatistikleri UI | 2 | Bekliyor |
| Eksik beceriler UI kartları (gerçek veriden) | 1 | Bekliyor |
| `improved_match` skoru gösterimi | 1 | Bekliyor |
| Veri seti örnekleme optimizasyonu | 1 | Bekliyor |

**Sprint 3 Toplam: 7 SP**

---

## Sprint 4 — Test, Polish & Demo Hazırlığı

**Hedef:** Projeyi demo'ya hazır hale getirmek; kritik hataları gidermek, sunum materyali hazırlamak.

| Görev | SP | Durum |
|-------|-----|-------|
| Farklı CV formatlarıyla manuel test | 2 | Bekliyor |
| Hata senaryoları testi (boş CV, geçersiz dosya) | 1 | Bekliyor |
| Yükleme süresi optimizasyonu (model cache) | 2 | Bekliyor |
| UI son rötuşlar (responsive kontrol) | 1 | Bekliyor |
| README güncelleme (kurulum adımları) | 1 | Bekliyor |

**Sprint 4 Toplam: 7 SP**

---

## Özet Takvim

```
┌─────────────────────────────────────────────────────────────┐
│                   SkillSync Sprint Takvimi                  │
├────────────┬────────────────────────────────────────────────┤
│ Sprint 1   │ Tamamlandı — Proje kurulumu, backend, UI       │
├────────────┼────────────────────────────────────────────────┤
│ Sprint 2   │ AKTIF — Frontend-Backend entegrasyonu          │
│            │ Hedef: Gerçek API bağlantısı çalışsın          │
├────────────┼────────────────────────────────────────────────┤
│ Sprint 3   │ BEKLEYEN — Eşleştirme UI + Beceri önerileri    │
│            │ Başlangıç: Sprint 2 tamamlandıktan sonra        │
├────────────┼────────────────────────────────────────────────┤
│ Sprint 4   │ BEKLEYEN — Test, polish, demo                  │
│            │ Bitiş: Dönem sonu teslim tarihinden önce        │
└────────────┴────────────────────────────────────────────────┘
```

---

## User Story Durum Tablosu

| US | Açıklama | Sprint | SP | Durum |
|----|---------|--------|----|-------|
| US-01 | CV Yükleme & Temel Analiz | Sprint 1–2 | 13 | Kısmen Tamamlandı |
| US-02 | İş İlanı Eşleştirme | Sprint 1, 3 | 13 | Kısmen Tamamlandı |
| US-03 | Eksik Beceri Önerileri | Sprint 1, 3 | 8 | Kısmen Tamamlandı |
| US-04 | Frontend-Backend Entegrasyonu | Sprint 2 | 8 | Araştırma |
| US-05 | Kullanıcı Arayüzü | Sprint 1, 4 | 8 | Büyük Ölçüde Tamamlandı |

---

> **Scope Creep Uyarısı:** Auth sistemi, analiz geçmişi veya kurs önerisi gibi özellikler güncel scope'a dahil değildir. Bu özellikler eklenirse Sprint 3–4 kapsamı ciddi biçimde genişler ve demo teslim tarihi riske girer.
