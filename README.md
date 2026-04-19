# PresupuestoPro 📄

Generador de presupuestos PDF profesionales para autónomos.
Preview gratuito · Descarga por 2 € · Personalizado por perfil profesional.

---

## Stack

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Base de datos + Auth**: Supabase
- **PDF**: @react-pdf/renderer (serverless-friendly)
- **Pagos**: Stripe
- **Deploy**: Netlify

---

## Requisitos previos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Stripe](https://stripe.com)
- Cuenta en [Netlify](https://netlify.com) (gratis)

---

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Rellenar las variables (ver sección siguiente)
# 4. Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

### Supabase

Ve a [supabase.com](https://supabase.com) → tu proyecto → **Settings → API**

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Stripe

Ve a [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers → API keys**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # Se obtiene al crear el webhook (ver abajo)
```

### App

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000   # En prod: https://tupdominio.netlify.app
```

---

## Configurar Supabase

### 1. Ejecutar migraciones

En **Supabase Dashboard → SQL Editor → New Query**, pega y ejecuta:

```
supabase/migrations/001_initial_schema.sql
```

Esto crea todas las tablas, políticas RLS y funciones necesarias.

### 2. Asignar rol admin

En el SQL Editor ejecuta:

```sql
SELECT set_admin_role('tu@email.com');
```

El usuario con ese email tendrá acceso completo al panel `/admin` y podrá descargar PDFs sin pagar.

---

## Configurar Stripe

### 1. Crear el Webhook

En [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks → Add endpoint**:

- **URL**: `https://tudominio.com/api/webhooks/stripe`
- **Eventos**: `checkout.session.completed`, `payment_intent.payment_failed`
- Copia el **Signing secret** → ponlo en `STRIPE_WEBHOOK_SECRET`

### 2. Probar en local con Stripe CLI

```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Despliegue en Netlify

### Opción A: desde GitHub (recomendado)

1. Sube el proyecto a GitHub
2. En Netlify: **Add new site → Import from Git**
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Instala el plugin: **@netlify/plugin-nextjs** (se configura automáticamente con `netlify.toml`)
6. En **Site settings → Environment variables**, añade todas las variables de `.env.example` con sus valores de producción

### Opción B: Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

> **Importante**: en producción, cambia `NEXT_PUBLIC_APP_URL` a tu dominio de Netlify.
> El webhook de Stripe también debe apuntar al dominio de producción.

---

## Estructura del proyecto

```
presupuestos-autonomos/
├── app/
│   ├── page.tsx                    # Generador principal (3 pasos)
│   ├── layout.tsx                  # Layout con Navbar
│   ├── login/page.tsx              # Login Supabase
│   ├── register/page.tsx           # Registro
│   ├── admin/page.tsx              # Dashboard admin
│   ├── success/page.tsx            # Post-pago Stripe
│   └── api/
│       ├── generate-pdf/route.ts   # Genera y sirve el PDF
│       ├── create-checkout-session/route.ts  # Crea sesión Stripe
│       ├── webhooks/stripe/route.ts          # Webhook Stripe
│       ├── admin/stats/route.ts              # Métricas admin
│       └── track-visit/route.ts             # Analytics básico
├── components/
│   ├── ProfileSelector.tsx         # Selector de perfil profesional
│   ├── QuoteForm.tsx               # Formulario dinámico
│   ├── QuotePreview.tsx            # Preview + CTA de pago
│   ├── Navbar.tsx                  # Navegación
│   └── AdminStats.tsx              # Dashboard de métricas
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Cliente navegador
│   │   └── server.ts               # Cliente servidor + admin
│   ├── stripe.ts                   # Instancia Stripe
│   ├── profiles.ts                 # Configuración de perfiles
│   └── pdf/
│       ├── generator.ts            # Orquestador de PDFs
│       └── templates/
│           ├── designer.tsx        # Template diseñador web
│           ├── freelancer.tsx      # Template freelancer
│           ├── trainer.tsx         # Template entrenador personal
│           └── photographer.tsx    # Template fotógrafo
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Tablas + RLS + funciones
├── middleware.ts                   # Auth + protección de rutas
├── netlify.toml                    # Configuración de despliegue
└── .env.example                    # Variables de entorno
```

---

## Añadir un nuevo perfil profesional

1. **Editar `lib/profiles.ts`**: añadir una nueva entrada en `PROFILES` con los campos específicos
2. **Crear `lib/pdf/templates/nuevo-perfil.tsx`**: copiar un template existente y adaptarlo
3. **Actualizar `lib/pdf/generator.ts`**: añadir el import y el `case` en el switch
4. **Actualizar el tipo `ProfileType`** en `lib/profiles.ts`

---

## Flujo del negocio

```
Usuario llega → Elige perfil → Rellena formulario
                                        ↓
                              API: PUT /api/generate-pdf
                              (crea registro en Supabase)
                                        ↓
                              Preview gratuito mostrado
                                        ↓
                    ¿Es admin? ──── SÍ ──→ Descarga gratis directa
                         │
                        NO
                         ↓
                  Clic en "Pagar"
                         ↓
              API: POST /api/create-checkout-session
                         ↓
                Stripe Checkout (2€)
                         ↓
              Webhook: checkout.session.completed
              (actualiza status a 'paid' en Supabase)
                         ↓
              Redirect a /success con session_id
                         ↓
                 Descarga del PDF habilitada
```

---

## Preguntas frecuentes

**¿Puedo cambiar el precio?**
Sí. Edita `PDF_PRICE_CENTS` en `lib/stripe.ts` (en céntimos de euro).

**¿Cómo probar pagos?**
Usa la tarjeta de test de Stripe: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

**¿Los PDFs se almacenan?**
No. Los PDFs se generan al vuelo en cada descarga — solo se guarda el presupuesto en JSON en Supabase.

**¿El admin siempre descarga gratis?**
Sí. El backend verifica el rol antes de generar el PDF y no requiere pago si el rol es `admin`.
