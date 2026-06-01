# SkillSync Analiz Ciktilari Rehberi

Bu dokuman, analiz ekranindaki kutularin backend tarafinda neye gore hesaplandigini aciklar.

## Girdi Akisi

1. Kullanici CV dosyasini yukler.
2. Backend PDF/DOCX dosyasindan metin cikarir.
3. Kullanici is ilani metnini girer.
4. Analiz baslarken frontend tarayicidan konum izni ister.
5. Konum izni verilirse backend'e `user_lat` ve `user_lon` gonderilir.
6. Backend CV, ilan metni ve dataset ilanlarini `SentenceTransformer` modeliyle vektorlestirir.

## CV ve Ilan Uyumu

Bu kutudaki yuzde, kullanicinin CV metni ile forma yapistirdigi is ilani metni arasindaki semantic similarity skorudur.

Teknik olarak:

- CV metni embedding'e cevrilir.
- Is ilani metni embedding'e cevrilir.
- Iki embedding arasinda cosine similarity hesaplanir.
- Skor 0-100 araligina normalize edilir.

Bu skor dataset'teki en iyi ilan degil, kullanicinin girdigi hedef ilan icindir.

## Potansiyel

Potansiyel kutusu, eksik beceriler tamamlanirsa tahmini uyumun ne kadar artabilecegini gosterir.

Teknik olarak:

- Hedef is ilaninda gecen beceriler cikarilir.
- CV'de olmayan beceriler `missing_skills` olarak ayrilir.
- Her eksik beceri icin skora kucuk bir artis varsayimi eklenir.
- Sonuc en fazla 100 olacak sekilde sinirlanir.

Bu alan kesin bir tahmin degil, eksik becerilerin tamamlanmasi durumunda olasi iyilesmeyi gosteren demo metriğidir.

## Eksik Beceriler

Eksik beceriler, hedef is ilani metninde bulunan ama CV metninde bulunmayan becerilerdir.

Teknik olarak:

- Backend sabit bir beceri listesi kullanir.
- CV icinden beceriler cikarilir.
- Is ilani icinden beceriler cikarilir.
- Ilan becerileri icinde olup CV becerileri icinde olmayanlar listelenir.

Ornek: Ilan `Docker`, `FastAPI`, `SQL` istiyor; CV'de sadece `SQL` varsa eksik beceriler `Docker`, `FastAPI` olur.

## Onerilen Roller

Onerilen roller, dataset icinde CV'ye en yakin bulunan ilan basliklarindan uretilir.

Teknik olarak:

- CV embedding'i dataset'teki ilan embedding'leriyle karsilastirilir.
- En yuksek semantic similarity skoruna sahip ilk ilanlar siralanir.
- Bu ilanlarin title alanlari benzersizlestirilerek `alternative_jobs` olarak frontend'e gonderilir.

Bu alan kullanicinin hedef ilanindan degil, dataset icindeki benzer ilanlardan gelir.

## Cevredeki Ilanlar

Cevredeki ilanlar, dataset icindeki hem CV'ye uygun hem de konumu hesaplanabilen ilanlardan olusur.

Teknik olarak:

- Once tum dataset ilanlari CV ile embedding similarity skoruna gore puanlanir.
- Backend koordinati bilinen veya lokasyon metninden offline fallback ile koordinat uretilebilen ilanlari ayirir.
- Kullanici konumu varsa her ilan icin Haversine mesafe hesabi yapilir.
- Aday ilanlar once NLP uyum skoruna, sonra mesafeye gore siralanir.
- Uyum kalitesini korumak icin en iyi skora cok uzak kalan ilanlar filtrelenir.
- En fazla 5 ilan `nearby_jobs` olarak gonderilir.

Sirket adi her ilanda temiz gelmeyebilir. Bu durumda sistem:

- `company_profile` icinden kisa marka/sirket adini yakalamaya calisir.
- Yakalayamazsa `Sirket belirtilmemis` gibi kotu bir metin gostermek yerine sektor veya rol odakli bir etiket uretir.
- Frontend kartlarda asil vurguyu ilan basligina, lokasyona, uyum skoruna ve mesafeye verir.

Konum izni verilmezse:

- Backend yine konumlu dataset ilanlarini dondurur.
- Ancak kullaniciya gore mesafe hesaplanamadigi icin frontend `Mesafe yok` gosterir.

## Harita

Harita Leaflet uzerinden OpenStreetMap tile layer kullanir.

Frontend su marker'lari gosterir:

- `Sen`: Kullanici konumu. Sadece konum izni verilirse gorunur.
- `1-5`: Backend'den gelen `nearby_jobs` ilanlari.

Marker uzerine gelindiginde:

- Ilan basligi
- Sirket bilgisi
- Uyum yuzdesi
- Mesafe

gosterilir.

Marker'lar Leaflet layer olarak eklendigi icin harita pan/zoom yapildiginda konumlari haritayla birlikte hareket eder.

## Market Bilgisi

Market bilgisi dataset analizinden uretilen kisa ozet metindir.

Su bilgilerden olusur:

- Dataset'te kac ilan incelendigi
- Ortalama uyum seviyesi
- En cok gorulen sektorler

Bu alan canli piyasa verisi degildir; mevcut dataset uzerinden uretilen ozet bilgidir.

## Onemli Notlar

- Canli ilan entegrasyonu su an aktif degildir.
- Dataset lokasyonlari her zaman tam temiz olmadigi icin koordinat bulunamayan ilanlar olabilir.
- `GEOCODE_API_KEY` yoksa backend offline sehir/ulke koordinat fallback'i kullanir.
- Demo icin ilk analiz yavas olabilir; model ilk calismada yuklenir.
