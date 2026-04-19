-- ============================================================
-- MIGRACIÓN INICIAL: Generador de Presupuestos para Autónomos
-- ============================================================
-- Ejecutar en: supabase.com → SQL Editor → New Query

-- ============================================================
-- 1. TABLA DE PERFILES DE USUARIO (extiende auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    -- Si el email coincide con el admin configurado, asignar rol admin
    CASE
      WHEN NEW.email = current_setting('app.admin_email', true) THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TABLA DE GENERACIONES DE PDF
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pdf_generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_type    TEXT NOT NULL CHECK (profile_type IN ('designer', 'freelancer', 'trainer', 'photographer')),
  client_name     TEXT NOT NULL,
  service_desc    TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  -- Estado del presupuesto
  status          TEXT NOT NULL DEFAULT 'preview' CHECK (status IN ('preview', 'paid', 'free_admin')),
  -- Token único para descarga segura (se genera tras pago)
  download_token  UUID DEFAULT gen_random_uuid(),
  -- Datos del presupuesto en JSON para regenerar el PDF
  quote_data      JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TABLA DE PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pdf_generation_id     UUID REFERENCES public.pdf_generations(id) ON DELETE SET NULL,
  stripe_session_id     TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'eur',
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

-- ============================================================
-- 4. TABLA DE ANALYTICS / VISITAS (contador simple)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page        TEXT NOT NULL DEFAULT '/',
  visitor_id  TEXT, -- cookie anónima opcional
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_generations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visits      ENABLE ROW LEVEL SECURITY;

-- user_profiles: cada usuario ve solo su perfil, admin ve todos
CREATE POLICY "users_own_profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "admin_all_profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- pdf_generations: usuario ve los suyos, admin ve todos
CREATE POLICY "users_own_generations" ON public.pdf_generations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_all_generations" ON public.pdf_generations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir insert sin autenticación (usuarios no registrados pueden generar)
CREATE POLICY "anyone_can_insert_generation" ON public.pdf_generations
  FOR INSERT WITH CHECK (true);

-- payments: usuario ve los suyos, admin ve todos
CREATE POLICY "users_own_payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_all_payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- page_visits: solo insert público, solo admin puede leer
CREATE POLICY "anyone_can_insert_visit" ON public.page_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_reads_visits" ON public.page_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 6. FUNCIÓN: ASIGNAR ROL ADMIN MANUALMENTE
-- ============================================================
-- Uso: SELECT set_admin_role('email@ejemplo.com');
CREATE OR REPLACE FUNCTION public.set_admin_role(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id
  FROM auth.users
  WHERE email = target_email;

  IF target_id IS NULL THEN
    RETURN 'Usuario no encontrado';
  END IF;

  UPDATE public.user_profiles
  SET role = 'admin', updated_at = now()
  WHERE id = target_id;

  RETURN 'Rol admin asignado a ' || target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pdf_generations_user_id ON public.pdf_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_generations_status ON public.pdf_generations(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON public.payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_created ON public.page_visits(created_at);
