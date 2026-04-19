'use client'
/**
 * ADMIN STATS — Dark theme + Donut charts
 * Gráficas circulares para visitas, ventas y distribución por perfil.
 */
import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts'

interface StatsData {
  stats: {
    total_users: number
    total_generations: number
    total_sales: number
    total_revenue: number
    total_visits: number
  }
  generations_by_profile: Record<string, number>
  sales_chart: { date: string; sales: number; revenue: number }[]
  recent_generations: {
    id: string
    profile_type: string
    client_name: string
    status: string
    price: number
    created_at: string
  }[]
}

// ─── Design tokens ────────────────────────────────────
const PROFILE_COLORS: Record<string, string> = {
  designer:     '#818cf8',
  freelancer:   '#38bdf8',
  trainer:      '#34d399',
  photographer: '#fbbf24',
}
const PROFILE_NAMES: Record<string, string> = {
  designer:     'Diseñador',
  freelancer:   'Freelancer',
  trainer:      'Entrenador',
  photographer: 'Fotógrafo',
}
const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  preview:    { bg: 'rgba(255,255,255,0.06)', text: '#8080a8', label: 'Preview' },
  paid:       { bg: 'rgba(52,211,153,0.12)',  text: '#34d399',  label: 'Pagado' },
  free_admin: { bg: 'rgba(167,139,250,0.12)', text: '#c4b5fd',  label: 'Admin' },
}

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.04)',
  border:     '1px solid rgba(99,102,241,0.12)',
  borderRadius: '16px',
}

// ─── Custom Tooltip para donut ─────────────────────────
function DonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{
      background: 'rgba(16,18,42,0.95)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '10px',
      padding: '8px 12px',
      fontSize: '12px',
      color: '#e2e2f0',
    }}>
      <span style={{ color: p.payload.color, fontWeight: 700 }}>{p.name}</span>
      <span style={{ marginLeft: 8, color: '#e2e2f0' }}>{p.value}</span>
    </div>
  )
}

// ─── Custom label centrado en el donut ────────────────
function DonutCenterLabel({ total, label }: { total: number; label: string }) {
  return (
    <text textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-8" fontSize="22" fontWeight="900" fill="#e2e2f0">{total}</tspan>
      <tspan x="50%" dy="20" fontSize="11" fill="#8080a8">{label}</tspan>
    </text>
  )
}

// ─── Line chart tooltip ────────────────────────────────
function LineTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(16,18,42,0.95)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '10px',
      padding: '8px 12px',
      fontSize: '12px',
    }}>
      <div style={{ color: '#8080a8', marginBottom: 4 }}>{label?.slice(5)}</div>
      <div style={{ color: '#818cf8', fontWeight: 700 }}>{payload[0].value} ventas</div>
    </div>
  )
}

