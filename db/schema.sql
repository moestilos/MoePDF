-- ============================================================
-- SCHEMA PARA NEON (PostgreSQL serverless)
-- ============================================================
-- Ejecutar en: neon.tech → tu proyecto → SQL Editor
-- Diferencias respecto a Supabase:
--   ✓ No usamos auth.users (la auth la gestiona Clerk)
--   ✓ La clave del usuario es clerk_user_id TEXT (el ID de Clerk)
--   ✓ No hay RLS — el control de acceso se hace en las API routes
-- ============================================================

-- ============================================================
-- 1. PERFILES DE USUARIO
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  clerk_user_id  TEXT PRIMARY KEY,         -- ID de Clerk (ej: user_2abc...)
  email          TEXT NOT NULL,
  full_name      TEXT,
  role           TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. GENERACIONES DE PDF
-- ============================================================
CREATE TABLE IF NOT EXISTS pdf_generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE SET NULL,
  profile_type    TEXT NOT NULL CHECK (profile_type IN ('designer', 'freelancer', 'trainer', 'photographer')),
  client_name     TEXT NOT NULL,
  service_desc    TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview', 'paid', 'free_admin')),
  download_token  UUID NOT NULL DEFAULT gen_random_uuid(),
  quote_data      JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id         TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE SET NULL,
  pdf_generation_id     UUID REFERENCES pdf_generations(id) ON DELETE SET NULL,
  stripe_session_id     TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'eur',
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

-- ============================================================
-- 4. VISITAS (analytics básico)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page        TEXT NOT NULL DEFAULT '/',
  visitor_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pdf_generations_clerk_user ON pdf_generations(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_generations_status ON pdf_generations(status);
CREATE INDEX IF NOT EXISTS idx_payments_clerk_user ON payments(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_created ON page_visits(created_at);

-- ============================================================
-- 6. FUNCIÓN: ASIGNAR ROL ADMIN
-- ============================================================
-- Uso: SELECT set_admin('user_2abc...');   ← ID de Clerk del usuario
-- O por email: SELECT set_admin_by_email('tu@email.com');
CREATE OR REPLACE FUNCTION set_admin(target_clerk_id TEXT)
RETURNS TEXT AS $$
BEGIN
  UPDATE user_profiles
  SET role = 'admin', updated_at = now()
  WHERE clerk_user_id = target_clerk_id;

  IF NOT FOUND THEN
    RETURN 'Usuario no encontrado. El usuario debe haberse registrado al menos una vez.';
  END IF;

  RETURN 'Rol admin asignado a ' || target_clerk_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_admin_by_email(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_id TEXT;
BEGIN
  SELECT clerk_user_id INTO target_id
  FROM user_profiles
  WHERE email = target_email;

  IF target_id IS NULL THEN
    RETURN 'Email no encontrado. El usuario debe haberse registrado al menos una vez.';
  END IF;

  UPDATE user_profiles
  SET role = 'admin', updated_at = now()
  WHERE clerk_user_id = target_id;

  RETURN 'Rol admin asignado a ' || target_email;
END;
$$ LANGUAGE plpgsql;
