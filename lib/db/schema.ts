/**
 * AUTO-INIT SCHEMA
 * ================
 * Asegura que las tablas existen en Neon antes de cualquier query.
 * Idempotente (CREATE TABLE IF NOT EXISTS).
 * Solo se ejecuta una vez por instancia del worker (cache en memoria).
 */
import { sql } from './index'

let initialized = false
let initPromise: Promise<void> | null = null

export async function ensureSchema(): Promise<void> {
  if (initialized) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        clerk_user_id  TEXT PRIMARY KEY,
        email          TEXT NOT NULL,
        full_name      TEXT,
        role           TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `
    await sql`
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
      )
    `
    await sql`
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
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS page_visits (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page        TEXT NOT NULL DEFAULT '/',
        visitor_id  TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `
    initialized = true
  })()

  try {
    await initPromise
  } catch (e) {
    initPromise = null
    throw e
  }
}