// ════════════════════════════════════════════════════
export function AdminStats() {
  const [data, setData]       = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : r.json().then((e: { error: string }) => { throw new Error(e.error) }))
      .then(setData)
      .catch((e: Error) => setError(e.message ?? 'Error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />
  if (!data)   return null

  // ── Datos para gráficas ──────────────────────────
  const profileData = Object.entries(data.generations_by_profile).map(([key, val]) => ({
    name:  PROFILE_NAMES[key] ?? key,
    value: val,
    color: PROFILE_COLORS[key] ?? '#6366f1',
  }))
  const totalGenerations = profileData.reduce((s, d) => s + d.value, 0)

  const statusData = data.recent_generations.reduce((acc: Record<string, number>, g) => {
    acc[g.status] = (acc[g.status] ?? 0) + 1
    return acc
  }, {})
  const statusChartData = Object.entries(statusData).map(([key, val]) => ({
    name:  STATUS_STYLE[key]?.label ?? key,
    value: val,
    color: STATUS_STYLE[key]?.text ?? '#6366f1',
  }))
  const totalStatus = statusChartData.reduce((s, d) => s + d.value, 0)

  const hasProfileData = profileData.length > 0 && totalGenerations > 0
  const hasStatusData  = statusChartData.length > 0 && totalStatus > 0
  const hasSalesData   = data.sales_chart.some(d => d.sales > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ─── KPI Cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        <KpiCard label="Usuarios"      value={data.stats.total_users}                       color="#818cf8" icon="👥" />
        <KpiCard label="PDFs generados" value={data.stats.total_generations}                color="#38bdf8" icon="📄" />
        <KpiCard label="Ventas"         value={data.stats.total_sales}                      color="#34d399" icon="💳" />
        <KpiCard label="Ingresos"       value={`${data.stats.total_revenue.toFixed(2)} €`}  color="#fbbf24" icon="💰" />
        <KpiCard label="Visitas (30d)"  value={data.stats.total_visits}                     color="#c4b5fd" icon="👁" />
      </div>

      {/* ─── Donut charts row ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>

        {/* Donut 1 — PDFs por perfil */}
        <DonutCard title="PDFs por perfil" subtitle={`${totalGenerations} totales`}>
          {hasProfileData ? (
            <DonutChart data={profileData} total={totalGenerations} centerLabel="PDFs" />
          ) : (
            <EmptyDonut />
          )}
          {hasProfileData && <Legend data={profileData} />}
        </DonutCard>

        {/* Donut 2 — Estado de generaciones */}
        <DonutCard title="Estado de generaciones" subtitle={`${totalStatus} recientes`}>
          {hasStatusData ? (
            <DonutChart data={statusChartData} total={totalStatus} centerLabel="docs" />
          ) : (
            <EmptyDonut />
          )}
          {hasStatusData && <Legend data={statusChartData} />}
        </DonutCard>

        {/* Donut 3 — Conversión (ventas vs total) */}
        <DonutCard
          title="Conversión"
          subtitle={totalGenerations > 0
            ? `${Math.round((data.stats.total_sales / totalGenerations) * 100)}% de conversión`
            : 'Sin datos aún'}
        >
          {totalGenerations > 0 ? (
            <DonutChart
              data={[
                { name: 'Ventas',   value: data.stats.total_sales,                             color: '#34d399' },
                { name: 'Preview',  value: Math.max(0, totalGenerations - data.stats.total_sales), color: 'rgba(255,255,255,0.1)' },
              ]}
              total={data.stats.total_sales}
              centerLabel="ventas"
            />
          ) : (
            <EmptyDonut />
          )}
          <Legend data={[
            { name: 'Pagado',  color: '#34d399' },
            { name: 'Preview', color: 'rgba(255,255,255,0.3)' },
          ]} />
        </DonutCard>
      </div>

      {/* ─── Line chart — ventas últimos 7 días ─────────── */}
      <div style={{ ...CARD_STYLE, padding: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e2f0', marginBottom: '4px' }}>
          Ventas — últimos 7 días
        </h3>
        <p style={{ fontSize: '11px', color: '#4a4a72', marginBottom: '20px' }}>
          Número de PDFs comprados por día
        </p>
        {hasSalesData ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.sales_chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={d => d.slice(5)}
                tick={{ fontSize: 10, fill: '#4a4a72' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#4a4a72' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#818cf8', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#c4b5fd' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4a72', fontSize: 13 }}>
            Sin ventas en los últimos 7 días
          </div>
        )}
      </div>

      {/* ─── Tabla generaciones recientes ─────────────── */}
      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e2f0' }}>Generaciones recientes</h3>
        </div>
        {data.recent_generations.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#4a4a72', fontSize: 13 }}>
            No hay generaciones aún
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  {['Cliente', 'Perfil', 'Precio', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#4a4a72', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent_generations.map((gen, i) => (
                  <tr
                    key={gen.id}
                    style={{
                      borderBottom: i < data.recent_generations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 20px', color: '#d4d4f0', fontWeight: 500 }}>{gen.client_name}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: PROFILE_COLORS[gen.profile_type] ?? '#818cf8',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: PROFILE_COLORS[gen.profile_type] ?? '#818cf8',
                          flexShrink: 0,
                        }}/>
                        {PROFILE_NAMES[gen.profile_type] ?? gen.profile_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#8080a8' }}>{Number(gen.price).toFixed(2)} €</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: 11,
                        fontWeight: 600,
                        background: STATUS_STYLE[gen.status]?.bg ?? 'rgba(255,255,255,0.06)',
                        color: STATUS_STYLE[gen.status]?.text ?? '#8080a8',
                      }}>
                        {STATUS_STYLE[gen.status]?.label ?? gen.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#4a4a72' }}>
                      {new Date(gen.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Subcomponentes
// ═══════════════════════════════════════════════════

function DonutCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ ...CARD_STYLE, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#e2e2f0' }}>{title}</h3>
      <p style={{ fontSize: '11px', color: '#4a4a72', marginBottom: 8 }}>{subtitle}</p>
      {children}
    </div>
  )
}

function DonutChart({ data, total, centerLabel }: {
  data: { name: string; value: number; color: string }[]
  total: number
  centerLabel: string
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 180 }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={54}
            outerRadius={78}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
          {/* Center label */}
          <text textAnchor="middle" dominantBaseline="middle" x="50%" y="50%">
            <tspan x="50%" dy="-8" fontSize="22" fontWeight="900" fill="#e2e2f0">{total}</tspan>
            <tspan x="50%" dy="20" fontSize="11" fill="#8080a8">{centerLabel}</tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function Legend({ data }: { data: { name: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 8 }}>
      {data.map(d => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#8080a8' }}>{d.name}</span>
        </div>
      ))}
    </div>
  )
}

function EmptyDonut() {
  return (
    <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4a72', fontSize: 12 }}>
      Sin datos aún
    </div>
  )
}

function KpiCard({ label, value, color, icon }: {
  label: string; value: string | number; color: string; icon: string
}) {
  return (
    <div style={{ ...CARD_STYLE, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#4a4a72', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, margin: 0 }}>{value}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ height: 90, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: 240, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ height: 250, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{
      borderRadius: 16,
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      padding: '28px',
      textAlign: 'center',
    }}>
      <p style={{ color: '#f87171', fontWeight: 600, marginBottom: 12 }}>{message}</p>
      <button
        onClick={() => window.location.reload()}
        style={{ fontSize: 12, color: '#f87171', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Reintentar
      </button>
    </div>
  )
}
