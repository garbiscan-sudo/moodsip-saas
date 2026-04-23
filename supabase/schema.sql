-- ═══════════════════════════════════════════════════
--  MoodSip SaaS — Supabase PostgreSQL Şeması
--  Supabase SQL Editor'a kopyalayıp çalıştırın
-- ═══════════════════════════════════════════════════

-- ── 1. BARS (Bar bilgileri + abonelik durumu) ────
CREATE TABLE bars (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,           -- URL: moodsip.com/bar/the-velvet-room
  tagline                TEXT,
  logo_url               TEXT,
  primary_color          TEXT DEFAULT '#d4af37',         -- Bar marka rengi
  bg_color               TEXT DEFAULT '#0d0d0d',
  subscription_status    TEXT DEFAULT 'trial'            -- trial | active | cancelled | expired
    CHECK (subscription_status IN ('trial','active','cancelled','expired')),
  subscription_plan      TEXT                            -- monthly | yearly
    CHECK (subscription_plan IN ('monthly','yearly', NULL)),
  iyzico_subscription_id TEXT,                          -- İyzico abonelik ID
  iyzico_customer_id     TEXT,                          -- İyzico müşteri ID
  trial_ends_at          TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. COCKTAILS (Bara özel kokteyl listesi) ────
CREATE TABLE cocktails (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id         UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  ingredients    TEXT[] DEFAULT '{}',
  image_url      TEXT,
  tags           TEXT[] DEFAULT '{}',
  is_active      BOOLEAN DEFAULT true,
  display_order  INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. QUIZ_QUESTIONS (Sorular) ────────────────
CREATE TABLE quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id         UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  emoji          TEXT DEFAULT '🍸',
  display_order  INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. QUESTION_OPTIONS (Seçenekler) ───────────
CREATE TABLE question_options (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text           TEXT NOT NULL,
  subtext        TEXT,
  tags           TEXT[] DEFAULT '{}',
  display_order  INTEGER DEFAULT 0
);

-- ── 5. İYZICO EVENTS (Webhook log) ─────────────
CREATE TABLE iyzico_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_id       UUID REFERENCES bars(id),
  event_type   TEXT NOT NULL,
  payload      JSONB,
  processed    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS) Politikaları
-- ═══════════════════════════════════════════════════

ALTER TABLE bars              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktails         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options  ENABLE ROW LEVEL SECURITY;

-- Bars: sadece kendi barını görebilir/düzenleyebilir
CREATE POLICY "bars_owner_all" ON bars
  FOR ALL USING (auth.uid() = owner_id);

-- Bars: herkese public okuma (quiz için gerekli)
CREATE POLICY "bars_public_read" ON bars
  FOR SELECT USING (subscription_status IN ('trial','active'));

-- Cocktails: sahip tüm CRUD
CREATE POLICY "cocktails_owner_all" ON cocktails
  FOR ALL USING (
    bar_id IN (SELECT id FROM bars WHERE owner_id = auth.uid())
  );

-- Cocktails: public okuma (müşteri quiz için)
CREATE POLICY "cocktails_public_read" ON cocktails
  FOR SELECT USING (
    is_active = true AND
    bar_id IN (SELECT id FROM bars WHERE subscription_status IN ('trial','active'))
  );

-- Questions: sahip tüm CRUD
CREATE POLICY "questions_owner_all" ON quiz_questions
  FOR ALL USING (
    bar_id IN (SELECT id FROM bars WHERE owner_id = auth.uid())
  );

-- Questions: public okuma
CREATE POLICY "questions_public_read" ON quiz_questions
  FOR SELECT USING (
    is_active = true AND
    bar_id IN (SELECT id FROM bars WHERE subscription_status IN ('trial','active'))
  );

-- Options: sahip CRUD
CREATE POLICY "options_owner_all" ON question_options
  FOR ALL USING (
    question_id IN (
      SELECT id FROM quiz_questions
      WHERE bar_id IN (SELECT id FROM bars WHERE owner_id = auth.uid())
    )
  );

-- Options: public okuma
CREATE POLICY "options_public_read" ON question_options
  FOR SELECT USING (
    question_id IN (
      SELECT id FROM quiz_questions WHERE is_active = true
    )
  );

-- ═══════════════════════════════════════════════════
--  STORAGE: Kokteyl görselleri ve logolar
-- ═══════════════════════════════════════════════════
-- Supabase Storage'da "cocktail-images" ve "bar-assets" bucket'ı oluşturun
-- Aşağıdaki politikaları Storage > Policies bölümünden ekleyin:
--
-- INSERT: authenticated users (kendi bar_id klasörlerine)
-- SELECT: public (quiz için)
-- UPDATE/DELETE: authenticated (kendi klasörleri)

-- ═══════════════════════════════════════════════════
--  ÖRNEK VERİ: Yeni bir bar oluşturulduğunda
--  varsayılan soru ve kokteylleri ekle
-- ═══════════════════════════════════════════════════

-- Bu fonksiyon yeni kayıt sonrası trigger ile çalışır:
CREATE OR REPLACE FUNCTION create_default_bar_content(p_bar_id UUID)
RETURNS void AS $$
DECLARE
  q1_id UUID;
  q2_id UUID;
  q3_id UUID;
BEGIN
  -- Varsayılan sorular
  INSERT INTO quiz_questions (bar_id, question_text, emoji, display_order)
  VALUES
    (p_bar_id, 'Bu gece nasıl hissediyorsunuz?', '🌙', 0),
    (p_bar_id, 'İlk yudum nasıl olmalı?', '✨', 1),
    (p_bar_id, 'Ruh haliniz hangi hava durumu?', '🌤', 2)
  RETURNING id INTO q1_id;

  SELECT id INTO q1_id FROM quiz_questions WHERE bar_id = p_bar_id AND display_order = 0;
  SELECT id INTO q2_id FROM quiz_questions WHERE bar_id = p_bar_id AND display_order = 1;
  SELECT id INTO q3_id FROM quiz_questions WHERE bar_id = p_bar_id AND display_order = 2;

  -- Soru 1 seçenekleri
  INSERT INTO question_options (question_id, text, subtext, tags, display_order) VALUES
    (q1_id, 'Kutlamaya hazırım', 'Bu gece özel bir şey var', ARRAY['sweet','romantic','social','light'], 0),
    (q1_id, 'Sessiz bir kaçış istiyorum', 'Sadece ben ve bardaki koltuğum', ARRAY['chill','mysterious','medium'], 1),
    (q1_id, 'Maceraya açığım', 'Sürprizlere hazırım', ARRAY['adventurous','bitter','bold'], 2),
    (q1_id, 'Biriyle özel bir an', 'Bağlantı bu gecenin özü', ARRAY['romantic','floral','sour'], 3);

  -- Soru 2 seçenekleri
  INSERT INTO question_options (question_id, text, subtext, tags, display_order) VALUES
    (q2_id, 'Anında vursun — sert ve kararlı', 'Hemen hissettir kendini', ARRAY['strong','bitter','bold'], 0),
    (q2_id, 'Yavaş açılsın — katmanlı', 'Sabırlıyım', ARRAY['medium','mysterious','herbal'], 1),
    (q2_id, 'Her şeyi aydınlatsın — taze', 'Yüzümü uyandırsın', ARRAY['sour','fresh','high-energy'], 2),
    (q2_id, 'Rahatlatıcı olsun — yumuşak', 'Eski bir dost gibi', ARRAY['sweet','creamy','chill'], 3);

  -- Soru 3 seçenekleri
  INSERT INTO question_options (question_id, text, subtext, tags, display_order) VALUES
    (q3_id, '⚡ Elektrik fırtınası — enerjik', 'Yüksek enerji', ARRAY['high-energy','spicy','playful'], 0),
    (q3_id, '🌊 Derin deniz — sakin ama güçlü', 'Yüzeyde sakin, içte güçlü', ARRAY['chill','bold','strong'], 1),
    (q3_id, '🌸 Erken bahar — sıcak ve umut dolu', 'Hafif, neşeli', ARRAY['floral','sweet','romantic'], 2),
    (q3_id, '🌫 Sisli akşam — melankolik', 'Atmosferik, biraz hüzünlü', ARRAY['smoky','sour','adventurous'], 3);

  -- Varsayılan kokteyl (örnek)
  INSERT INTO cocktails (bar_id, name, description, ingredients, tags, display_order) VALUES
    (p_bar_id, 'Negroni', 'Üç eşit parça, sıfır uzlaşma.', ARRAY['1 oz Cin', '1 oz Campari', '1 oz Tatlı Vermut'], ARRAY['bitter','strong','bold','adventurous'], 0),
    (p_bar_id, 'Old Fashioned', 'Orijinal kokteyl. Yavaş ve derin.', ARRAY['2 oz Bourbon', '2 dash Angostura', '1 Şeker küpü'], ARRAY['strong','bold','chill','nostalgic'], 1),
    (p_bar_id, 'Espresso Martini', 'Gecenin devam etmesini sağlayan içki.', ARRAY['2 oz Votka', '1 oz Kahve liköru', '1 oz Taze espresso'], ARRAY['sweet','strong','high-energy','bold'], 2);

END;
$$ LANGUAGE plpgsql;

-- updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bars_updated_at     BEFORE UPDATE ON bars     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cocktails_updated_at BEFORE UPDATE ON cocktails FOR EACH ROW EXECUTE FUNCTION update_updated_at();
