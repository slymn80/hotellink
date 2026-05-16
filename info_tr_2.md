# HotelLink — Platform Tanıtımı & Yatırım Dosyası (v2)

> **Türkiye'nin Lider Otellerini Küresel Konaklama Yetenekleriyle Buluşturuyor**
>
> Konaklama sektörü için özel olarak geliştirilmiş, üretime hazır, çok dilli B2B2C SaaS işe alım platformu.

---

## İçindekiler

1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Problem](#2-problem)
3. [Çözüm](#3-çözüm)
4. [Pazar Fırsatı](#4-pazar-fırsatı)
5. [İş Modeli & Gelir Akışları](#5-iş-modeli--gelir-akışları)
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
16. [Ekip & İşe Alım Planı](#16-ekip--işe-alım-planı)
17. [Yatırım Talebi & Fonun Kullanımı](#17-yatırım-talebi--fonun-kullanımı)
18. [Erişim & Giriş Bilgileri](#18-erişim--giriş-bilgileri)

---

## 1. Yönetici Özeti

**HotelLink**, başta Rusya, Ukrayna, Kazakistan ve Doğu Avrupa'dan gelen uluslararası çalışanları Türkiye'deki otellerle buluşturan çok dilli bir konaklama sektörü işe alım SaaS platformudur. Platform dört taraflı bir pazar yeri olarak işler: oteller iş ilanı açar ve başvuruları yönetir, adaylar doğrulanmış profil oluşturur ve başvurur, İK ajansları ölçekli yerleştirme işlemlerini kolaylaştırır, yöneticiler ise tüm platformu denetler.

| Metrik | Detay |
|--------|-------|
| **Platform Türü** | B2B2C SaaS Pazar Yeri |
| **Birincil Pazar** | Türk Konaklama Sektörü |
| **Aday Tabanı** | BDT + Doğu Avrupa ülkeleri |
| **Desteklenen Diller** | İngilizce, Türkçe, Rusça |
| **Para Kazanma** | Otel abonelik kademeleri + ajans lisanslama |
| **Teknoloji** | Next.js 14 · Prisma 5 · PostgreSQL · Stripe · OpenAI |
| **Mevcut Aşama** | MVP tamamlandı, üretime hazır |
| **Hedef** | Pazar lansmanı için tohum yatırımı |

Türkiye'nin otel sektörü **1,3 milyonun üzerinde** çalışan istihdam etmektedir. Uluslararası yeteneğe olan talep, pandemi öncesi dönemden bu yana en yüksek seviyesindedir. HotelLink, büyük ölçüde çevrimdışı işleyen, parçalı bir işe alım pazarını; özellikleri tamamlanmış, ölçeklenebilir ve yapay zeka destekli bir dijital platformla ele almaktadır.

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
- Aday havuzu görünürlüğü için birleşik bir kontrol paneli yok
- Parçalı faturalandırma ve sözleşme yönetimi
- Otel müşterilerine yatırım getirisini kanıtlayamama

---

## 3. Çözüm

HotelLink, konaklama yeteneği pazarı için birleşik bir dijital altyapı sunar:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          HOTELLİNK PLATFORMU                             │
├──────────────────┬──────────────────────┬──────────────┬─────────────────┤
│   OTEL PORTALI   │   ADAY PORTALI       │ AJANS PORTALI│ YÖNETİCİ PANELİ │
│                  │                      │              │                 │
│ • İş ilanı       │ • Profil oluşturma   │ • Aday havuz │ • Kullanıcı yön.│
│ • Başvuru yön.   │ • Belge kasası        │ • Otel ort.  │ • Otel doğrulama│
│ • Analitik       │ • İş keşfi           │ • Analitik   │ • Gelir raporları│
│ • Mesajlaşma     │ • Başvuru takibi     │ • Mesajlaşma │ • İçerik yönet. │
│ • Doğrulama      │ • Çalışma izni rehb. │ • Yerleştirme│ • Destek bilet. │
│ • Abonelik       │ • YZ iş eşleştirme  │ • Profil yön.│ • Sistem ayarları│
│ • Çoklu otel     │ • Çok dilli arayüz   │              │ • Denetim kaydı │
└──────────────────┴──────────────────────┴──────────────┴─────────────────┘
```

**Temel Değer Önerisi:**
- **Oteller İçin:** Ajans maliyetinin çok altında 12.000+ önceden doğrulanmış uluslararası adaya erişim
- **Adaylar İçin:** Vizeli çalışma izni süreciyle şeffaf iş pazar yeri + YZ destekli eşleştirme
- **Ajanslar İçin:** Aday havuzu ve otomatik yerleştirme takibi ile dijital öncelikli operasyon platformu

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

---

## 5. İş Modeli & Gelir Akışları

### Birincil Gelir: Otel Abonelikleri (SaaS)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ABONELİK KADEMELERİ                          │
├──────────────┬─────────────────┬──────────────────┬──────────────────┤
│    ÜCRETSİZ  │    BAŞLANGIÇ    │   PROFESYONEL    │    KURUMSAL      │
│              │                 │                  │                  │
│  0 $/ay      │  149 $/ay       │  399 $/ay        │  899 $/ay        │
│  ─────────   │  ─────────      │  ─────────       │  ─────────       │
│  1 ilan      │  5 ilan         │  20 ilan         │  Sınırsız        │
│  0 öne çıkan │  1 öne çıkan    │  5 öne çıkan     │  20 öne çıkan    │
│  10 profil   │  50 profil      │  Sınırsız        │  Sınırsız        │
│  Temel araç  │  Analitik       │  Gelişmiş YZ     │  Özel CSM        │
│              │  Mesajlaşma     │  API erişimi     │  Beyaz etiket    │
│              │  Çalışma izni   │  Öncelikli doğr. │  Özel entegr.    │
└──────────────┴─────────────────┴──────────────────┴──────────────────┘
                               Yıllık ödemede %20 indirim
```

> **Not:** Abonelik limitleri veritabanında (`jobPostingLimit`, `featuredJobLimit`, `candidateViewLimit`) saklanır ve API düzeyinde zorunlu kılınır.

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
             │ • Ajans pan.    │    │ /api/messages    │
             └─────────────────┘    │ /api/applications│
                                    │ /api/documents   │
                                    │ /api/stripe      │
                                    │ /api/admin       │
                                    │ /api/ai/match    │
                                    └──────┬──────────┘
                                           │
                    ┌──────────────────────▼─────────────────────┐
                    │                 VERİ KATMANI                │
                    ├──────────────┬──────────────┬──────────────┤
                    │  PostgreSQL  │   Supabase   │    Redis     │
                    │  (Prisma 5)  │   Depolama   │  (Oturum &   │
                    │             │   (Dosya &   │   Hız Limit) │
                    │  Ana Verit.  │   Görseller) │              │
                    └──────────────┴──────────────┴──────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────┐
                    │             DIŞ SERVİSLER                   │
                    ├──────────┬──────────┬──────────┬───────────┤
                    │  STRIPE  │  RESEND  │  GOOGLE  │  OPENAI   │
                    │ Ödeme    │  E-posta │  OAuth   │  YZ Eşl.  │
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
     Auth.js v5 (JWT + DB rol yenileme)
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
┌─────────────────────────────────────────────────────────────────────┐
│                        VERİTABANI ŞEMASI                             │
│                          (34 temel model)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  KULLANICILAR & KİMLİK DOĞR.    OTELLER & İŞLER                     │
│  ──────────────────────────     ─────────────────                   │
│  User (Kullanıcı)               Hotel (Otel)                        │
│  Account (OAuth)                HotelEmployer (İşveren)             │
│  Session (Oturum)               HotelReview (Değerl.)               │
│  VerificationToken              Job (İş İlanı)                      │
│                                 JobTranslation (Çeviri)             │
│  ADAYLAR                        Application (Başvuru)               │
│  ──────────                     SavedJob (Kaydedilen)               │
│  CandidateProfile               FavoriteHotel (Favori)              │
│  CandidateSkill (Yetenek)                                           │
│  CandidateLanguage (Dil)        ÖDEMELER & ABONELİK                  │
│  CandidateDepartment (Departm.) ──────────────────                  │
│  WorkExperience (Deneyim)       Subscription (Abonelik)             │
│  Education (Eğitim)             Payment (Ödeme)                     │
│  Certification (Sertifika)                                          │
│  Document (Belge)               İLETİŞİM                            │
│                                 ──────────                          │
│  İK AJANSI                      Message (Mesaj)                     │
│  ──────────                     Notification (Bildirim)             │
│  HRAgency (Ajans)                                                   │
│  AgencyHotelPartnership         YÖNETİM & DENETİM                   │
│  CandidatePool (Aday Havuzu)    ─────────────────                   │
│                                 Verification (Doğrulama)            │
│  DESTEK                         AuditLog (Denetim Kaydı)            │
│  ──────                                                             │
│  SupportTicket (Bilet)          İÇERİK & AYARLAR                    │
│  SupportReply (Yanıt)           ─────────────────                   │
│                                 ContentTranslation (Çeviri)         │
│                                 SiteSettings (Site Ayarları)        │
│                                 FeaturedSlot (Öne Çıkan Slot)       │
└─────────────────────────────────────────────────────────────────────┘
```

### Temel Veritabanı İlişkileri

```
Kullanıcı ──────────────────────────────────────────────────────────┐
  │                                                                 │
  ├──► Aday Profili ──► İş Deneyimi                                 │
  │         │        ──► Eğitim                                     │
  │         │        ──► Yetenekler                                 │
  │         │        ──► Diller                                     │
  │         │        ──► Departman Tercihleri                       │
  │         │        ──► Belgeler                                   │
  │         └──────────► Başvuru ──► İş İlanı ──► JobTranslation    │
  │                                     │                          │
  ├──► Otel İşvereni ──► Otel ──────────┘                          │
  │                       │                                        │
  │                       ├──► Abonelik ──► Ödeme                  │
  │                       ├──► Otel Değerlendirme                  │
  │                       └──► Doğrulama                           │
  │                                                                │
  ├──► İK Ajansı ──► AgencyHotelPartnership                        │
  │         └──────► CandidatePool                                 │
  │                                                                │
  ├──► Mesaj (gönderen) ◄──────────────────────── Mesaj ──────────┘
  │                                            (alan)
  ├──► Bildirim
  └──► SupportTicket ──► SupportReply
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
║  │  • Sistem yapılandırması ve site ayarları             │   ║
║  │  • İçerik yönetimi                                    │   ║
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
║  │  • Destek bilet yönetimi                               │  ║
║  └──────────────┬────────────┬───────────────────────────┘  ║
║                 │            │                               ║
║  ┌──────────────▼──┐   ┌─────▼──────────────────────────┐   ║
║  │   İK AJANSI     │   │      OTEL İŞVERENİ              │   ║
║  │  (HR_AGENCY)    │   │    (HOTEL_EMPLOYER)             │   ║
║  │                 │   │                                  │   ║
║  │ • Aday havuzu   │   │ • İş ilanı yayınlama            │   ║
║  │   yönetimi      │   │ • Başvuruları inceleme          │   ║
║  │ • Otellerle     │   │ • Adaylarla mesajlaşma          │   ║
║  │   ortaklık      │   │ • Otel profili yönetimi         │   ║
║  │ • Başvuru tak.  │   │ • Abonelik yönetimi             │   ║
║  │ • Mesajlaşma    │   │ • Analitik kontrol paneli       │   ║
║  │ • Analitik      │   │ • Aday havuzu arama             │   ║
║  │ • Havuz filtre  │   │ • Çoklu otel yönetimi           │   ║
║  └─────────────────┘   └──────────────────────────────────┘  ║
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │                       ADAY (CANDIDATE)                │   ║
║  │  • Doğrulanmış profil oluşturma ve belge yükleme      │   ║
║  │  • İş ilanlarına göz atma ve başvurma                 │   ║
║  │  • YZ destekli iş eşleştirme (ai-match)               │   ║
║  │  • Başvuru durumunu takip etme                        │   ║
║  │  • İşverenlerle mesajlaşma                            │   ║
║  │  • Çalışma izni rehberi                               │   ║
║  │  • Favori otel ve iş ilanlarını kaydetme              │   ║
║  └──────────────────────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════╝
```

### Rol Yetki Matrisi

| Yetenek | Aday | Otel İşv. | İK Ajansı | Yönetici | Süper Yön. |
|---------|:----:|:---------:|:---------:|:--------:|:---------:|
| Açık iş ilanlarını görüntüleme | ✓ | ✓ | ✓ | ✓ | ✓ |
| İş ilanlarına başvurma | ✓ | — | — | — | — |
| Aday profili oluşturma | ✓ | — | — | — | — |
| Belge yükleme | ✓ | — | — | — | — |
| YZ iş eşleştirme | ✓ | — | — | — | — |
| İş ilanı yayınlama | — | ✓ | — | ✓ | ✓ |
| Başvuruları inceleme | — | ✓ | — | ✓ | ✓ |
| Aday havuzu arama | — | ✓ | ✓ | ✓ | ✓ |
| Kullanıcılarla mesajlaşma | ✓ | ✓ | ✓ | ✓ | ✓ |
| Otel profilini yönetme | — | ✓ | — | ✓ | ✓ |
| Otel analitiğini görüntüleme | — | ✓ | — | ✓ | ✓ |
| Abonelik yönetimi | — | ✓ | ✓ | ✓ | ✓ |
| Aday havuzu yönetimi | — | — | ✓ | ✓ | ✓ |
| Otel doğrulama | — | — | — | ✓ | ✓ |
| Tüm kullanıcıları yönetme | — | — | — | ✓ | ✓ |
| Destek bilet yönetimi | — | — | — | ✓ | ✓ |
| İçerik yönetimi | — | — | — | — | ✓ |
| Sistem yapılandırması | — | — | — | — | ✓ |

### Başvuru Durum Akışı

```
                         ┌──────────┐
                         │  TASLAK  │ ◄── Aday taslak kaydeder
                         └────┬─────┘
                              │ Gönder
                              ▼
                        ┌──────────┐
                        │GÖNDERİLDİ│ ◄── Aday başvurur
                        └────┬─────┘
                             │ Otel inceler
                             ▼
                        ┌────────────┐
                        │ İNCELENİYOR│ ◄── Otel başvuruyu açar
                        └────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌────────────┐  ┌──────────┐
        │KISA LİSTE│  │REDDEDİLDİ │  │GERİ ÇEK. │◄─ Aday
        └─────┬─────┘  └────────────┘  └──────────┘
              │
              ▼
    ┌──────────────────┐
    │MÜLAKAT PLANLANMASI│  (interviewDate + interviewType)
    └────────┬──────────┘
             │
             ▼
    ┌──────────────────┐
    │MÜLAKAT TAMAMLANDI │
    └────────┬──────────┘
             │
             ▼
      ┌──────────────┐
      │ TEKLİF YAPILDI│  (offerDetails + offerSalary + offerStartDate)
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
    Yönetici inceler (IN_REVIEW aşaması)
           │
    ┌──────┴──────┐──────────────┐
    ▼             ▼              ▼
┌────────┐   ┌──────────┐  ┌──────────────────┐
│ONAYLANDI│  │REDDEDİLDİ│  │EK BİLGİ GEREKLİ  │
│  ✓     │  │  ✗       │  │(MORE_INFO_REQUIRED)│
└────┬───┘   └──────────┘  └──────────────────┘
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
┌──────────────────────────────────────────────────────────────┐
│                    OTEL KONTROL PANELİ                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  İLAN YÖNETİMİ            BAŞVURU BORU HATTI                 │
│  ─────────────            ──────────────────                 │
│  ✓ İlan oluşturma/düzenleme  ✓ Durum bazlı filtreleme        │
│  ✓ Maaş aralığı belirleme   ✓ Başvuruları yıldızlama        │
│  ✓ Şartlar listesi           ✓ Toplu durum güncelleme        │
│  ✓ Sosyal haklar paketi      ✓ İşveren/aday notu ekleme     │
│  ✓ Taslak / yayınla          ✓ CV indir ve önizle            │
│  ✓ Son başvuru tarihi        ✓ Mülakat tipi ve tarih kaydı  │
│  ✓ Öne çıkan ilan            ✓ Teklif detayları ve maaş     │
│  ✓ Tercih edilen milliyet    ✓ Durum bildirimleri            │
│                                                              │
│  ADAY ARAMA               ANALİTİK                           │
│  ─────────────            ────────                           │
│  ✓ Tam metin arama        ✓ Gerçek zamanlı istatistikler     │
│  ✓ Dile göre filtreleme   ✓ Kullanıcı büyüme oranı          │
│  ✓ Uygunluğa göre filtre  ✓ Doğrulama kuyruğu               │
│  ✓ Gizlenmiş soyadlar     ✓ Gelir takibi (USD)               │
│  ✓ Departman tercihleri   ✓ Bu aylık başvurular             │
│  ✓ Doğrudan mesajlaşma    ✓ Rapor dışa aktarma              │
│                                                              │
│  OTEL PROFİLİ             ABONELİK                           │
│  ─────────────            ─────────                          │
│  ✓ Kapak fotoğrafı & logo ✓ Plan yönetimi                    │
│  ✓ Olanak seçenekleri     ✓ Stripe faturalandırma            │
│  ✓ Çok dilli açıklama     ✓ Limit paneli (ilan/aday/öne çık)│
│  ✓ Konum & iletişim       ✓ Fatura geçmişi                   │
│  ✓ SEO uyumlu URL slug    ✓ Yükseltme / düşürme              │
│  ✓ ÇOK OTEL DESTEĞİ       ✓ Trial desteği                   │
│    ([hotelId] yönlendirme)                                   │
└──────────────────────────────────────────────────────────────┘
```

#### Aday Portalı
```
┌──────────────────────────────────────────────────────────────┐
│                    ADAY KONTROL PANELİ                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PROFİL OLUŞTURUCU         BELGE KASASI                      │
│  ─────────────────         ─────────────                     │
│  ✓ Fotoğraf & kapak        ✓ CV / Özgeçmiş yükleme          │
│  ✓ Profesyonel başlık      ✓ Pasaport taraması               │
│  ✓ Biyografi & özet        ✓ Çalışma izni belgeleri          │
│  ✓ Yetenekler (etiket)     ✓ Diploma sertifikaları           │
│  ✓ Dil seviyeleri          ✓ Referans mektupları             │
│  ✓ İş geçmişi              ✓ Sertifikalar                    │
│  ✓ Eğitim                  ✓ Belge durum takibi              │
│  ✓ Sertifikalar            ✓ Son kullanma hatırlatıcısı      │
│  ✓ Departman tercihleri    ✓ Suçsuzluk / sağlık belgesi     │
│  ✓ Maaş beklentisi                                           │
│  ✓ Yer değiştirme tercihi  İŞ KEŞFİ & YZ EŞLEŞTİRME        │
│  ✓ Herkese açık/gizli      ─────────────────────────         │
│  ✓ Pasaport bilgisi        ✓ Tam metin arama                 │
│  ✓ Video tanıtım URL'si    ✓ Şehir/dept/maaş filtre         │
│  ✓ Profil skoru (0-100)    ✓ Öne çıkan oteller               │
│                             ✓ İlanları kaydetme              │
│  BAŞVURU TAKİBİ             ✓ Tek tıkla başvur               │
│  ─────────────────          ✓ Ön yazı düzenleyici            │
│  ✓ Durum zaman çizelgesi   ✓ YZ iş eşleştirme (ai-match)    │
│  ✓ Duruma göre filtrele    ✓ Favori oteller                  │
│  ✓ Teklif yönetimi                                           │
│  ✓ Geri çekme seçeneği     ÇALIŞMA İZNİ REHBERİ             │
│                             ─────────────────────            │
│  BİLDİRİMLER                ✓ Adım adım rehber               │
│  ─────────────              ✓ İzin durum takibi              │
│  ✓ Bildirim merkezi         ✓ Belge kontrolü                 │
│  ✓ Okunmamış filtresi                                        │
└──────────────────────────────────────────────────────────────┘
```

#### İK Ajans Portalı
```
┌──────────────────────────────────────────────────────────────┐
│                   AJANS KONTROL PANELİ                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ADAY HAVUZU YÖNETİMİ      OTEL ORTAKLIKLARI                 │
│  ─────────────────────      ────────────────                 │
│  ✓ Havuz oluşturma/isim    ✓ Ortak otel listesi              │
│  ✓ JSON filtre şablonları  ✓ Ortaklık durumu                 │
│  ✓ Genel/özel havuz        ✓ Otel-ajans eşleştirme          │
│  ✓ Aday segmentasyon                                         │
│                             BAŞVURU TAKİBİ                   │
│  AJANS PROFİLİ              ──────────────                   │
│  ──────────────             ✓ Tüm başvurular                 │
│  ✓ Lisans numarası         ✓ Durum filtreleme                │
│  ✓ Uzmanlık alanları       ✓ Otel bazlı gruplama            │
│  ✓ Logo & kapak            ✓ İş ilanı bazlı takip           │
│  ✓ Ülke & şehir                                              │
│  ✓ Doğrulama durumu        ANALİTİK & RAPORLAR              │
│                             ────────────────────             │
│  MESAJLAŞMA                 ✓ Havuz büyüme metrikleri        │
│  ──────────                 ✓ Yerleştirme başarı oranı       │
│  ✓ Mesaj gönderme          ✓ Otel ortaklık verileri         │
│  ✓ Gelen kutusu yönetimi                                     │
└──────────────────────────────────────────────────────────────┘
```

#### Yönetici Paneli
```
┌──────────────────────────────────────────────────────────────┐
│                   YÖNETİCİ KONTROL PANELİ                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  KULLANICI YÖNETİMİ         OTEL YÖNETİMİ                   │
│  ──────────────────         ───────────────                  │
│  ✓ Tam kullanıcı tablosu    ✓ Tüm oteller tablosu            │
│  ✓ Rol atama                ✓ Doğrulama iş akışı             │
│  ✓ Askıya alma / aktifleşt. ✓ PENDING/IN_REVIEW/APPROVED    │
│  ✓ Giriş geçmişi + sayısı  ✓ Gerekçeli reddetme             │
│  ✓ Role göre filtreleme     ✓ MORE_INFO_REQUIRED akışı      │
│  ✓ Durum filtreleme                                          │
│  ✓ CSV dışa aktarma         İŞ İLANI YÖNETİMİ               │
│                             ──────────────────               │
│  DOĞRULAMA KUYRUĞU          ✓ Tüm ilanlar tablosu            │
│  ──────────────────         ✓ Aktif/pasif kontrol            │
│  ✓ Bekleyen doğrulamalar    ✓ İlan moderasyon                │
│  ✓ Yüklenen belgeler                                         │
│  ✓ Onayla / reddet          GELİR TABLOSU                    │
│  ✓ Ek bilgi iste            ──────────────                   │
│  ✓ Denetim izi              ✓ Aylık / geçen ay gelir         │
│                             ✓ Büyüme oranı                   │
│  DESTEK BİLETLERİ           ✓ Ödeme geçmişi tablosu          │
│  ─────────────────          ✓ Başarısız ödeme uyarıları      │
│  ✓ Açık/kapalı bilet listesi✓ CSV olarak dışa aktar         │
│  ✓ Öncelik yönetimi                                          │
│  ✓ Kategori filtreleme      İÇERİK YÖNETİMİ                  │
│  ✓ Bilet atama              ─────────────────                │
│  ✓ Yanıt sistemi            ✓ İçerik çevirileri              │
│                             ✓ Çoklu dil içerik               │
│  SİSTEM AYARLARI            ✓ Namespace bazlı düzenleme     │
│  ──────────────────                                          │
│  ✓ SiteSettings yönetimi                                     │
│  ✓ Genel / özel ayarlar                                      │
│  ✓ FeaturedSlot yönetimi                                     │
│                             PLATFORM İSTATİSTİKLERİ          │
│                             ───────────────────────          │
│                             ✓ Toplam / Bu ay kullanıcılar    │
│                             ✓ Büyüme oranı + rol dağılımı   │
│                             ✓ Doğrulanmış / bekleyen otel   │
│                             ✓ Aktif iş ilanları              │
│                             ✓ Bu ay başvurular               │
│                             ✓ Bu ay / geçen ay gelir         │
└──────────────────────────────────────────────────────────────┘
```

### Mesajlaşma Sistemi

```
┌──────────────────────────────────────────────────────────────┐
│                  UYGULAMA İÇİ MESAJLAŞMA                      │
├──────────────────────┬───────────────────────────────────────┤
│  KONUŞMA LİSTESİ     │  MESAJ GEÇMİŞİ                       │
│  ─────────────────   │  ─────────────                        │
│  ✓ En yeniye göre    │  ✓ Otomatik kaydırma                  │
│    sıralama          │  ✓ SENT/DELIVERED/READ durumu         │
│  ✓ Okunmamış rozetl. │  ✓ Zaman damgası gösterimi            │
│  ✓ Son mesaj önizl.  │  ✓ Enter ile gönder                   │
│  ✓ Avatar baş harf   │  ✓ Otomatik okundu işareti            │
│  ✓ Arama filtresi    │  ✓ Framer Motion animasyonları        │
│                      │  ✓ Ekler desteği (attachments[])      │
│  MOBİL UYUMLU        │  ✓ Metadata desteği (JSON)            │
│  ✓ Geri kaydırma     │  ✓ Mesaj bildirimleri                 │
│  ✓ Dokunuş optimize  │                                       │
└──────────────────────┴───────────────────────────────────────┘
```

### YZ Destekli İş Eşleştirme

```
┌──────────────────────────────────────────────────────────────┐
│              YZ İŞ EŞLEŞTİRME (OpenAI Entegrasyonu)          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/ai/match                  ADAY PANELİ                  │
│  ─────────────                  ────────────                 │
│  ✓ Aday profili analizi        ✓ /dashboard/candidate/       │
│  ✓ Uygun iş ilanı önerisi         ai-match sayfası           │
│  ✓ Uyumluluk skoru             ✓ Kişiselleştirilmiş          │
│  ✓ OpenAI API entegrasyonu        iş önerileri               │
│  ✓ Dil & departman eşleşme     ✓ Profil eksiklik tespiti     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Güvenlik & Uyumluluk

### Kimlik Doğrulama & Yetkilendirme

```
┌──────────────────────────────────────────────────────────────┐
│                    GÜVENLİK MİMARİSİ                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  KİMLİK DOĞRULAMA           YETKİLENDİRME                    │
│  ─────────────────          ───────────────                  │
│  ✓ NextAuth v5 (Auth.js)    ✓ Rol tabanlı (RBAC)             │
│  ✓ JWT oturumları           ✓ Rota middleware                │
│  ✓ Şifre + Google OAuth     ✓ API seviyesinde kontrol        │
│  ✓ bcrypt (bcryptjs)        ✓ Kaynak sahipliği               │
│  ✓ Her istekte DB rol yenile✓ Yönetici geçersiz kılma        │
│  ✓ Ban/Askı kontrollü giriş ✓ Aday veri maskeleme            │
│  ✓ Giriş sayısı takibi      ✓ Abonelik limit zorlaması       │
│  ✓ Son giriş IP kaydı                                        │
│                                                              │
│  2FA & GELİŞMİŞ GÜVENLİK    VERİ KORUMA                      │
│  ───────────────────────     ──────────                      │
│  ✓ 2FA altyapısı hazır       ✓ Soyad maskeleme               │
│    (twoFactorEnabled field)  ✓ Şifre sıfırlama tokeni        │
│  ✓ 2FA secret saklama        ✓ Zod girdi doğrulama           │
│                              ✓ SQL enjeksiyon önleme         │
│  ALTYAPI                     ✓ CSRF koruması                 │
│  ─────────                   ✓ Yumuşak silme (denetim)       │
│  ✓ HTTPS zorunlu                                             │
│  ✓ CSP başlıkları                                            │
│  ✓ XSS koruma başlığı                                        │
│  ✓ Hız sınırlama (Redis)                                     │
│                                                              │
│  DENETİM & UYUMLULUK                                         │
│  ────────────────────                                        │
│  ✓ Tam denetim kaydı (CREATE/UPDATE/DELETE/LOGIN/...)        │
│  ✓ Kullanıcı eylem takibi (kim, ne, ne zaman, IP)           │
│  ✓ KVKK/GDPR uyumlu veri modeli                             │
│    - gdprConsentAt, marketingConsent, dataExportedAt         │
│  ✓ Yumuşak silme (deletedAt)                                 │
│  ✓ Sentry hata izleme entegrasyonu hazır                     │
└──────────────────────────────────────────────────────────────┘
```

### KVKK & Veri Gizliliği

- Tüm kişisel veriler KVKK uyumlu PostgreSQL örneğinde saklanır
- Aday soyadları, işveren olmayan görüntüleyenler için maskelenir
- Yumuşak silme yapısı (`deletedAt`), silme talepleri karşılanırken denetim izlerini korur
- Belge depolama, süreli erişim ile Supabase üzerinden yapılır
- GDPR alanları: `gdprConsentAt`, `marketingConsent`, `dataExportedAt`
- Üçüncü taraf reklam izleme pikseli yok

---

## 10. Teknoloji Yığını

### Tam Yığın Genel Bakış

```
┌──────────────────────────────────────────────────────────────┐
│                       TEKNOLOJİ YIĞINI                        │
├──────────────────────┬───────────────────────────────────────┤
│  KATMAN               │  TEKNOLOJİ / SÜRÜM                   │
├──────────────────────┼───────────────────────────────────────┤
│  Ön yüz Framework    │  Next.js 14.2.5 (App Router + RSC)    │
│  Programlama Dili    │  TypeScript 5 (katı mod)              │
│  Stil               │  Tailwind CSS 3.4 + CSS Değişkenleri   │
│  UI Bileşenleri      │  Özel shadcn/ui + Radix UI primitifler │
│  Animasyon          │  Framer Motion 11                      │
│  Grafikler           │  Recharts 2.12                        │
│  Formlar             │  React Hook Form 7.52 + Zod 3.23      │
│  İkonlar             │  Lucide React 0.395                   │
│  Bildirimler         │  Sonner 1.5                           │
│  Tarih İşlemleri     │  date-fns 3.6                         │
├──────────────────────┼───────────────────────────────────────┤
│  Arka Yüz            │  Next.js API Rotaları (Edge uyumlu)   │
│  Kimlik Doğrulama    │  Auth.js v5 / next-auth beta.19       │
│  Auth Adaptör        │  @auth/prisma-adapter 2.2             │
│  Şifre Hashing       │  bcryptjs                             │
│  ORM                 │  Prisma 5.15                          │
│  Veritabanı          │  PostgreSQL 16                        │
│  Dosya Depolama      │  Supabase Storage                     │
│  Önbellekleme/Limit  │  Redis (Upstash serverless)           │
├──────────────────────┼───────────────────────────────────────┤
│  Ödemeler            │  Stripe 15.11 (sub. + webhook'lar)    │
│  Stripe İstemci      │  @stripe/stripe-js 3.5                │
│  E-posta             │  Resend 6.12 (işlemsel)               │
│  OAuth               │  Google                               │
│  YZ / AI             │  OpenAI SDK 6.37                      │
│  İzleme              │  Sentry (entegrasyon hazır)           │
├──────────────────────┼───────────────────────────────────────┤
│  Dağıtım             │  Vercel (otomatik ölçekleme, edge)    │
│  CDN                 │  Cloudflare                           │
│  CI/CD               │  GitHub Actions                       │
├──────────────────────┼───────────────────────────────────────┤
│  Çoklu Dil           │  next-intl 3.14 (TR / EN / RU)       │
│  SEO                 │  Next.js Metadata API + site haritası │
│  PWA                 │  Web App Manifest + service worker    │
│  Görsel Optimizasyon │  Sharp 0.33                           │
└──────────────────────┴───────────────────────────────────────┘
```

### Neden Bu Teknoloji Yığını?

| Karar | Gerekçe |
|-------|---------|
| **Next.js 14** | Sunucu bileşenleri JS paketini azaltır; yerleşik i18n; edge dağıtımı |
| **TypeScript (Katı)** | Sıfır çalışma zamanı tip hatası; kendini belgeleyen kod tabanı |
| **Prisma ORM** | Tip güvenli DB erişimi; otomatik migrasyon yönetimi |
| **Auth.js v5** | Üretimde kanıtlanmış; şifre + OAuth destekli; JWT + DB oturumları; her istekte rol yenileme |
| **Stripe** | Endüstri standardı abonelik faturalandırması; PCI DSS uyumlu |
| **Vercel** | Sıfır yapılandırmalı dağıtım; küresel edge ağı; önizleme dağıtımları |
| **OpenAI** | YZ destekli iş eşleştirme için; aday-iş uyumluluk skoru |
| **Tailwind CSS** | Yardımcı program öncelikli; tutarlı tasarım sistemi |

---

## 11. Rekabet Analizi

### Rekabet Matrisi

| Platform | Konaklama Odağı | Çok Dilli | BDT Erişimi | Çal. İzni | SaaS Modeli | YZ Eşleştirme | Türkiye Pazar |
|----------|:--------------:|:---------:|:-----------:|:---------:|:-----------:|:-------------:|:-------------:|
| **HotelLink** | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓✓ |
| Hosco | ✓✓✓ | ✓✓ | ✗ | ✗ | ✓✓ | ✗ | ✗ |
| Hcareers | ✓✓✓ | ✗ | ✗ | ✗ | ✓✓ | ✗ | ✗ |
| LinkedIn | ✓ | ✓✓✓ | ✓✓ | ✗ | ✓✓ | ✓ | ✓ |
| Indeed | ✓ | ✓✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| Yerel ajanslar | ✓✓ | ✓ | ✓✓ | ✓ | ✗ | ✗ | ✓✓✓ |

**HotelLink'in Rekabet Avantajı:**
1. **Dil yerel BDT aday havuzu** — Rusça kullanıcı arayüzü ve aday tabanını hızlıca kopyalamak son derece güç
2. **Çalışma izni rehberliği** — Türkiye'ye özgü çalışma izni iş akışının doğrudan rakibi yok
3. **YZ destekli eşleştirme** — OpenAI tabanlı aday-iş uyumluluk skoru
4. **Doğrulama katmanı** — Belge doğrulamalı profiller güvenilir bir pazar yeri oluşturur
5. **Dört taraflı ağ etkileri** — Oteller, adaylar, ajanslar VE platform katışımlı değer yaratır
6. **Destek ekosistemi** — Entegre destek bilet sistemi operasyonel sürtünmeyi azaltır

---

## 12. Pazara Giriş Stratejisi

### 1. Aşama — İstanbul Lansmanı (1–4. Aylar)

```
HEDEF: 50 otel, 2.000 aday, 3 ajans

Kanallar:
  ✓ İstanbul'daki 5 yıldızlı otellere doğrudan satış
  ✓ 3 köklü İK ajansıyla ortaklık
  ✓ BDT konaklama çalışanlarına Telegram/VK topluluk erişimi
  ✓ LinkedIn B2B kampanyaları
  ✓ İçerik: Türk otel sektörü blogu + Rusça aday rehberi
```

### 2. Aşama — Kıyı Genişlemesi (5–10. Aylar)

```
HEDEF: 250 otel, 10.000 aday, 15 ajans

Pazarlar:
  ✓ Antalya, Bodrum, İzmir
  ✓ Otel zinciri kurumsal anlaşmaları (5+ mülk)
  ✓ TÜROB ortaklığı
```

### 3. Aşama — BDT Kaynak Pazarları (11–18. Aylar)

```
HEDEF: 1.000 otel, 50.000 aday, 50 ajans

Genişleme:
  ✓ Moskova, Almatı ofis / temsilcilikler
  ✓ Konaklama okullarıyla üniversite ortaklıkları
  ✓ Gürcistan, Ermenistan, Kırgızistan aday pazarları
```

---

## 13. Mevcut Durum & Traction

> Son güncelleme: Mayıs 2026 — Kapsamlı teknik durum raporu

---

### Genel Metrikler

| Öğe | Durum |
|-----|-------|
| TypeScript derleme | **0 hata** |
| Veritabanı şeması | **34 model, üretime hazır** |
| API rota dosyaları | **68 route.ts (~120+ endpoint)** |
| Toplam uygulama sayfası | **80+ sayfa (tüm roller)** |
| Aday kontrol paneli | **12 sayfa** |
| Otel işveren paneli | **14 sayfa + çoklu otel desteği** |
| Ajans paneli | **9 sayfa** |
| Yönetici paneli | **10 sayfa** |
| Mobil uyumlu | **Evet (responsive)** |
| Çoklu dil | **TR / EN / RU (next-intl)** |
| Koyu/Açık tema | **Evet** |

---

### ✅ TAMAMLANAN ÖZELLİKLER

#### 🌐 Ana Sayfa (Public)
- Gerçek veritabanı verileriyle çalışan tüm bölümler: Stats, Hero, HotelShowcase, CTA
- Otel listesi ve detay sayfaları (filtreleme, arama, galeri)
- İş ilanları listesi ve detay sayfaları (başvur, kaydet, paylaş)
- Çok dilli Navbar, Footer, Fiyatlandırma, SSS, Özellikler bölümleri

#### 🔐 Kimlik Doğrulama
- Kayıt / Giriş / Şifre sıfırlama sayfaları
- Auth.js v5 (JWT + veritabanı oturum)
- Google OAuth hazır
- Rol seçim onboarding (yeni kullanıcı ilk girişte rol seçer)

#### 👤 Aday Paneli (`/candidate/...`)
| Sayfa | Durum | Notlar |
|-------|-------|--------|
| Dashboard | ✅ Gerçek veri | İstatistikler, son başvurular, önerilen ilanlar |
| İş Bul | ✅ Tam işlevsel | Filtreler (departman, tür, maaş, konum, dil) |
| **YZ Eşleştirme** | ✅ Otomatik | Sayfaya girilince anında çalışır, GPT-4o mini, skor halkası, detay açılır |
| Başvurularım | ✅ Düzeltildi | Doğru enum (REVIEWING/OFFER_ACCEPTED), filtreler, mesaj, yorum |
| Kaydedilen İşler | ✅ Gerçek veri | Kaydet/kaldır butonu çalışıyor |
| Profilim | ✅ Tam CRUD | Fotoğraf, bio, diller, beceriler, deneyim, eğitim, sertifika |
| Belgeler | ✅ Tam işlevsel | Yükleme (Supabase), CV/pasaport/diploma kategorileri |
| Çalışma İzni | ✅ Bilgi sayfası | Durum takibi, rehber içerik |
| Favori Oteller | ✅ Gerçek veri | Otel kartları, kaldırma butonu |
| Bildirimler | ✅ Gerçek veri | Okundu/okunmadı, tip bazlı ikonlar |
| Ayarlar | ✅ Çalışıyor | Şifre değiştirme, bildirim tercihleri, hesap silme |

#### 🏨 Otel İşveren Paneli (`/hotel/[hotelId]/...`)
| Sayfa | Durum | Notlar |
|-------|-------|--------|
| Otel Seçimi | ✅ Çoklu otel | İşveren birden fazla oteli yönetebilir |
| Onboarding | ✅ Çalışıyor | Doğrulama başvurusu, belge yükleme |
| Dashboard | ✅ Gerçek veri | İstatistikler, son başvurular, görüntülenme |
| İş İlanları | ✅ Tam CRUD | Oluştur/düzenle/sil, yayınla/duraklat, özellik alanları |
| **YZ Aday Eşleştirme** | ✅ Otomatik | Sayfaya girilince çalışır, iş seçici, skor halkası, güçlü yönler/eksikler |
| Başvurular | ✅ Düzeltildi | Durum geçişi (SUBMITTED→REVIEWING→…→OFFER_ACCEPTED), yıldızlama, mesaj |
| Aday Profili | ✅ Yeni sayfa | Deneyim, dil, beceri, CV indirme, mesaj gönder |
| Adaylar | ✅ Çalışıyor | Filtreleme, arama |
| Otel Profili | ✅ Görsel yükleme | Logo/kapak fotoğrafı değiştirme (Supabase Storage) |
| **Doğrulama Ekranı** | ✅ Tam akış | PENDING/REJECTED banner, red sebebi, yeniden başvuru formu |
| Analitik | ✅ Gerçek veri | Başvuru trendi, departman dağılımı |
| Abonelik/Fatura | ✅ Stripe | Checkout, müşteri portalı, webhook |
| Mesajlar | ✅ Çalışıyor | Konuşma listesi, mesaj gönderme |
| Bildirimler | ✅ Gerçek veri | |
| Ayarlar | ✅ Çalışıyor | |

#### 🏢 İK Ajansı Paneli (`/agency/...`)
| Sayfa | Durum | Notlar |
|-------|-------|--------|
| Dashboard | ✅ Gerçek veri | Toplam aday, yerleştirme, gelir istatistikleri |
| Aday Havuzları | ✅ Tam CRUD | Oluştur, filtrele, isim düzenle, sil |
| Havuz Detayı | ✅ Yeni sayfa | Filtre paneli, aday grid görünümü |
| Başvurular | ✅ Gerçek veri | |
| Otel Ortakları | ✅ Gerçek veri | Ortaklık başvurusu, aktif/pasif |
| Analitik | ✅ Gerçek veri | |
| Mesajlar | ✅ Çalışıyor | |
| Profil | ✅ Çalışıyor | |
| Ayarlar | ✅ Çalışıyor | |

#### 🛡️ Yönetici Paneli (`/admin/...`)
| Sayfa | Durum | Notlar |
|-------|-------|--------|
| Genel Bakış | ✅ Gerçek veri | Platform geneli istatistikler |
| Kullanıcılar | ✅ Tam | Liste, filtreleme, askıya alma, CSV export |
| Oteller | ✅ Tam | Liste, detay, CSV export, manuel doğrulama |
| İş İlanları | ✅ Tam | Liste, durum yönetimi |
| **Doğrulamalar** | ✅ Tam akış | PENDING→IN_REVIEW→APPROVED/REJECTED, bildirim, dialog, sidebar rozeti |
| Destek Biletleri | ✅ Çalışıyor | Yanıt verme, kapatma |
| Çeviriler | ✅ Çalışıyor | İçerik yönetimi |
| Gelir/Ödemeler | ✅ Gerçek veri | Recharts grafik, CSV export, Stripe verileri |
| Analitik | ✅ Gerçek veri | |
| Ayarlar | ✅ Çalışıyor | |

#### ⚙️ API Altyapısı (68 rota, ~120+ endpoint)
```
/api/auth/...          → Kayıt, giriş, şifre sıfırlama, rol ayarla
/api/profile/...       → Aday/otel/ajans profil CRUD
/api/jobs/...          → İş ilanı CRUD, filtreleme, kaydetme
/api/applications/...  → Başvuru gönder, listele, durum güncelle
/api/messages/...      → Mesajlaşma, okunmamış sayısı
/api/notifications/... → Bildirimler
/api/documents/...     → Belge yükleme/listeleme/silme
/api/hotels/...        → Otel listeleme, favori, yeniden başvuru
/api/candidates/...    → Aday profil görüntüleme (yetkiye göre)
/api/admin/...         → Kullanıcı/otel/doğrulama/ödeme yönetimi
/api/agency/...        → Ajans dashboard, havuzlar, ortaklıklar
/api/ai/match          → 3 mod: score_jobs_for_candidate / candidate_to_job / job_to_candidates
/api/stripe/...        → Checkout, portal, webhook
/api/upload/...        → Supabase Storage (resim, galeri)
/api/reviews/...       → Otel ve aday değerlendirme
/api/public/...        → İstatistikler, öne çıkan oteller (auth gerektirmez)
```

#### 🤖 YZ Eşleştirme Sistemi
- **GPT-4o mini** ile çift yönlü konaklama eşleştirme
- **Aday tarafı**: Sayfaya girilince tüm aktif ilanlar otomatik sıralanır, skor halkası, güçlü yön/eksik/öneri detay paneli
- **Otel tarafı**: Sayfaya girilince aktif iş ilanı için müsait tüm adaylar otomatik sıralanır, iş değiştirince yeniden çalışır
- **Skor**: 0–100 (Strong Match ≥80 / Good ≥60 / Partial ≥40 / Weak <40)
- Paralel işlem: 5 kayıt aynı anda, rate limit yönetimi

#### 💳 Ödeme Sistemi (Stripe)
- Abonelik checkout (Starter / Professional / Enterprise)
- Müşteri self-servis portalı
- Webhook ile veritabanı güncelleme

---

### ⚠️ BİLİNEN KISITLAMALAR

| Kısıtlama | Açıklama |
|-----------|----------|
| **Gerçek zamanlı mesajlaşma yok** | Mesajlar polling ile çalışıyor (WebSocket/SSE entegre edilmedi) |
| **E-posta gönderimi** | `sendApplicationStatusEmail` fonksiyonu var ama Resend API key yapılandırılmamış |
| **YZ için OPENAI_API_KEY gerekli** | Key yoksa AI match sayfaları 503 döner, zarif hata mesajı gösterir |
| **Admin/hotels duplicate endpoint** | Hem `/admin/hotels/[id]/verify` hem `/admin/verifications/[id]/approve` var — verifications akışı kullanılmalı |
| **İş ilanı durum filtresi** | Hotel işveren iş listesi, tüm statüsleri API üzerinden filtreleyemiyor (GET sadece ACTIVE destekliyor) |
| **Bildirimler sadece in-app** | Push notification veya e-posta bildirimi yok |

---

### 🚀 Halka Açık Lansmanı Bloke Eden Maddeler

1. **Alan adı & SSL** — hotellink.com yapılandırması
2. **Üretim Veritabanı** — Supabase/Railway PostgreSQL'e geçiş
3. **Supabase Depolama** — Belge yükleme bucket aktivasyonu
4. **Stripe Canlı Anahtarlar** — Test → Üretim geçişi
5. **OPENAI_API_KEY** — GPT-4o mini için production key
6. **Resend E-posta** — İşlemsel e-posta alan adı yapılandırması
7. **Google OAuth** — Üretim alan adı OAuth kaydı
8. **İlk 10 pilot otel** — 3 aylık ücretsiz Kurumsal

**Tahmini lansman süresi: 1–2 hafta (altyapı + env yapılandırması)**

---

## 14. Ürün Yol Haritası

### 1. Ufuk — Pazar Lansmanı (2025 1. ve 2. Çeyrek)

```
[ ] Üretim altyapısı kurulumu
[ ] İlk 50 otel katılımı
[ ] Rusça pazarlama kampanyası
[ ] Mobil optimize edilmiş aday katılım akışı
[ ] E-posta bildirim sistemi (Resend)
[ ] Çalışma izni rehber içeriği
[ ] 2FA aktivasyonu
```

### 2. Ufuk — Büyüme Özellikleri (2025 3. ve 4. Çeyrek)

```
[ ] YZ eşleştirme geliştirmeleri (mevcut temel üzerine)
[ ] Video tanıtım yükleme (videoIntroUrl alanı hazır)
[ ] Otomatik çalışma izni başvurusu takibi
[ ] Otel PMS entegrasyonları (Oracle OPERA, Protel)
[ ] Aday tavsiye sistemi
[ ] Mobil uygulama (React Native)
[ ] Gelişmiş ajans beyaz etiket portalı
```

### 3. Ufuk — Platform Genişlemesi (2026)

```
[ ] Yunanistan, Kıbrıs, BAE otel pazarlarına genişleme
[ ] Arapça ve Ukraynaca dil desteği
[ ] Bordro entegrasyonu
[ ] Yerleşik mülakat planlama
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

### Maliyet Yapısı (1. Yıl)

| Kategori | Aylık | Yıllık |
|----------|-------|--------|
| Altyapı (Vercel + DB + CDN) | 800 $ | 9.600 $ |
| Stripe ücretleri (%2,9 + 0,30 $) | ~600 $ | ~7.200 $ |
| E-posta & dış API'ler (Resend, OpenAI) | 350 $ | 4.200 $ |
| Mühendislik (2 geliştirici) | 12.000 $ | 144.000 $ |
| Satış & Pazarlama | 5.000 $ | 60.000 $ |
| Hukuki & Uyumluluk | 1.000 $ | 12.000 $ |
| **Toplam Faaliyet Gideri** | **19.750 $** | **237.000 $** |

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
┌──────────────────────────────────────────────────────┐
│  Satış Müdürü (Türkiye)                               │
│  Hedef: 6 ayda 50 otel                               │
│  Ücret: Taban + abonelikte %8 komisyon               │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Topluluk Yöneticisi (Rusça konuşan)                  │
│  Hedef: 6 ayda 5.000 BDT adayı                       │
│  Kanallar: Telegram, VK, Instagram                   │
└──────────────────────────────────────────────────────┘

ÖNCELİK 2 — Operasyonlar
┌──────────────────────────────────────────────────────┐
│  Müşteri Başarı Yöneticisi                            │
│  Otel katılımı ve elde tutma                         │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Arka Yüz / DevOps Mühendisi                          │
│  Altyapıyı ölçeklendirme; YZ özellik geliştirme     │
└──────────────────────────────────────────────────────┘
```

---

## 17. Yatırım Talebi & Fonun Kullanımı

### Talep: **500.000 $ Tohum Turu**

```
FON KULLANIMI DAĞILIMI
══════════════════════

  180.000 $ ─── Mühendislik (2 kıdemli geliştirici × 12 ay)
               └── YZ geliştirme, mobil uygulama, PMS entegrasyonları

  120.000 $ ─── Satış & Pazarlama
               ├── Türkiye otel doğrudan satış ekibi
               ├── BDT sosyal medya kampanyaları (Rusça)
               └── SEO + içerik (Türkçe & Rusça)

   80.000 $ ─── Operasyonlar & Müşteri Başarısı
               ├── Müşteri başarı yöneticisi
               └── Otel katılımı & destek

   60.000 $ ─── Altyapı & Araçlar
               ├── Üretim bulut altyapısı
               ├── Stripe, Supabase, Vercel, OpenAI (üretim)
               └── Hukuki, uyumluluk, veri koruma

   60.000 $ ─── İşletme Sermayesi & Tampon
               └── 18 aylık operasyonel çalışma süresi
  ─────────────────────────────────────────────────────
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
- **Çıkış Ufku:** Stratejik satın alma veya 18–24 ay içinde A Serisi

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
| İş detayı | `/tr/jobs/[slug]` |
| Otel dizini | `/tr/hotels` |
| Otel profili | `/tr/hotels/[slug]` |
| Aday kontrol paneli | `/tr/dashboard/candidate` |
| Aday YZ Eşleştirme | `/tr/dashboard/candidate/ai-match` |
| Aday Çalışma İzni | `/tr/dashboard/candidate/work-permit` |
| Otel işveren paneli | `/tr/dashboard/hotel` |
| Otel Analitik | `/tr/dashboard/hotel/analytics` |
| Otel Faturalama | `/tr/dashboard/hotel/billing` |
| Ajans paneli | `/tr/dashboard/agency` |
| Ajans Havuzları | `/tr/dashboard/agency/pools` |
| Yönetici paneli | `/tr/dashboard/admin` |
| Yönetici Kullanıcılar | `/tr/dashboard/admin/users` |
| Yönetici Doğrulama | `/tr/dashboard/admin/verifications` |
| Yönetici Biletler | `/tr/dashboard/admin/tickets` |
| Yönetici İçerik | `/tr/dashboard/admin/content` |
| Mesajlaşma | `/tr/dashboard/messages` |
| Giriş | `/tr/login` |
| Kayıt | `/tr/register` |

### Geliştirme Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Şemayı veritabanına ilet
npm run db:push

# Migrasyon oluştur ve uygula
npm run db:migrate

# Veritabanını doldur (seed)
npm run db:seed

# Prisma Studio'yu aç (DB tarayıcısı)
npm run db:studio

# Tip kontrolü
npm run type-check

# Üretim build
npm run build

# Kod formatlama
npm run format
```

### Minimum Gereken Ortam Değişkenleri

```env
# Veritabanı
DATABASE_URL="postgresql://KULLANICI:SIFRE@SUNUCU:5432/hotellink"
DIRECT_URL="postgresql://KULLANICI:SIFRE@SUNUCU:5432/hotellink"

# Auth
AUTH_SECRET="[32+ karakter rastgele string]"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth
AUTH_GOOGLE_ID="[Google OAuth Client ID]"
AUTH_GOOGLE_SECRET="[Google OAuth Client Secret]"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Resend (E-posta)
RESEND_API_KEY="re_..."

# OpenAI (YZ Eşleştirme)
OPENAI_API_KEY="sk-..."

# Supabase (Dosya Depolama)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## Ek A — API Uç Nokta Referansı

### Kimlik Doğrulama

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth işleyici |
| POST | `/api/auth/register` | Herkese açık | Kullanıcı kaydı |
| POST | `/api/auth/forgot-password` | Herkese açık | Sıfırlama talebi |
| POST | `/api/auth/reset-password` | Herkese açık | Şifre sıfırlama |

### İş İlanları

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/jobs` | Herkese açık | İş ilanı arama (filtre, sayfalama) |
| POST | `/api/jobs` | İşveren | İlan oluşturma (limit kontrolü) |
| GET | `/api/jobs/[id]` | Herkese açık | İlan detayı |
| PATCH | `/api/jobs/[id]` | İşveren | İlan güncelleme |
| DELETE | `/api/jobs/[id]` | İşveren | İlanı kaldırma |
| GET | `/api/jobs/saved` | Aday | Kaydedilen ilanlar |
| POST | `/api/jobs/[id]/save` | Aday | İlanı kaydet / kayıt kaldır |

### Başvurular

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/applications` | Giriş zorunlu | Başvuru listesi |
| POST | `/api/applications` | Aday | İş başvurusu |
| GET | `/api/applications/[id]` | Giriş zorunlu | Başvuru detayı |
| PATCH | `/api/applications/[id]` | Giriş zorunlu | Durum güncelleme |

### Oteller

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/hotels` | Herkese açık | Otel arama |
| POST | `/api/hotels` | İşveren | Otel oluşturma |
| GET | `/api/hotels/favorites` | Aday | Favori oteller |
| POST | `/api/hotels/[id]/favorite` | Aday | Favori ekle / kaldır |

### Adaylar

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/candidates` | İşveren | Aday arama |
| GET | `/api/candidates/[id]` | Giriş zorunlu | Aday profili |

### Belgeler

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/documents` | Aday | Belge listesi |
| POST | `/api/documents` | Aday | Belge yükleme |
| DELETE | `/api/documents/[id]` | Aday | Belge silme |

### Profil

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/profile/candidate` | Aday | Kendi profili |
| PATCH | `/api/profile/candidate` | Aday | Profil güncelleme |
| GET | `/api/profile/hotel` | İşveren | Kendi oteli |
| PATCH | `/api/profile/hotel` | İşveren | Otel güncelleme |
| GET | `/api/profile/hotels` | İşveren | Tüm otelleri |
| GET | `/api/profile/hotel/[hotelId]` | İşveren | Belirli otel |

### Mesajlaşma & Bildirimler

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/messages` | Giriş zorunlu | Konuşmalar |
| POST | `/api/messages` | Giriş zorunlu | Mesaj gönderme |
| GET | `/api/notifications` | Giriş zorunlu | Bildirimler (sayfalı) |
| PATCH | `/api/notifications` | Giriş zorunlu | Okundu işaretle (tekil/toplu) |

### YZ

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| POST | `/api/ai/match` | Aday | YZ iş eşleştirme |

### Stripe

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| POST | `/api/stripe/checkout` | İşveren | Ödeme oturumu oluşturma |
| POST | `/api/stripe/webhook` | Stripe | Webhook işleyici |

### Yönetici

| Metot | Uç Nokta | Yetki | Açıklama |
|-------|----------|-------|---------|
| GET | `/api/admin/stats` | Yönetici | Platform istatistikleri |
| GET | `/api/admin/users` | Yönetici | Tüm kullanıcılar (filtre, sayfalama) |
| PATCH | `/api/admin/users/[id]` | Yönetici | Kullanıcı güncelleme (durum/rol) |
| GET | `/api/admin/hotels` | Yönetici | Tüm oteller |
| PATCH | `/api/admin/hotels/[id]` | Yönetici | Otel güncelleme |
| POST | `/api/admin/hotels/[id]/verify` | Yönetici | Otel doğrulama |
| POST | `/api/admin/hotels/[id]/reject` | Yönetici | Otel reddetme |
| GET | `/api/admin/verifications` | Yönetici | Doğrulama kuyruğu |
| POST | `/api/admin/verifications/[id]/approve` | Yönetici | Onaylama |
| POST | `/api/admin/verifications/[id]/reject` | Yönetici | Reddetme |
| GET | `/api/admin/payments` | Yönetici | Tüm ödemeler |

---

## Ek B — Veritabanı Model Sayısı (Güncel)

| Kategori | Model Sayısı | Temel Modeller |
|----------|:------------:|----------------|
| Kullanıcılar & Kimlik Doğrulama | 4 | User, Account, Session, VerificationToken |
| Adaylar | 8 | CandidateProfile, CandidateLanguage, CandidateSkill, CandidateDepartment, WorkExperience, Education, Certification, Document |
| Oteller | 3 | Hotel, HotelEmployer, HotelReview |
| İş İlanları | 5 | Job, JobTranslation, Application, SavedJob, FavoriteHotel |
| İK Ajansı | 3 | HRAgency, AgencyHotelPartnership, CandidatePool |
| Ödemeler | 2 | Subscription, Payment |
| İletişim | 2 | Message, Notification |
| Doğrulama & Denetim | 2 | Verification, AuditLog |
| Destek | 2 | SupportTicket, SupportReply |
| İçerik & Ayarlar | 3 | ContentTranslation, SiteSettings, FeaturedSlot |
| **Toplam** | **34** | |

---

## Ek C — Sayfa Yapısı (Güncel)

### Genel / Herkese Açık

| Yol | Açıklama |
|-----|---------|
| `/[locale]` | Ana sayfa (10 bölüm: Hero, Stats, HowItWorks, Features, HotelShowcase, Testimonials, Pricing, FAQ, CTA) |
| `/[locale]/jobs` | İş ilanları arama & listeleme |
| `/[locale]/jobs/[slug]` | İş ilanı detay sayfası |
| `/[locale]/hotels` | Otel dizini & arama |
| `/[locale]/hotels/[slug]` | Otel profil sayfası |

### Kimlik Doğrulama

| Yol | Açıklama |
|-----|---------|
| `/[locale]/login` | Giriş (şifre + Google OAuth) |
| `/[locale]/register` | Kayıt (CANDIDATE / HOTEL_EMPLOYER / HR_AGENCY) |
| `/[locale]/forgot-password` | Şifre sıfırlama talebi |
| `/[locale]/reset-password` | Şifre sıfırlama |

### Aday Kontrol Paneli

| Yol | Açıklama |
|-----|---------|
| `/[locale]/dashboard/candidate` | Ana panel (özet istatistikler) |
| `/[locale]/dashboard/candidate/profile` | Profil düzenleme |
| `/[locale]/dashboard/candidate/applications` | Başvurular |
| `/[locale]/dashboard/candidate/jobs` | İş keşfi |
| `/[locale]/dashboard/candidate/saved` | Kaydedilen ilanlar |
| `/[locale]/dashboard/candidate/favorites` | Favori oteller |
| `/[locale]/dashboard/candidate/documents` | Belge yönetimi |
| `/[locale]/dashboard/candidate/notifications` | Bildirimler |
| `/[locale]/dashboard/candidate/work-permit` | Çalışma izni rehberi |
| `/[locale]/dashboard/candidate/ai-match` | YZ iş eşleştirme |
| `/[locale]/dashboard/candidate/settings` | Hesap ayarları |

### Otel Kontrol Paneli

| Yol | Açıklama |
|-----|---------|
| `/[locale]/dashboard/hotel` | Ana panel |
| `/[locale]/dashboard/hotel/profile` | Otel profil düzenleme |
| `/[locale]/dashboard/hotel/jobs` | İş ilanları yönetimi |
| `/[locale]/dashboard/hotel/applications` | Başvuru yönetimi |
| `/[locale]/dashboard/hotel/candidates` | Aday arama |
| `/[locale]/dashboard/hotel/analytics` | Analitik |
| `/[locale]/dashboard/hotel/billing` | Faturalama & abonelik |
| `/[locale]/dashboard/hotel/messages` | Mesajlaşma |
| `/[locale]/dashboard/hotel/notifications` | Bildirimler |
| `/[locale]/dashboard/hotel/onboarding` | Katılım süreci |
| `/[locale]/dashboard/hotel/settings` | Ayarlar |
| `/[locale]/dashboard/hotel/[hotelId]/*` | Çoklu otel yönetimi (aynı alt sayfalar) |

### Ajans Kontrol Paneli

| Yol | Açıklama |
|-----|---------|
| `/[locale]/dashboard/agency` | Ana panel |
| `/[locale]/dashboard/agency/profile` | Ajans profili |
| `/[locale]/dashboard/agency/applications` | Başvuru takibi |
| `/[locale]/dashboard/agency/hotels` | Ortak oteller |
| `/[locale]/dashboard/agency/pools` | Aday havuzları |
| `/[locale]/dashboard/agency/analytics` | Analitik |
| `/[locale]/dashboard/agency/messages` | Mesajlaşma |
| `/[locale]/dashboard/agency/settings` | Ayarlar |

### Yönetici Kontrol Paneli

| Yol | Açıklama |
|-----|---------|
| `/[locale]/dashboard/admin` | Ana panel (platform istatistikleri) |
| `/[locale]/dashboard/admin/users` | Kullanıcı yönetimi |
| `/[locale]/dashboard/admin/hotels` | Otel yönetimi |
| `/[locale]/dashboard/admin/jobs` | İş ilanı yönetimi |
| `/[locale]/dashboard/admin/verifications` | Doğrulama kuyruğu |
| `/[locale]/dashboard/admin/payments` | Ödeme & gelir |
| `/[locale]/dashboard/admin/analytics` | Gelişmiş analitik |
| `/[locale]/dashboard/admin/content` | İçerik yönetimi |
| `/[locale]/dashboard/admin/tickets` | Destek biletleri |
| `/[locale]/dashboard/admin/settings` | Sistem ayarları |

### Ortak

| Yol | Açıklama |
|-----|---------|
| `/[locale]/dashboard/messages` | Genel mesajlaşma |
| `/[locale]/dashboard/help` | Yardım merkezi |

---

## Ek D — Enum Değerleri Referansı

### Kullanıcı & Durum

| Enum | Değerler |
|------|---------|
| `UserRole` | CANDIDATE, HOTEL_EMPLOYER, HR_AGENCY, ADMIN, SUPER_ADMIN |
| `UserStatus` | ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION, BANNED |

### İş İlanı

| Enum | Değerler |
|------|---------|
| `JobStatus` | DRAFT, ACTIVE, PAUSED, CLOSED, EXPIRED, FILLED |
| `JobType` | FULL_TIME, PART_TIME, SEASONAL, CONTRACT, INTERNSHIP |
| `JobDepartment` | RECEPTION, GUEST_RELATIONS, HOUSEKEEPING, KITCHEN, FOOD_BEVERAGE, SPA_WELLNESS, ANIMATION_ENTERTAINMENT, TECHNICAL_MAINTENANCE, SECURITY, MANAGEMENT, IT, ACCOUNTING, SALES_MARKETING, HUMAN_RESOURCES, OTHER |

### Başvuru

| Enum | Değerler |
|------|---------|
| `ApplicationStatus` | DRAFT, SUBMITTED, REVIEWING, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, OFFER_EXTENDED, OFFER_ACCEPTED, OFFER_DECLINED, REJECTED, WITHDRAWN |

### Otel

| Enum | Değerler |
|------|---------|
| `HotelStatus` | PENDING_VERIFICATION, VERIFIED, SUSPENDED, REJECTED |
| `HotelType` | BOUTIQUE, RESORT, CITY_HOTEL, HOSTEL, MOTEL, VILLA, APART_HOTEL, THERMAL_HOTEL, CASINO_HOTEL, ECO_HOTEL |
| `HotelStarRating` | ONE, TWO, THREE, FOUR, FIVE |

### Aday

| Enum | Değerler |
|------|---------|
| `AvailabilityStatus` | IMMEDIATELY_AVAILABLE, AVAILABLE_IN_2_WEEKS, AVAILABLE_IN_1_MONTH, AVAILABLE_IN_3_MONTHS, NOT_LOOKING |
| `WorkPermitStatus` | NOT_STARTED, IN_PROGRESS, APPROVED, REJECTED, EXPIRED, NOT_REQUIRED |
| `LanguageLevel` | BASIC, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED, NATIVE |
| `DocumentType` | CV_RESUME, PASSPORT, VISA, WORK_PERMIT, RESIDENCE_PERMIT, DEGREE_CERTIFICATE, LANGUAGE_CERTIFICATE, PROFESSIONAL_CERTIFICATE, REFERENCE_LETTER, CRIMINAL_RECORD, HEALTH_CERTIFICATE, OTHER |
| `DocumentStatus` | PENDING, VERIFIED, REJECTED, EXPIRED |

### Doğrulama & Denetim

| Enum | Değerler |
|------|---------|
| `VerificationType` | HOTEL, DOCUMENT, IDENTITY, AGENCY |
| `VerificationStatus` | PENDING, IN_REVIEW, APPROVED, REJECTED, MORE_INFO_REQUIRED |
| `AuditAction` | CREATE, UPDATE, DELETE, LOGIN, LOGOUT, UPLOAD, DOWNLOAD, VERIFY, REJECT, SUSPEND, ACTIVATE, PAYMENT, EXPORT |

### Ödeme & Abonelik

| Enum | Değerler |
|------|---------|
| `SubscriptionPlan` | FREE, STARTER, PROFESSIONAL, ENTERPRISE |
| `SubscriptionStatus` | ACTIVE, INACTIVE, CANCELLED, PAST_DUE, TRIALING |
| `PaymentStatus` | PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED |

### Mesajlaşma

| Enum | Değerler |
|------|---------|
| `MessageStatus` | SENT, DELIVERED, READ |
| `NotificationType` | APPLICATION_RECEIVED, APPLICATION_STATUS_UPDATED, MESSAGE_RECEIVED, JOB_MATCH, INTERVIEW_SCHEDULED, DOCUMENT_VERIFIED, DOCUMENT_REJECTED, SUBSCRIPTION_EXPIRING, SUBSCRIPTION_RENEWED, PAYMENT_RECEIVED, PAYMENT_FAILED, HOTEL_VERIFIED, HOTEL_REJECTED, PROFILE_VIEWED, SYSTEM |

---

*Belge hazırlanma tarihi: Mayıs 2026*
*Platform sürümü: 0.1.0 (pre-production)*
*Referans belge: info_tr.md (Mayıs 2025)*
*Tüm finansal tahminler, karşılaştırılabilir SaaS pazar yeri referans değerlerine dayanmaktadır.*
