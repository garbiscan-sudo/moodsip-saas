# MoodSip SaaS — Kurulum Rehberi

Mood tabanlı kokteyl quiz platformu. Bar sahipleri üye olur, kendi quiz sayfalarını yönetir. Müşteriler QR kod ile erişir.

## 🏗 Mimari

```
moodsip.com/              → Landing page (bar sahipleri için)
moodsip.com/auth/register → Kayıt + bar kurulumu
moodsip.com/dashboard     → Bar sahibi yönetim paneli
moodsip.com/bar/[slug]    → Müşteriye açık quiz sayfası (QR → buraya)
```

## 🛠 Kullanılan Teknolojiler

| Katman      | Teknoloji              | Neden?                               |
|-------------|------------------------|--------------------------------------|
| Frontend    | Next.js 14 (App Router)| Full-stack, Vercel'de ücretsiz       |
| Veritabanı  | Supabase (PostgreSQL)  | Auth + DB + Storage hepsi bir arada  |
| Ödeme       | İyzico                 | TR bankacılık, taksit, fatura        |
| Hosting     | Vercel                 | Free tier, otomatik CDN              |
| Stil        | Tailwind CSS           | Hızlı, özelleştirilebilir            |

**Başlangıç maliyeti: ₺0** (İyzico sadece başarılı ödemeden komisyon alır)

---

## 🚀 Adım Adım Kurulum

### 1. Supabase Kurulumu

1. [supabase.com](https://supabase.com) → New Project oluşturun
2. `SQL Editor` → `supabase/schema.sql` içeriğini yapıştırın → Çalıştırın
3. `Project Settings → API` → URL ve Anon Key'i kopyalayın
4. `Storage` → `cocktail-images` ve `bar-assets` adında 2 bucket oluşturun (Public: ON)
5. Auth ayarları: `Authentication → URL Configuration` → Site URL: `https://moodsip.com`

### 2. İyzico Ajans Hesabı

1. [merchant.iyzipay.com](https://merchant.iyzipay.com) → Ayarlar → Güvenlik
2. API Key ve Secret Key'i kopyalayın
3. **Test ortamı** için: `https://sandbox-api.iyzipay.com`
4. **Canlı ortam** için: `https://api.iyzipay.com`
5. Webhook URL'ini ekleyin: `https://moodsip.com/api/iyzico/webhook`

### 3. Proje Kurulumu

```bash
# Depoyu klonlayın veya zip'i açın
cd moodsip-saas

# Bağımlılıkları yükleyin
npm install

# .env.local dosyasını oluşturun
cp .env.local.example .env.local
# → Dosyayı açıp değerleri doldurun

# Geliştirme sunucusunu başlatın
npm run dev
# → http://localhost:3000 adresini açın
```

### 4. .env.local Doldurma

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

IYZICO_API_KEY=sandbox-xxxx
IYZICO_SECRET_KEY=sandbox-xxxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_PRICE_MONTHLY=299
NEXT_PUBLIC_PRICE_YEARLY=2490
```

### 5. Vercel'e Deploy

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Deploy edin
vercel

# Production build
vercel --prod
```

**Vercel Dashboard → Environment Variables** bölümüne .env.local içindeki tüm değerleri ekleyin.

### 6. Domain Bağlama

1. Vercel → Project Settings → Domains → `moodsip.com` ekleyin
2. DNS: `A record → 76.76.21.21` (Vercel IP)
3. Supabase → Auth → URL Configuration → Site URL'i güncelleyin

---

## 📁 Proje Yapısı

```
moodsip-saas/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx          # Giriş
│   │   └── register/page.tsx       # Kayıt (2 adım)
│   ├── dashboard/
│   │   ├── layout.tsx              # Sidebar layout
│   │   ├── page.tsx                # Genel bakış
│   │   ├── cocktails/page.tsx      # Kokteyl yönetimi
│   │   ├── questions/page.tsx      # Quiz soruları
│   │   ├── qr/page.tsx             # QR kod üretici
│   │   └── settings/page.tsx       # Ayarlar + ödeme
│   ├── [barSlug]/page.tsx          # MÜŞTERİ QUIZ SAYFASI
│   └── api/
│       ├── iyzico/route.ts         # Ödeme API
│       └── auth/route.ts           # Çıkış API
├── components/
│   ├── dashboard/
│   │   ├── SidebarClient.tsx       # Aktif link
│   │   ├── CocktailManager.tsx     # Kokteyl CRUD
│   │   ├── QuestionManager.tsx     # Soru CRUD
│   │   ├── QRCodeGenerator.tsx     # QR üretici
│   │   └── SettingsClient.tsx      # Ayarlar + İyzico form
│   └── quiz/
│       └── QuizApp.tsx             # Müşteri quiz deneyimi
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client + admin
│   ├── iyzico.ts                   # İyzico entegrasyonu
│   └── types.ts                    # TypeScript tipleri
└── supabase/
    └── schema.sql                  # Veritabanı şeması
```

---

## 💳 İyzico Test Kartları

Geliştirme sırasında şu test kartlarını kullanın:

| Kart No          | Son Kullanma | CVV | Sonuç   |
|------------------|-------------|-----|---------|
| 5528790000000008 | 12/30       | 123 | Başarılı|
| 5400010000000004 | 12/30       | 123 | Başarılı|
| 4111111111111129 | 12/30       | 123 | Başarılı|

---

## 🔧 Özelleştirme

### Fiyat Değiştirme
`.env.local` dosyasında:
```
NEXT_PUBLIC_PRICE_MONTHLY=399
NEXT_PUBLIC_PRICE_YEARLY=2990
```

### Yeni Dil Ekleme
`components/quiz/QuizApp.tsx` → `labels` dizisini güncelleyin.

### Deneme Süresi Değiştirme
`supabase/schema.sql`:
```sql
trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
```

---

## 🆘 Sık Karşılaşılan Sorunlar

**"slug zaten alınmış" hatası:** Bar URL'si benzersiz olmalı. Kayıt formunda otomatik oluşturulur, kullanıcı değiştirebilir.

**İyzico ödeme başarısız:** Sandbox modunda test kartı kullandığınızdan emin olun. Canlıya geçerken `IYZICO_BASE_URL`'i güncelleyin.

**Quiz sayfası "menü hazırlanıyor":** Bar'a en az 1 aktif kokteyl ve 1 soru eklenmelidir.

**Supabase RLS hatası:** Schema'yı doğru çalıştırdığınızdan emin olun. `SQL Editor`'da hataları kontrol edin.
