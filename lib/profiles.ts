/**
 * CONFIGURACIÓN DE PERFILES PROFESIONALES
 * ========================================
 * Cada perfil define:
 * - Metadatos visuales (icono, color, descripción)
 * - Campos del formulario específicos
 * - Estructura del presupuesto
 *
 * Para AÑADIR un nuevo perfil: agrega una entrada a PROFILES
 * y crea su plantilla PDF en lib/pdf/templates/
 */

export type ProfileType = 'designer' | 'freelancer' | 'trainer' | 'photographer'

export interface FormField {
  id: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'number' | 'select'
  options?: string[]
  required: boolean
  hint?: string
}

export interface Profile {
  id: ProfileType
  name: string
  icon: string
  color: string        // Color de acento (Tailwind class)
  bgColor: string      // Fondo de la card
  description: string
  tagline: string      // Frase motivadora para el usuario
  fields: FormField[]  // Campos extra del formulario (además de los comunes)
  // Secciones que aparecen en el PDF
  pdfSections: string[]
}

export const PROFILES: Record<ProfileType, Profile> = {
  designer: {
    id: 'designer',
    name: 'Diseñador Web',
    icon: '🎨',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Presupuesto profesional para proyectos de diseño y desarrollo web',
    tagline: 'Cierra más proyectos con presupuestos que inspiran confianza',
    fields: [
      {
        id: 'project_type',
        label: 'Tipo de proyecto',
        placeholder: 'Ej: Landing page, E-commerce, Rediseño corporativo',
        type: 'select',
        options: ['Landing page', 'Sitio web corporativo', 'E-commerce', 'Aplicación web', 'Rediseño', 'Otro'],
        required: true,
      },
      {
        id: 'num_pages',
        label: 'Número de páginas/pantallas',
        placeholder: 'Ej: 5',
        type: 'number',
        required: false,
        hint: 'Aproximado',
      },
      {
        id: 'includes',
        label: '¿Qué incluye?',
        placeholder: 'Ej: Diseño responsive, SEO básico, Formulario de contacto, 2 revisiones',
        type: 'textarea',
        required: true,
      },
      {
        id: 'delivery_days',
        label: 'Plazo de entrega (días)',
        placeholder: 'Ej: 15',
        type: 'number',
        required: true,
      },
    ],
    pdfSections: ['Datos del proyecto', 'Alcance del trabajo', 'Condiciones', 'Formas de pago'],
  },

  freelancer: {
    id: 'freelancer',
    name: 'Freelancer General',
    icon: '💼',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Para cualquier servicio profesional independiente',
    tagline: 'Proyecta profesionalismo desde el primer contacto',
    fields: [
      {
        id: 'service_type',
        label: 'Tipo de servicio',
        placeholder: 'Ej: Consultoría, Redacción, Traducción, Marketing...',
        type: 'text',
        required: true,
      },
      {
        id: 'scope',
        label: 'Alcance del trabajo',
        placeholder: 'Detalla qué entregarás exactamente',
        type: 'textarea',
        required: true,
      },
      {
        id: 'duration',
        label: 'Duración estimada',
        placeholder: 'Ej: 2 semanas, 1 mes, 40 horas',
        type: 'text',
        required: false,
      },
      {
        id: 'revisions',
        label: 'Número de revisiones incluidas',
        placeholder: 'Ej: 2',
        type: 'number',
        required: false,
      },
    ],
    pdfSections: ['Descripción del servicio', 'Entregables', 'Plazos y revisiones', 'Condiciones económicas'],
  },

  trainer: {
    id: 'trainer',
    name: 'Entrenador Personal',
    icon: '💪',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Presupuesto para servicios de entrenamiento y coaching fitness',
    tagline: 'Transforma más vidas con una propuesta clara y profesional',
    fields: [
      {
        id: 'program_type',
        label: 'Tipo de programa',
        placeholder: 'Ej: Pérdida de peso, Ganancia muscular, Rendimiento deportivo',
        type: 'select',
        options: ['Pérdida de peso', 'Ganancia muscular', 'Tonificación', 'Rendimiento deportivo', 'Rehabilitación', 'Coaching nutricional', 'Personalizado'],
        required: true,
      },
      {
        id: 'modality',
        label: 'Modalidad',
        placeholder: '',
        type: 'select',
        options: ['Presencial', 'Online', 'Semipresencial'],
        required: true,
      },
      {
        id: 'sessions_per_week',
        label: 'Sesiones por semana',
        placeholder: 'Ej: 3',
        type: 'number',
        required: true,
      },
      {
        id: 'duration_weeks',
        label: 'Duración del programa (semanas)',
        placeholder: 'Ej: 12',
        type: 'number',
        required: true,
      },
      {
        id: 'includes',
        label: '¿Qué incluye el programa?',
        placeholder: 'Ej: Plan de entrenamiento personalizado, seguimiento semanal, ajustes de rutina, soporte por WhatsApp',
        type: 'textarea',
        required: true,
      },
    ],
    pdfSections: ['Perfil del cliente', 'Programa de entrenamiento', 'Metodología', 'Inversión'],
  },

  photographer: {
    id: 'photographer',
    name: 'Fotógrafo',
    icon: '📷',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Presupuesto profesional para sesiones fotográficas y reportajes',
    tagline: 'Captura más clientes con una propuesta visual e impecable',
    fields: [
      {
        id: 'shoot_type',
        label: 'Tipo de sesión',
        placeholder: 'Ej: Boda, Retrato, Corporativa, Producto...',
        type: 'select',
        options: ['Boda', 'Retrato/Familia', 'Corporativa/Empresa', 'Producto/E-commerce', 'Evento', 'Inmobiliaria', 'Moda', 'Reportaje documental'],
        required: true,
      },
      {
        id: 'shoot_duration',
        label: 'Duración de la sesión',
        placeholder: 'Ej: 4 horas, Jornada completa',
        type: 'text',
        required: true,
      },
      {
        id: 'num_photos',
        label: 'Número de fotos editadas',
        placeholder: 'Ej: 50 fotos editadas en alta resolución',
        type: 'text',
        required: true,
      },
      {
        id: 'delivery_format',
        label: 'Formato de entrega',
        placeholder: 'Ej: Galería online + descarga en alta resolución',
        type: 'text',
        required: false,
      },
      {
        id: 'extra_services',
        label: 'Servicios adicionales',
        placeholder: 'Ej: Álbum impreso, retoque avanzado, derechos de uso comercial',
        type: 'textarea',
        required: false,
      },
    ],
    pdfSections: ['Detalles de la sesión', 'Entregables', 'Derechos de imagen', 'Condiciones y pago'],
  },
}

// Campos comunes a TODOS los perfiles (siempre presentes)
export const COMMON_FIELDS: FormField[] = [
  {
    id: 'client_name',
    label: 'Nombre del cliente',
    placeholder: 'Ej: María García / Empresa ABC S.L.',
    type: 'text',
    required: true,
  },
  {
    id: 'client_email',
    label: 'Email del cliente',
    placeholder: 'cliente@email.com',
    type: 'text',
    required: false,
    hint: 'Aparecerá en el presupuesto',
  },
  {
    id: 'service_description',
    label: 'Descripción del servicio',
    placeholder: 'Describe brevemente el trabajo a realizar',
    type: 'textarea',
    required: true,
  },
  {
    id: 'price',
    label: 'Precio total (€)',
    placeholder: 'Ej: 1500',
    type: 'number',
    required: true,
    hint: 'Sin IVA',
  },
  {
    id: 'vat_percent',
    label: 'IVA (%)',
    placeholder: '21',
    type: 'number',
    required: false,
    hint: 'Por defecto 21%',
  },
]

export function getProfile(type: ProfileType): Profile {
  return PROFILES[type]
}

export const ALL_PROFILES = Object.values(PROFILES)
