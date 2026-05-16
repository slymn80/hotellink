# HotelLink — Platform Tanıtımı & Yatırım Dosyası

> **Türkiye'nin Lider Otellerini Küresel Konaklama Yetenekleriyle Buluşturuyor**
>
> Konaklama sektörü için özel olarak geliştirilmiş, üretime hazır, çok dilli B2B2C SaaS işe alım platformu.

---

## İçindekiler

1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Problem](#2-problem)
3. [Çözüm](#3-çözüm)
4. [Pazar Fırsatı](#4-pazar-fırsatı)
5. [İş Modeli & Gelir Akışları](#5-i̇ş-modeli--gelir-akışları)
6. [Platform Mimarisi](#6-platform-mimarisi)
7. [Kullanıcı Rolleri & Hiyerarşi](#7-kullanıcı-rolleri--hiyerarşi)
8. [Ürün Özellikleri](#8-ürün-özellikleri)
9. [Güvenlik & Uyumluluk](#9-güvenlik--uyumluluk)
10. [Teknoloji Yığını](#10-teknoloji-yığını)
11. [Rekabet Analizi](#11-rekabet-analizi)
12. [Pazara Giriş Stratejisi](#12-pazara-giriş-stratejisi)
13. [Mevcut Durum & Traction](#13-mevcut-durum--traction)
14. [Ürün Yol Haritası](#14-ürün-yol-haritası)
15. [Finansal Model](#15-finansal-model)
16. [Ekip & İşe Alım Planı](#16-ekip--i̇şe-alım-planı)
17. [Yatırım Talebi & Fonun Kullanımı](#17-yatırım-talebi--fonun-kullanımı)
18. [Erişim & Giriş Bilgileri](#18-erişim--giriş-bilgileri)

---

## 1. Yönetici Özeti

**HotelLink**, başta Rusya, Ukrayna, Kazakistan ve Doğu Avrupa'dan gelen uluslararası çalışanları Türkiye'deki otellerle buluşturan çok dilli bir konaklama sektörü işe alım SaaS platformudur. Platform üç taraflı bir pazar yeri olarak işler: oteller iş ilanı açar ve başvuruları yönetir, adaylar doğrulanmış profil oluşturur ve başvurur, İK ajansları ise ölçekli yerleştirme işlemlerini kolaylaştırır.

| Metrik | Detay |
|--------|-------|
| **Platform Türü** | B2B2C SaaS Pazar Yeri |
| **Birincil Pazar** | Türk Konaklama Sektörü |
| **Aday Tabanı** | BDT + Doğu Avrupa ülkeleri |
| **Desteklenen Diller** | İngilizce, Türkçe, Rusça |
| **Para Kazanma** | Otel abonelik kademeleri + ajans lisanslama |
| **Teknoloji** | Next.js 14 · Prisma · PostgreSQL · Stripe |
| **Mevcut Aşama** | MVP tamamlandı, üretime hazır |
| **Hedef** | Pazar lansmanı için tohum yatırımı |

Türkiye'nin otel sektörü **1,3 milyonun üzerinde** çalışan istihdam etmektedir. Uluslararası yeteneğe olan talep, pandemi öncesi dönemden bu yana en yüksek seviyesindedir. HotelLink, büyük ölçüde çevrimdışı işleyen, parçalı bir işe alım pazarını; özellikleri tamamlanmış, ölçeklenebilir bir dijital platformla ele almaktadır.

---

## 2. Problem

### Oteller İçin

- Nitelikli uluslararası adaylara ulaşmak için merkezi bir platform yok
- İşe alım ajansları her yerleştirme için **yıllık maaşın %15–25'ini** komisyon olarak alıyor
- Manuel, kağıt ağırlıklı vize ve çalışma izni doğrulama süreçleri
- Pahalı mülakatlardan önce aday kalitesini değerlendirme imkânı yok
- Yüksek işgücü devir oranı (konaklama sektörü ortalaması **%73**) ve boru hattı yönetim araçlarının yokluğu

### Uluslararası Adaylar İçin

- Şeffaf olmayan pazar: otel itibarını, maaş aralıklarını veya sosyal hakları karşılaştırma imkânı yok
- Dil engelleri Türk otellere doğrudan başvuruyu zorlaştırıyor
- Çalışma izni ve vize süreçleri karmaşık ve rehbersiz
- Doğrulanmış profil sistemi yok — işverenler kimlik bilgilerine güvenemiyor
- Coğrafi izolasyon: BDT ve Doğu Avrupa'daki nitelikli adayların Türk pazarına erişimi yok

### İK Ajansları İçin

- Düzinelerce otelde yerleştirmelerin manuel takibi
- Aday boru hattı görünürlüğü için birleşik bir kontrol paneli yok
- Parçalı faturalandırma ve sözleşme yönetimi
- Otel müşterilerine yatırım getirisini kanıtlayamama

---

## 3. Çözüm

HotelLink, konaklama yeteneği pazarı için birleşik bir dijital altyapı sunar:

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOTELLİNK PLATFORMU                        │
├──────────────────┬──────────────────────┬───────────────────────┤
│   OTEL PORTALI   │   ADAY PORTALI       │    AJANS PORTALI      │
│                  │                      │                        │
│ • İş ilanı       │ • Profil oluşturma   │ • Çok otelli yönetim  │
│ • Başvuru yön.   │ • Belge kasası        │ • Aday boru hattı     │
│ • Analitik       │ • İş keşfi           │ • Yerleştirme takibi  │
│ • Mesajlaşma     │ • Başvuru takibi     │ • Komisyon raporları  │
│ • Doğrulama      │ • Çalışma izni rehb. │ • Otel ortaklıkları   │
│ • Abonelik       │ • Çok dilli arayüz   │ • Analitik paketi     │
└──────────────────┴──────────────────────┴───────────────────────┘
```

**Temel Değer Önerisi:**
- **Oteller İçin:** Ajans maliyetinin çok altında 12.000+ önceden doğrulanmış uluslararası adaya erişim
- **Adaylar İçin:** Vizeli çalışma izni süreciyle şeffaf iş pazar yeri
- **Ajanslar İçin:** Otomatik yerleştirme takibi ile dijital öncelikli operasyon platformu

---

## 4. Pazar Fırsatı

### Toplam Adreslenebilir Pazar (TAM)

```
                  KÜRESEL KONAKLAMA İŞGÜCÜ PİYASASI
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    45,2 Milyar $ küresel pazar (2024)
                              │
              ┌───────────────▼───────────────┐
              │    TÜRKİYE KONAKLAMA PAZARI    │
              │    ~1,8 Milyar $ yıllık harcama│
              │    ~85.000 yıllık açık pozisyon │
              └───────────────┬───────────────┘
                              │
              ┌───────────────▼───────────────┐
              │  HİZMET VEREBİLİR ADRESLENEBİLİR│
              │  PAZAR (SAM)                   │
              │  Uluslararası yetenek:          │
              │  ~28.000 yerleştirme/yıl        │
              │  ~420 Milyon $ ajans değeri      │
              └───────────────┬───────────────┘
                              │
              ┌───────────────▼───────────────┐
              │  ELDE EDİLEBİLİR PAZAR         │
              │  (SOM) — 3. Yıl               │
              │  Hedef: 3.500 yerleştirme       │
              │  Tahmini GMV: ~52 Milyon $      │
              │  Platform geliri: ~4,2 Milyon $ │
              └───────────────────────────────┘
```

### Temel Pazar Sürücüleri

| Sürücü | Veri Noktası |
|--------|-------------|
| Türkiye turizm büyümesi | 2023'te 56,7 milyon yabancı ziyaretçi (%10,3 artış) |
| Otel sektörü iş gücü açığı | 2026'ya kadar 180.000+ doldurulmamış pozisyon |
| BDT göç dalgası | 2022–24 yılları arasında 1,2 milyondan fazla BDT vatandaşı Türk iş piyasasına girdi |
| Dijital benimseme | İK yöneticilerinin %78'i dijital işe alım araçlarını tercih ediyor (LinkedIn 2023) |
| Ajans piyasası parçalanması | İlk 5 ajans pazar payının yalnızca %12'sini tutuyor |

### Neden Türkiye? Neden Şimdi?

1. **Pandemi sonrası patlama** — Türk turizmi 2023'te tüm zamanların rekorunu kırdı
2. **BDT göç dalgası** — Rusya, Ukrayna ve Kazakistan'dan milyonlarca nitelikli konaklama çalışanı aktif olarak Türkiye'de pozisyon arıyor
3. **Düzenleyici rüzgar** — Türk hükümeti 2023'te konaklama çalışanları için çalışma izni süreçlerini kolaylaştırdı
4. **Dijital boşluk** — Baskın dijital platform yok; pazar hâlâ WhatsApp grupları ve kağıt özgeçmişleri üzerinden yürüyor

---

## 5. İş Modeli & Gelir Akışları

### Birincil Gelir: Otel Abonelikleri (SaaS)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ABONELİK KADEMELERİ                         │
├──────────────┬─────────────────┬──────────────────┬────────────────┤
│    ÜCRETSİZ  │    BAŞLANGIÇ    │   PROFESYONEL    │  KURUMSAL      │
│              │                 │                  │                │
│  0 $/ay      │  149 $/ay       │  399 $/ay        │  899 $/ay      │
│  ─────────   │  ─────────      │  ─────────       │  ─────────     │
│  1 ilan      │  5 ilan         │  20 ilan         │  Sınırsız      │
│  0 öne çıkan │  1 öne çıkan    │  5 öne çıkan     │  20 öne çıkan  │
│  10 profil   │  50 profil      │  Sınırsız        │  Sınırsız      │
│  Temel araç  │  Analitik       │  Gelişmiş YZ     │  Özel CSM      │
│              │  Mesajlaşma     │  API erişimi     │  Beyaz etiket  │
│              │  Çalışma izni   │  Öncelikli doğr. │  Özel entegr.  │
└──────────────┴─────────────────┴──────────────────┴────────────────┘
                              Yıllık ödemede %20 indirim
```

### İkincil Gelir Akışları

| Akış | Model | Tahmini Marj |
|------|-------|-------------|
| **Ajans Lisanslama** | Ajanslar için koltuk başına SaaS | %85 |
| **Öne Çıkan İlan Slotları** | İlan başına premium yerleştirme ücreti | %92 |
| **Aday Öne Çıkarma** | Adaylar için profil güçlendirme | %90 |
| **Çalışma İzni Hizmetleri** | Destekli işlem ücreti (120–200 $/vaka) | %60 |
| **Arka Plan Doğrulama** | Üçüncü taraf doğrulanmış rozet (35 $/profil) | %45 |
| **İşe Alım Başarı Ücreti** | İsteğe bağlı yıllık maaşın %4'ü (doğrudan işe alımlar) | %100 |

### Birim Ekonomisi (Tahmini 2. Yıl)

```
Otel Başına Ortalama Gelir (ARPH):   312 $/ay
Müşteri Edinme Maliyeti (CAC):       420 $
Yaşam Boyu Değer (LTV):             11.232 $ (36 aylık ort. elde tutma)
LTV:CAC Oranı:                       26,7x
Brüt Marj (SaaS):                   %82
Geri Ödeme Süresi:                   1,4 ay
```

---

## 6. Platform Mimarisi

### Sistem Mimarisi Genel Bakış

```
                          ┌─────────────────┐
                          │   CLOUDFLARE    │
                          │   CDN + WAF     │
                          └────────┬────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       VERCEL EDGE AĞI        │
                    │    (Next.js 14 App Router)   │
                    └──────┬──────────────┬────────┘
                           │              │
             ┌─────────────▼──┐    ┌──────▼──────────┐
             │  SUNUCU SAYFALAR│    │  API ROTALAR     │
             │  (RSC/SSR)      │    │  (Route Handler) │
             │                 │    │                  │
             │ • Ana sayfa     │    │ /api/auth        │
             │ • Otel sayfaları│    │ /api/hotels      │
             │ • İş ilanları   │    │ /api/jobs        │
             │ • Kontrol pan.  │    │ /api/candidates  │
             └─────────────────┘    │ /api/messages    │
                                    │ /api/applications│
                                    │ /api/stripe      │
                                    │ /api/admin       │
                                    └──────┬──────────┘
                                           │
                    ┌──────────────────────▼─────────────────────┐
                    │                 VERİ KATMANI                │
                    ├──────────────┬──────────────┬──────────────┤
                    │  PostgreSQL  │   Supabase   │    Redis     │
                    │  (Prisma)    │   Depolama   │  (Oturum &   │
                    │             │   (Dosya &   │   Hız Limit) │
                    │  Ana Verit.  │   Görseller) │              │
                    └──────────────┴──────────────┴──────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────┐
                    │             DIŞ SERVİSLER                   │
                    ├──────────┬──────────┬──────────┬───────────┤
                    │  STRIPE  │  RESEND  │  GOOGLE  │  SENTRY   │
                    │ Ödeme    │  E-posta │  OAuth   │  Hatalar  │
                    └──────────┴──────────┴──────────┴───────────┘
```

### İstek Akışı

```
Tarayıcı İsteği
      │
      ▼
Cloudflare (DDoS koruması + önbellekleme)
      │
      ▼
Vercel Edge (Konum tespiti + middleware)
      │
      ├──── Statik içerik ──────► CDN (anında)
      │
      └──── Dinamik istek
                 │
                 ▼
          Next.js Middleware
          (Auth kontrolü + i18n yönlendirme)
                 │
          ┌──────▼──────┐
          │  Yetkili mi? │
          │              │
         Evet           Hayır
          │              │
          ▼              ▼
     Rota İşleyici   /login'e
          │           Yönlendir
          ▼
     Auth.js (JWT)
          │
          ▼
     Prisma ORM ──► PostgreSQL
          │
          ▼
     JSON Yanıtı
          │
          ▼
     React Sunucu Bileşeni / İstemci Bileşeni
```

### Veritabanı Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERİTABANI ŞEMASI                          │
│                        (32 temel model)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   KULLANICILAR & KİMLİK DOĞRULAMA    OTELLER & İŞLER            │
│   ──────────────────────────         ─────────────              │
│   User (Kullanıcı)                   Hotel (Otel)               │
│   Account (OAuth)                    HotelEmployer (İşveren)    │
│   Session (Oturum)                   HotelReview (Değerl.)      │
│   VerificationToken                  Job (İş İlanı)             │
│   PasswordResetToken                 Application (Başvuru)      │
│                                      SavedJob (Kaydedilen)      │
│   ADAYLAR                            FavoriteHotel (Favori)     │
│   ──────────                                                    │
│   CandidateProfile                   ÖDEMELER & ABONELİK        │
│   CandidateSkill (Yetenek)           ──────────────────         │
│   CandidateLanguage (Dil)            Subscription (Abonelik)    │
│   WorkExperience (Deneyim)           Payment (Ödeme)            │
│   Education (Eğitim)                                            │
│   Certification (Sertifika)          İLETİŞİM                   │
│   Document (Belge)                   ──────────                 │
│                                      Message (Mesaj)            │
│   YÖNETİM & DENETİM                  Notification (Bildirim)    │
│   ────────────────                                              │
│   Verification (Doğrulama)           AJANS                      │
│   AuditLog (Denetim Kaydı)           ─────                      │
│   SystemConfig (Sistem Ayarı)        Agency (Ajans)             │
│                                      AgencyMember               │
│                                      AgencyHotelPartnership     │
│                                      AgencyCandidate            │
└─────────────────────────────────────────────────────────────────┘
```

### Temel Veritabanı İlişkileri

```
Kullanıcı ─────────────────────────────────────────────────────────┐
  │                                                                │
  ├──► Aday Profili ──► İş Deneyimi                               │
  │         │        ──► Eğitim                                   │
  │         │        ──► Yetenekler                               │
  │         │        ──► Diller                                   │
  │         │        ──► Belgeler                                 │
  │         └──────────► Başvuru ──► İş İlanı                     │
  │                                     │                         │
  ├──► Otel İşvereni ──► Otel ──────────┘                         │
  │                       │                                       │
  │                       ├──► Abonelik ──► Ödeme                 │
  │                       ├──► Otel Değerlendirme                 │
  │                       └──► Doğrulama                          │
  │                                                               │
  ├──► Mesaj (gönderen) ◄──────────────────────── Mesaj ─────────┘
  │         │                                   (alan)
  └──► Bildirim
```

---

## 7. Kullanıcı Rolleri & Hiyerarşi

### Yetki Hiyerarşisi

```
╔══════════════════════════════════════════════════════════════╗
║               HOTELLİNK ROL HİYERARŞİSİ                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │                  SÜPER YÖNETİCİ                       │   ║
║  │  • Tam platform kontrolü                              │   ║
║  │  • Sistem yapılandırması                              │   ║
║  │  • Tüm yönetici yetenekleri + kullanıcı yönetimi     │   ║
║  └─────────────────────┬────────────────────────────────┘   ║
║                         │                                    ║
║  ┌──────────────────────▼────────────────────────────────┐  ║
║  │                    YÖNETİCİ (ADMIN)                    │  ║
║  │  • Otel doğrulama ve onaylama                          │  ║
║  │  • Kullanıcı yönetimi (askıya alma / aktifleştirme)    │  ║
║  │  • Ödeme ve abonelik denetimi                          │  ║
║  │  • Platform analitik ve raporlama                      │  ║
║  │  • Belge doğrulama yönetimi                            │  ║
║  └──────────────┬────────────┬───────────────────────────┘  ║
║                 │            │                               ║
║  ┌──────────────▼──┐   ┌─────▼──────────────────────────┐   ║
║  │   İK AJANSI     │   │      OTEL İŞVERENİ              │   ║
║  │                 │   │                                  │   ║
║  │ • Kendi aday    │   │ • İş ilanı yayınlama            │   ║
║  │   havuzunu      │   │ • Başvuruları inceleme          │   ║
║  │   yönetme       │   │ • Adaylarla mesajlaşma          │   ║
║  │ • Otellerle     │   │ • Otel profili yönetimi         │   ║
║  │   ortaklık      │   │ • Abonelik yönetimi             │   ║
║  │ • Yerleştirme   │   │ • Analitik kontrol paneli       │   ║
║  │   takibi        │   │ • Aday havuzu arama             │   ║
║  │ • Komisyon      │   │ • Mülakat planlama              │   ║
║  │   raporlama     │   │ • Aday doğrulama                │   ║
║  └─────────────────┘   └──────────────────────────────────┘  ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │                       ADAY                            │   ║
║  │  • Doğrulanmış profil oluşturma ve belge yükleme      │   ║
║  │  • İş ilanlarına göz atma ve başvurma                 │   ║
║  │  • Başvuru durumunu takip etme                        │   ║
║  │  • İşverenlerle mesajlaşma                            │   ║
║  │  • Uygunluk durumu ve tercih yönetimi                 │   ║
║  │  • Favori otel ve iş ilanlarını kaydetme              │   ║
║  └──────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════╝
```

### Rol Yetki Matrisi

| Yetenek | Aday | Otel İşvereni | İK Ajansı | Yönetici | Süper Yön. |
|---------|:----:|:-------------:|:---------:|:--------:|:---------:|
| Açık iş ilanlarını görüntüleme | ✓ | ✓ | ✓ | ✓ | ✓ |
| İş ilanlarına başvurma | ✓ | — | — | — | — |
| Aday profili oluşturma | ✓ | — | — | — | — |
| Belge yükleme | ✓ | — | — | — | — |
| İş ilanı yayınlama | — | ✓ | — | ✓ | ✓ |
| Başvuruları inceleme | — | ✓ | — | ✓ | ✓ |
| Aday havuzu arama | — | ✓ | ✓ | ✓ | ✓ |
| Kullanıcılarla mesajlaşma | ✓ | ✓ | ✓ | ✓ | ✓ |
| Otel profilini yönetme | — | ✓ | — | ✓ | ✓ |
| Otel analitiğini görüntüleme | — | ✓ | — | ✓ | ✓ |
| Abonelik yönetimi | — | ✓ | ✓ | ✓ | ✓ |
| Otel doğrulama | — | — | — | ✓ | ✓ |
| Tüm kullanıcıları yönetme | — | — | — | ✓ | ✓ |
| Sistem yapılandırması | — | — | — | — | ✓ |

### Başvuru Durum Akışı

```
                         ┌──────────┐
                         │  TASLAK  │ ◄── Aday taslak kaydeder
                         └────┬─────┘
                              │ Gönder
                              ▼
                        ┌──────────┐
                        │ GÖNDERİLDİ│ ◄── Aday başvurur
                        └────┬─────┘
                             │ Otel inceler
                             ▼
                        ┌──────────┐
                        │ İNCELENİYOR│ ◄── Otel başvuruyu açar
                        └────┬─────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌────────────┐  ┌──────────┐
        │ KISA LİSTE│  │  REDDEDİLDİ│  │ GERİ ÇEK.│◄─ Aday
        └─────┬─────┘  └────────────┘  └──────────┘
              │
              ▼
    ┌──────────────────┐
    │MÜLAKAT PLANLANMASI│
    └────────┬──────────┘
             │
             ▼
    ┌──────────────────┐
    │MÜLAKAT TAMAMLANDI │
    └────────┬──────────┘
             │
             ▼
      ┌──────────────┐
      │ TEKLİF YAPILDI│
      └──────┬───────┘
             │
       ┌─────┴──────┐
       ▼            ▼
┌─────────────┐  ┌───────────────┐
│TEKLİF KABUL │  │ TEKLİF REDDİ  │
└─────────────┘  └───────────────┘
```

### Otel Doğrulama Akışı

```
Otel Kaydolur
      │
      ▼
┌──────────────────────┐
│  DOĞRULAMA BEKLİYOR   │ ◄── Otel belgeleri yükler
└──────────┬───────────┘
           │
    Yönetici inceler
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌──────────┐
│DOĞRULANDI│  │ REDDEDİLDİ│
│  ✓     │  │  ✗       │
└────┬───┘   └──────────┘
     │
  ┌──┴──┐
  ▼     ▼
AKTİF  ASKIDA ◄── Kural ihlali
```

---

## 8. Ürün Özellikleri

### Modüllere Göre Özellik Genel Bakışı

#### Otel Portalı
```
┌─────────────────────────────────────────────────────────┐
│                   OTEL KONTROL PANELİ                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  İLAN YÖNETİMİ            BAŞVURU BORU HATTI            │
│  ─────────────            ──────────────────            │
│  ✓ İlan oluşturma/düzenleme  ✓ Kanban tarzı boru hattı  │
│  ✓ Maaş aralığı belirleme   ✓ Başvuruları yıldızlama   │
│  ✓ Şartlar listesi           ✓ Toplu durum güncelleme   │
│  ✓ Sosyal haklar paketi      ✓ Notlar ve yorumlar       │
│  ✓ Taslak / yayınla          ✓ ÖZ indir ve önizle       │
│  ✓ Son başvuru tarihi        ✓ Mülakat planlama         │
│  ✓ Öne çıkan ilan güçlend.   ✓ Durum bildirimleri      │
│                                                          │
│  ADAY ARAMA               ANALİTİK                      │
│  ─────────────            ────────                      │
│  ✓ Tam metin arama        ✓ Başvuru trend grafiği       │
│  ✓ Dile göre filtreleme   ✓ Departmana göre dağılım    │
│  ✓ Uygunluğa göre filtre  ✓ Milliyet ısı haritası      │
│  ✓ Gizlenmiş soyadlar     ✓ Görüntülemeden başvuruya   │
│  ✓ Profil tamamlanma      ✓ Zaman serisi metrikleri    │
│  ✓ Doğrudan mesajlaşma    ✓ Rapor dışa aktarma         │
│                                                          │
│  OTEL PROFİLİ             ABONELİK                      │
│  ─────────────            ─────────                     │
│  ✓ Kapak fotoğrafı & logo ✓ Plan yönetimi               │
│  ✓ Olanak seçenekleri     ✓ Stripe faturalandırma       │
│  ✓ Çok dilli açıklama     ✓ Kullanım limiti paneli      │
│  ✓ Konum & iletişim       ✓ Fatura geçmişi              │
│  ✓ SEO uyumlu URL slug    ✓ Yükseltme / düşürme         │
└─────────────────────────────────────────────────────────┘
```

#### Aday Portalı
```
┌─────────────────────────────────────────────────────────┐
│                   ADAY KONTROL PANELİ                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  PROFİL OLUŞTURUCU         BELGE KASASI                 │
│  ─────────────────         ─────────────                │
│  ✓ Fotoğraf & kapak        ✓ ÖZ / Özgeçmiş yükleme     │
│  ✓ Profesyonel başlık      ✓ Pasaport taraması          │
│  ✓ Biyografi & özet        ✓ Çalışma izni belgeleri     │
│  ✓ Yetenekler (etiket)     ✓ Diploma sertifikaları      │
│  ✓ Dil seviyeleri          ✓ Referans mektupları        │
│  ✓ İş geçmişi              ✓ Sertifikalar               │
│  ✓ Eğitim                  ✓ Belge durum takibi         │
│  ✓ Sertifikalar            ✓ Son kullanma hatırlatıcısı │
│  ✓ Uygunluk durumu                                      │
│  ✓ Maaş beklentisi         İŞ KEŞFİ                     │
│  ✓ Yer değiştirme tercihi  ────────────                 │
│  ✓ Herkese açık/gizli      ✓ Tam metin arama            │
│                             ✓ Şehir/dept/maaş filtre    │
│  BAŞVURU TAKİBİ             ✓ Öne çıkan oteller         │
│  ─────────────────          ✓ İlanları kaydetme         │
│  ✓ Durum zaman çizelgesi   ✓ Tek tıkla başvur          │
│  ✓ Duruma göre filtrele    ✓ Ön yazı düzenleyici       │
│  ✓ Teklif yönetimi         ✓ Web Share API ile paylaş  │
│  ✓ Geri çekme seçeneği                                  │
└─────────────────────────────────────────────────────────┘
```

#### Yönetici Paneli
```
┌─────────────────────────────────────────────────────────┐
│                  YÖNETİCİ KONTROL PANELİ                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  KULLANICI YÖNETİMİ         OTEL YÖNETİMİ              │
│  ──────────────────         ───────────────             │
│  ✓ Tam kullanıcı tablosu    ✓ Tüm oteller tablosu       │
│  ✓ Rol atama                ✓ Doğrulama iş akışı        │
│  ✓ Askıya alma / aktifleşt. ✓ Öne çıkar / kaldır       │
│  ✓ Giriş geçmişi           ✓ Gerekçeli reddetme        │
│  ✓ Role göre filtreleme     ✓ Otel detaylarını görme    │
│                             ✓ Durum yönetimi            │
│  DOĞRULAMA KUYRUĞU          GELİR TABLOSU               │
│  ──────────────────         ──────────────              │
│  ✓ Bekleyen doğrulamalar    ✓ MRR / ARR metrikleri      │
│  ✓ Yüklenen belgeler        ✓ Gelir trend grafiği       │
│  ✓ Onayla / reddet          ✓ Abonelik dağılımı         │
│  ✓ Ek bilgi iste            ✓ Başarısız ödeme uyarıları │
│  ✓ Denetim izi              ✓ Ödeme geçmişi tablosu     │
│                             ✓ CSV olarak dışa aktar     │
│  PLATFORM İSTATİSTİKLERİ                                │
│  ───────────────────────                                │
│  ✓ Toplam kullanıcı/otel                                │
│  ✓ Aktif ilan sayısı                                    │
│  ✓ Bugünkü başvurular                                   │
│  ✓ Bu ayki gelir                                        │
└─────────────────────────────────────────────────────────┘
```

### Mesajlaşma Sistemi

```
┌──────────────────────────────────────────────────────────┐
│                  UYGULAMA İÇİ MESAJLAŞMA                  │
├──────────────────────┬───────────────────────────────────┤
│  KONUŞMA LİSTESİ     │  MESAJ GEÇMİŞİ                   │
│  ─────────────────   │  ─────────────                    │
│  ✓ En yeniye göre    │  ✓ Otomatik kaydırma              │
│    sıralama          │  ✓ Gönderildi/alındı stili        │
│  ✓ Okunmamış rozetl. │  ✓ Zaman damgası gösterimi        │
│  ✓ Son mesaj önizl.  │  ✓ Enter ile gönder               │
│  ✓ Avatar baş harf   │  ✓ Otomatik okundu işareti        │
│  ✓ Arama filtresi    │  ✓ Framer Motion animasyonları    │
│                      │  ✓ Mesaj bildirimleri             │
│  MOBİL UYUMLU                                            │
│  ✓ Geri kaydırma     │                                   │
│  ✓ Dokunuş optimize  │                                   │
└──────────────────────┴───────────────────────────────────┘
```

---

## 9. Güvenlik & Uyumluluk

### Kimlik Doğrulama & Yetkilendirme

```
┌─────────────────────────────────────────────────────────┐
│                  GÜVENLİK MİMARİSİ                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  KİMLİK DOĞRULAMA           YETKİLENDİRME               │
│  ─────────────────          ───────────────             │
│  ✓ NextAuth v5 (Auth.js)    ✓ Rol tabanlı (RBAC)        │
│  ✓ JWT oturumları           ✓ Rota middleware           │
│  ✓ Şifre + OAuth            ✓ API seviyesinde kontrol   │
│  ✓ bcrypt (maliyet 12)      ✓ Kaynak sahipliği          │
│  ✓ Güvenli token rotasyonu  ✓ Yönetici geçersiz kılma   │
│  ✓ Google OAuth             ✓ Aday veri maskeleme       │
│                                                          │
│  VERİ KORUMA                 ALTYAPI                    │
│  ──────────                  ─────────                  │
│  ✓ Soyad maskeleme           ✓ HTTPS zorunlu            │
│  ✓ Şifre sıfırlama tokeni    ✓ CSP başlıkları           │
│  ✓ Zod girdi doğrulama       ✓ X-Frame-Options: DENY    │
│  ✓ SQL enjeksiyon önleme     ✓ XSS koruma başlığı       │
│  ✓ CSRF koruması             ✓ Referrer-Policy          │
│  ✓ Yumuşak silme (denetim)   ✓ İzin Politikası          │
│                              ✓ Hız sınırlama (Redis)    │
│                                                          │
│  DENETİM & UYUMLULUK                                    │
│  ────────────────────                                   │
│  ✓ Tam denetim kaydı (tüm CRUD işlemleri)               │
│  ✓ Kullanıcı eylem takibi (kim, ne, ne zaman)           │
│  ✓ KVKK/GDPR uyumlu veri modeli (yumuşak silme, dışa)  │
│  ✓ Sentry hata izleme entegrasyonu                      │
└─────────────────────────────────────────────────────────┘
```

### KVKK & Veri Gizliliği

- Tüm kişisel veriler KVKK uyumlu PostgreSQL örneğinde saklanır
- Aday soyadları, işveren olmayan görüntüleyenler için maskelenir
- Yumuşak silme yapısı, silme talepleri karşılanırken denetim izlerini korur
- Belge depolama, süreli erişim ile Supabase üzerinden yapılır
- Üçüncü taraf reklam izleme pikseli yok

---

## 10. Teknoloji Yığını

### Tam Yığın Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                     TEKNOLOJİ YIĞINI                         │
├──────────────────────┬──────────────────────────────────────┤
│  KATMAN               │  TEKNOLOJİ                          │
├──────────────────────┼──────────────────────────────────────┤
│  Ön yüz Framework    │  Next.js 14 (App Router + RSC)       │
│  Programlama Dili    │  TypeScript 5 (katı mod)             │
│  Stil               │  Tailwind CSS 3 + CSS Değişkenleri    │
│  UI Bileşenleri      │  Özel shadcn/ui + Radix primitifler   │
│  Animasyon          │  Framer Motion 11                     │
│  Grafikler           │  Recharts 2                          │
│  Formlar             │  React Hook Form + Zod               │
│  İkonlar             │  Lucide React                        │
│  Bildirimler         │  Sonner                              │
├──────────────────────┼──────────────────────────────────────┤
│  Arka Yüz            │  Next.js API Rotaları (Edge uyumlu)  │
│  Kimlik Doğrulama    │  Auth.js v5 (NextAuth beta)          │
│  ORM                 │  Prisma 5                            │
│  Veritabanı          │  PostgreSQL 16                       │
│  Dosya Depolama      │  Supabase Storage                    │
│  Önbellekleme/Limit  │  Redis (Upstash serverless için)     │
├──────────────────────┼──────────────────────────────────────┤
│  Ödemeler            │  Stripe (abonelikler + webhook'lar)  │
│  E-posta             │  Resend (işlemsel)                   │
│  OAuth               │  Google, LinkedIn                    │
│  İzleme              │  Sentry                              │
│  Analitik            │  PostHog                             │
├──────────────────────┼──────────────────────────────────────┤
│  Dağıtım             │  Vercel (otomatik ölçekleme, edge)   │
│  CDN                 │  Cloudflare                          │
│  CI/CD               │  GitHub Actions                      │
├──────────────────────┼──────────────────────────────────────┤
│  Çoklu Dil           │  next-intl v3 (TR / EN / RU)        │
│  SEO                 │  Next.js Metadata API + site haritası│
│  PWA                 │  Web App Manifest + service worker   │
└──────────────────────┴──────────────────────────────────────┘
```

### Neden Bu Teknoloji Yığını?

| Karar | Gerekçe |
|-------|---------|
| **Next.js 14** | Sunucu bileşenleri JS paketini azaltır; yerleşik i18n; edge dağıtımı |
| **TypeScript (Katı)** | Sıfır çalışma zamanı tip hatası; kendini belgeleyen kod tabanı |
| **Prisma ORM** | Tip güvenli DB erişimi; otomatik migrasyon yönetimi |
| **Auth.js v5** | Üretimde kanıtlanmış; şifre + OAuth destekli; JWT + DB oturumları |
| **Stripe** | Endüstri standardı abonelik faturalandırması; PCI DSS uyumlu |
| **Vercel** | Sıfır yapılandırmalı dağıtım; küresel edge ağı; önizleme dağıtımları |
| **Tailwind CSS** | Yardımcı program öncelikli; tutarlı tasarım sistemi; üretimde ölü CSS yok |

---

## 11. Rekabet Analizi

### Pazar Ortamı

```
                    YÜKSEK ÖZELLİK DERİNLİĞİ
                           │
           HotelLink ●     │
                           │
  Konaklama    ◄──────────┼──────────► Genel
  Odaklı                  │              Pazar
                     ●     │       ●
                  Hotel.de  │   LinkedIn
                           │
                     ●     │       ●
                  Hosco    │   Indeed
                           │
                    DÜŞÜK ÖZELLİK DERİNLİĞİ
```

### Rekabet Matrisi

| Platform | Konaklama Odağı | Çok Dilli | BDT Erişimi | Çal. İzni | SaaS Modeli | Türkiye Pazar |
|----------|:--------------:|:---------:|:-----------:|:---------:|:-----------:|:-------------:|
| **HotelLink** | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ |
| Hosco | ✓✓✓ | ✓✓ | ✗ | ✗ | ✓✓ | ✗ |
| Hcareers | ✓✓✓ | ✗ | ✗ | ✗ | ✓✓ | ✗ |
| LinkedIn | ✓ | ✓✓✓ | ✓✓ | ✗ | ✓✓ | ✓ |
| Indeed | ✓ | ✓✓ | ✓ | ✗ | ✓ | ✓ |
| Yerel ajanslar | ✓✓ | ✓ | ✓✓ | ✓ | ✗ | ✓✓✓ |

**HotelLink'in Rekabet Avantajı:**
1. **Dil yerel BDT aday havuzu** — Rusça kullanıcı arayüzü ve aday tabanını hızlıca kopyalamak son derece güç
2. **Çalışma izni rehberliği** — Türkiye'ye özgü çalışma izni iş akışının doğrudan rakibi yok
3. **Doğrulama katmanı** — Belge doğrulamalı profiller güvenilir bir pazar yeri oluşturur
4. **Üç taraflı ağ etkileri** — Oteller, adaylar VE ajanslar katışımlı değer yaratır

---

## 12. Pazara Giriş Stratejisi

### 1. Aşama — İstanbul Lansmanı (1–4. Aylar)

```
HEDEF: 50 otel, 2.000 aday, 3 ajans

Kanallar:
  ✓ İstanbul'daki 5 yıldızlı otellere doğrudan satış (Beşiktaş, Şişli, Beyoğlu)
  ✓ 3 köklü İK ajansıyla ortaklık (ortak pazarlama)
  ✓ Türkiye'deki BDT konaklama çalışanlarına Telegram/VK topluluk erişimi
  ✓ Türk otellerindeki İK Direktörlerine yönelik LinkedIn B2B kampanyaları
  ✓ İçerik: Türk otel sektörü blogu + Rusça aday rehberi
```

### 2. Aşama — Kıyı Genişlemesi (5–10. Aylar)

```
HEDEF: 250 otel, 10.000 aday, 15 ajans

Pazarlar:
  ✓ Antalya — Türkiye'nin en büyük tatil köyü koridoru (50.000+ konaklama çalışanı)
  ✓ Bodrum — Lüks butik otel kümesi
  ✓ İzmir — Ege otel pazarı

Kanallar:
  ✓ Otel zinciri kurumsal anlaşmaları (5+ mülk = Kurumsal kademe)
  ✓ TÜROB (Türkiye Otelciler Birliği) ortaklığı
  ✓ Rusya/Kazakistan sosyal medya kampanyaları aracılığıyla aday temini
  ✓ Konaklama vize rehberleri için Rusça SEO içeriği
```

### 3. Aşama — BDT Kaynak Pazarları (11–18. Aylar)

```
HEDEF: 1.000 otel, 50.000 aday, 50 ajans

Genişleme:
  ✓ Moskova, Almatı, Kyiv'de ofis / temsilcilikler (uzaktan öncelikli)
  ✓ Rusya ve Kazakistan'daki konaklama okullarıyla üniversite ortaklıkları
  ✓ Vize rehberi içeriği için Türk konsolosluklarıyla ortaklık
  ✓ Gürcistan, Ermenistan, Kırgızistan aday pazarlarına genişleme
```

### Müşteri Edinim Hunisi

```
FARKINDLIK       DEĞERLENDİRME        DÖNÜŞÜM           ELDE TUTMA
─────────        ─────────────        ────────          ──────────
SEO içeriği ──► Ücretsiz otel ────► Ücretsiz→Başl. ──► CSM takipleri
LinkedIn rek.──► Demo rezervasyon ──► Stripe fatura ──► Kullanım raporu
Ajans ref.   ──► Deneme süresi   ──► İlk işe alım  ──► Özellik güncel.
TÜROB list.  ──► Özellik karşıl. ──► Katılım       ──► Referans prog.
```

---

## 13. Mevcut Durum & Traction

### Platform Durumu

| Öğe | Durum |
|-----|-------|
| Temel platform geliştirme | **Tamamlandı** |
| TypeScript derleme | **0 hata** |
| Üretim build | **Başarılı** |
| Veritabanı şeması | **32 model, üretime hazır** |
| API uç noktaları | **28 rota, test edildi** |
| Kullanıcı arayüzü sayfaları | **Tüm roller için 40+ sayfa** |
| Mobil uyumlu | **Evet** |
| PWA hazır | **Evet** |
| Çoklu dil | **TR / EN / RU** |
| Stripe entegrasyonu | **Tamamlandı** |
| Kimlik doğrulama sistemi | **Tamamlandı** |
| Yönetici paneli | **Tamamlandı** |

### Lansman Öncesi Metrikler (Tohum Verisi)

```
6 ortak otel       ─── İstanbul, Bodrum, Nevşehir, Antalya, Marmaris
9 aktif iş ilanı   ─── Ön Büro, Y&İ, Spa, Animasyon, Yönetim
5 aday profili     ─── Rus, Ukraynalı, Kazak, Yunan milliyetleri
3 abonelik kademesi ── Ücretsiz, Profesyonel, Kurumsal aktif
```

### Halka Açık Lansmana Kalanlar

1. **Alan adı & SSL** — hotellink.com (veya hotellink.com.tr) yapılandırması
2. **Üretim Veritabanı** — Supabase/Railway PostgreSQL'e geçiş
3. **Supabase Depolama** — Belge yükleme klasörünü etkinleştirme
4. **Stripe Canlı Anahtarlar** — Test modundan üretim moduna geçiş
5. **Resend E-posta** — İşlemsel e-posta alan adı yapılandırması
6. **Google OAuth** — Üretim alan adı için OAuth uygulaması kaydı
7. **İlk 10 pilot oteli dahil etme** — Manuel erişim, 3 aylık ücretsiz Kurumsal

**Mevcut ekiple halka açık lansmanın tahmini süresi: 2–3 hafta**

---

## 14. Ürün Yol Haritası

### 1. Ufuk — Pazar Lansmanı (2025 1. ve 2. Çeyrek)

```
[ ] Üretim altyapısı kurulumu
[ ] İlk 50 otel katılımı (özel ilgi ile)
[ ] Rusça pazarlama kampanyası (Telegram, VK)
[ ] Mobil optimize edilmiş aday katılım akışı
[ ] Temel e-posta bildirim sistemi (Resend)
[ ] Çalışma izni rehber içeriği (PDF + uygulama içi)
```

### 2. Ufuk — Büyüme Özellikleri (2025 3. ve 4. Çeyrek)

```
[ ] YZ destekli iş eşleştirme (aday ↔ iş uyumluluk skoru)
[ ] Adaylar için video tanıtım yüklemeleri
[ ] Otomatik çalışma izni başvurusu takibi
[ ] Otel PMS entegrasyonları (Oracle OPERA, Protel)
[ ] Aday tavsiye sistemi (başarılı yerleştirme için kazanç)
[ ] Mobil uygulama (React Native, paylaşılan iş mantığı)
[ ] Gelişmiş ajans beyaz etiket portalı
```

### 3. Ufuk — Platform Genişlemesi (2026)

```
[ ] Yunanistan, Kıbrıs, BAE otel pazarlarına genişleme
[ ] Arapça ve Ukraynaca dil desteği
[ ] Bordro entegrasyonu (Stripe Connect, bordro API'leri)
[ ] Yerleşik mülakat planlama (Calendly tarzı)
[ ] Uyumluluk otomasyonu (çalışma izni yenileme uyarıları)
[ ] HotelLink Akademi — konaklama çalışanları için online kurslar
[ ] B2C geliri: aday premium abonelikleri
```

---

## 15. Finansal Model

### Gelir Tahminleri

```
                    1. YIL          2. YIL          3. YIL
                    ──────          ──────          ──────
Oteller (ücretli)     45             210             850
  Ücretsiz kademe    120             400            1.200
  Başlangıç (149$)    28             140             500
  Profesyonel (399$)  13              55             280
  Kurumsal (899$)      4              15              70

Aylık Yinelenen     14.200 $       67.800 $       285.000 $
Gelir — Yıl sonu
Yıllık Yinelenen    170.000 $     814.000 $      3.400.000 $
Gelir

Diğer Gelirler:
  Ajans lisanslama   18.000 $       95.000 $      380.000 $
  Öne çıkan ilanlar   8.000 $       42.000 $      165.000 $
  Çalışma izni hizm. 12.000 $       58.000 $      220.000 $
  ──────────────────────────────────────────────────────────
TOPLAM GELİR        208.000 $    1.009.000 $    4.165.000 $
Brüt Marj (tahmini)     %78            %80            %82
```

### Temel Varsayımlar

- Ortalama otel platformda **36 ay** kalmaktadır (kayıptan önce)
- 12. ayda yeni otel kayıtlarının **%40'ı** organik ağızdan ağıza ile gelir
- Aday tarafı **sonsuza kadar ücretsiz** — büyüme BDT topluluk erişimi ile organik
- Ajans kademesi, düşük CAC ile öngörülebilir yüksek LTV geliri sağlar

### Maliyet Yapısı (1. Yıl)

| Kategori | Aylık | Yıllık |
|----------|-------|--------|
| Altyapı (Vercel + DB + CDN) | 800 $ | 9.600 $ |
| Stripe ücretleri (%2,9 + 0,30 $) | ~600 $ | ~7.200 $ |
| E-posta & dış API'ler | 200 $ | 2.400 $ |
| Mühendislik (2 geliştirici) | 12.000 $ | 144.000 $ |
| Satış & Pazarlama | 5.000 $ | 60.000 $ |
| Hukuki & Uyumluluk | 1.000 $ | 12.000 $ |
| **Toplam Faaliyet Gideri** | **19.600 $** | **235.200 $** |

**Başa baş noktası:** ~165 ücretli otel (fonlamayla 10. ayda ulaşılabilir)

---

## 16. Ekip & İşe Alım Planı

### Mevcut Ekip

| Rol | Sorumluluk |
|-----|-----------|
| Kurucu / CEO | Vizyon, satış, ortaklıklar |
| Tam Yığın Geliştirici | Platform geliştirme (tamamlandı) |

### Acil İşe Alımlar (Tohum Turu)

```
ÖNCELİK 1 — Gelir Kritik
┌─────────────────────────────────────────────────┐
│  Satış Müdürü (Türkiye)                          │
│  Hedef: 6 ayda 50 otel                          │
│  Ücret: Taban + abonelikte %8 komisyon          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Topluluk Yöneticisi (Rusça konuşan)             │
│  Hedef: 6 ayda 5.000 BDT adayı                  │
│  Kanallar: Telegram, VK, Instagram              │
└─────────────────────────────────────────────────┘

ÖNCELİK 2 — Operasyonlar
┌─────────────────────────────────────────────────┐
│  Müşteri Başarı Yöneticisi                       │
│  Otel katılımı ve elde tutma işlemleri           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Arka Yüz / DevOps Mühendisi                     │
│  Altyapıyı ölçeklendirme; YZ özellikleri         │
└─────────────────────────────────────────────────┘
```

---

## 17. Yatırım Talebi & Fonun Kullanımı

### Talep: **500.000 $ Tohum Turu**

```
FON KULLANIMI DAĞILIMI
══════════════════════

  180.000 $ ─── Mühendislik (2 kıdemli geliştirici × 12 ay)
               └── YZ eşleştirme, mobil uygulama, PMS entegrasyonları

  120.000 $ ─── Satış & Pazarlama
               ├── Türkiye otel doğrudan satış ekibi
               ├── BDT sosyal medya kampanyaları (Rusça)
               └── SEO + içerik (Türkçe & Rusça)

   80.000 $ ─── Operasyonlar & Müşteri Başarısı
               ├── Müşteri başarı yöneticisi
               └── Otel katılımı & destek

   60.000 $ ─── Altyapı & Araçlar
               ├── Üretim bulut altyapısı
               ├── Stripe, Supabase, Vercel (üretim)
               └── Hukuki, uyumluluk, veri koruma

   60.000 $ ─── İşletme Sermayesi & Tampon
               └── 18 aylık operasyonel çalışma süresi
  ────────────────────────────────────────────────────
  500.000 $    TOPLAM
```

### Bu Tur İçin Kilometre Taşları

| Kilometre Taşı | Hedef Ay |
|----------------|---------|
| Üretim lansmanı (halka açık) | 1. Ay |
| 50 ücretli otel | 4. Ay |
| 5.000 kayıtlı aday | 5. Ay |
| 3 ajans ortaklığı | 6. Ay |
| 15.000 $ Aylık Yinelenen Gelir | 8. Ay |
| A Serisi hazırlığı | 18. Ay |

### Yatırımcılara Sunduklarımız

- **Hisse:** Müzakereye açık (500.000 $ karşılığında %15–25)
- **Yönetim Kurulu Koltuğu:** Lider yatırımcı için mevcut
- **Raporlama:** Aylık KPI kontrol paneli erişimi
- **Çıkış Ufku:** Stratejik satın alma (Seek, Recruit Holdings, Adecco) veya 18–24 ay içinde A Serisi

---

## 18. Erişim & Giriş Bilgileri

### Geliştirme Ortamı

```
Uygulama URL'si:     http://localhost:3001
Veritabanı:          PostgreSQL @ localhost:5432/hotellink
Prisma Studio:       npx prisma studio (port 5555)
```

### Test Hesapları

| Rol | E-posta | Şifre | Kontrol Paneli |
|-----|---------|-------|----------------|
| **Süper Yönetici** | `admin@hotellink.com` | `Password123!` | `/tr/dashboard/admin` |
| **Otel İşvereni** | `employer@grandluxury.com` | `Password123!` | `/tr/dashboard/hotel` |
| **Otel İşvereni** | `employer@aegeanresort.com` | `Password123!` | `/tr/dashboard/hotel` |
| **Aday** | `elena.kozlova@example.com` | `Password123!` | `/tr/dashboard/candidate` |
| **Aday** | `dmitri.volkov@example.com` | `Password123!` | `/tr/dashboard/candidate` |

### Demo İçin Önemli URL'ler

| Sayfa | URL |
|-------|-----|
| Ana sayfa | `/tr` |
| İş ilanları | `/tr/jobs` |
| Otel dizini | `/tr/hotels` |
| Grand Luxury otel profili | `/tr/hotels/grand-luxury-istanbul` |
| Aday kontrol paneli | `/tr/dashboard/candidate` |
| Otel işveren paneli | `/tr/dashboard/hotel` |
| Analitik | `/tr/dashboard/hotel/analytics` |
| Yönetici paneli | `/tr/dashboard/admin` |
| Mesajlaşma | `/tr/dashboard/messages` |
| Giriş | `/tr/login` |
| Kayıt | `/tr/register` |

### Geliştirme Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Şemayı veritabanına ilet
npm run db:push

# Veritabanını doldur
npm run db:seed

# Prisma Studio'yu aç (DB tarayıcısı)
npm run db:studio

# Tip kontrolü
npm run type-check

# Üretim build
npm run build
```

### Minimum Gereken Ortam Değişkenleri

```env
DATABASE_URL="postgresql://KULLANICI:SIFRE@SUNUCU:5432/hotellink"
DIRECT_URL="postgresql://KULLANICI:SIFRE@SUNUCU:5432/hotellink"
AUTH_SECRET="[32+ karakter rastgele string]"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Ek A — API Uç Nokta Referansı

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/hotels` | Herkese açık | Otel arama |
| POST | `/api/hotels` | İşveren | Otel oluşturma |
| GET | `/api/jobs` | Herkese açık | İş ilanı arama |
| POST | `/api/jobs` | İşveren | İlan oluşturma |
| GET | `/api/jobs/[id]` | Herkese açık | İlan detayı |
| PATCH | `/api/jobs/[id]` | İşveren | İlan güncelleme |
| DELETE | `/api/jobs/[id]` | İşveren | İlanı kaldırma |
| GET | `/api/applications` | Giriş zorunlu | Başvuru listesi |
| POST | `/api/applications` | Aday | İş başvurusu |
| PATCH | `/api/applications/[id]` | Giriş zorunlu | Durum güncelleme |
| GET | `/api/messages` | Giriş zorunlu | Konuşmalar |
| POST | `/api/messages` | Giriş zorunlu | Mesaj gönderme |
| GET | `/api/candidates` | İşveren | Aday arama |
| GET | `/api/candidates/[id]` | Giriş zorunlu | Aday profili |
| GET | `/api/profile/candidate` | Aday | Kendi profili |
| PATCH | `/api/profile/candidate` | Aday | Profil güncelleme |
| GET | `/api/profile/hotel` | İşveren | Kendi oteli |
| PATCH | `/api/profile/hotel` | İşveren | Otel güncelleme |
| GET | `/api/documents` | Aday | Belge listesi |
| POST | `/api/documents` | Aday | Belge yükleme |
| DELETE | `/api/documents/[id]` | Aday | Belge silme |
| GET | `/api/notifications` | Giriş zorunlu | Bildirimler |
| PATCH | `/api/notifications` | Giriş zorunlu | Okundu işaretle |
| POST | `/api/stripe/checkout` | İşveren | Ödeme oturumu oluşturma |
| POST | `/api/stripe/webhook` | Stripe | Webhook işleyici |
| GET | `/api/admin/stats` | Yönetici | Platform istatistikleri |
| GET | `/api/admin/users` | Yönetici | Tüm kullanıcılar |
| PATCH | `/api/admin/users/[id]` | Yönetici | Kullanıcı güncelleme |
| GET | `/api/admin/hotels` | Yönetici | Tüm oteller |
| PATCH | `/api/admin/hotels/[id]` | Yönetici | Otel güncelleme |
| POST | `/api/admin/hotels/[id]/verify` | Yönetici | Otel doğrulama |
| POST | `/api/admin/hotels/[id]/reject` | Yönetici | Otel reddetme |
| GET | `/api/admin/verifications` | Yönetici | Doğrulama kuyruğu |
| POST | `/api/admin/verifications/[id]/approve` | Yönetici | Onaylama |
| POST | `/api/admin/verifications/[id]/reject` | Yönetici | Reddetme |
| GET | `/api/admin/payments` | Yönetici | Tüm ödemeler |
| POST | `/api/auth/register` | Herkese açık | Kullanıcı kaydı |
| POST | `/api/auth/forgot-password` | Herkese açık | Sıfırlama talebi |
| POST | `/api/auth/reset-password` | Herkese açık | Şifre sıfırlama |

---

## Ek B — Veritabanı Model Sayısı

| Kategori | Model Sayısı | Temel Modeller |
|----------|:------------:|----------------|
| Kullanıcılar & Kimlik Doğrulama | 5 | User, Account, Session, VerificationToken, PasswordResetToken |
| Oteller | 4 | Hotel, HotelEmployer, HotelReview, FavoriteHotel |
| İş İlanları | 3 | Job, SavedJob, Application |
| Adaylar | 8 | CandidateProfile, Skills, Languages, WorkExperience, Education, Certification, Document |
| Ödemeler | 2 | Subscription, Payment |
| İletişim | 2 | Message, Notification |
| Ajans | 4 | Agency, AgencyMember, AgencyHotelPartnership, AgencyCandidate |
| Yönetim | 3 | Verification, AuditLog, SystemConfig |
| **Toplam** | **31** | |

---

*Belge hazırlanma tarihi: Mayıs 2025*
*Platform sürümü: 1.0.0-MVP*
*Tüm finansal tahminler, karşılaştırılabilir SaaS pazar yeri referans değerlerine dayanmaktadır.*
