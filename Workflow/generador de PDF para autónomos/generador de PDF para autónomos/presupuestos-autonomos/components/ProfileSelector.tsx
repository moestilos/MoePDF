'use client'
import { useState, useCallback } from 'react'
import { ALL_PROFILES, Profile, ProfileType } from '@/lib/profiles'
import { IconBrush, IconBriefcase, IconBarbell, IconCamera, IconCheck } from './Icons'

const PROFILE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  designer:     IconBrush,
  freelancer:   IconBriefcase,
  trainer:      IconBarbell,
  photographer: IconCamera,
}

interface ProfileStyle {
  gradient:    string
  glow:        string
  glowStrong:  string
  iconBg:      string
  iconBgHover: string
  iconColor:   string
  ringColor:   string
  accentColor: string
  accentRgb:   string
  tag:         string
  tagline:     string
}

const PROFILE_STYLE: Record<string, ProfileStyle> = {
  designer: {
    gradient:    'from-violet-500 to-purple-600',
    glow:        'rgba(124,58,237,0.18)',
    glowStrong:  'rgba(124,58,237,0.35)',
    iconBg:      'rgba(124,58,237,0.22)',
    iconBgHover: 'rgba(124,58,237,0.32)',
    iconColor:   '#c4b5fd',
    ringColor:   'rgba(124,58,237,0.55)',
    accentColor: '#c4b5fd',
    accentRgb:   '124,58,237',
    tag:         'Diseño web',
    tagline:     'Webs, apps, branding',
  },
  freelancer: {
    gradient:    'from-blue-500 to-indigo-600',
    glow:        'rgba(59,130,246,0.16)',
    glowStrong:  'rgba(59,130,246,0.32)',
    iconBg:      'rgba(59,130,246,0.2)',
    iconBgHover: 'rgba(59,130,246,0.3)',
    iconColor:   '#93c5fd',
    ringColor:   'rgba(59,130,246,0.5)',
    accentColor: '#93c5fd',
    accentRgb:   '59,130,246',
    tag:         'Servicios pro',
    tagline:     'Consultoría, desarrollo',
  },
  trainer: {
    gradient:    'from-emerald-500 to-green-600',
    glow:        'rgba(16,185,129,0.15)',
    glowStrong:  'rgba(16,185,129,0.30)',
    iconBg:      'rgba(16,185,129,0.18)',
    iconBgHover: 'rgba(16,185,129,0.28)',
    iconColor:   '#6ee7b7',
    ringColor:   'rgba(16,185,129,0.5)',
    accentColor: '#6ee7b7',
    accentRgb:   '16,185,129',
    tag:         'Fitness',
    tagline:     'Personal training, clases',
  },
  photographer: {
    gradient:    'from-amber-500 to-orange-600',
    glow:        'rgba(245,158,11,0.15)',
    glowStrong:  'rgba(245,158,11,0.30)',
    iconBg:      'rgba(245,158,11,0.18)',
    iconBgHover: 'rgba(245,158,11,0.28)',
    iconColor:   '#fcd34d',
    ringColor:   'rgba(245,158,11,0.5)',
    accentColor: '#fcd34d',
    accentRgb:   '245,158,11',
    tag:         'Fotografía',
    tagline:     'Bodas, eventos, retratos',
  },
}

interface ProfileSelectorProps {
  selected: ProfileType | null
  onSelect: (type: ProfileType) => void
}

export function ProfileSelector({ selected, onSelect }: ProfileSelectorProps) {
  return (
    <div>
      <div className="mb-7">
        <h2 className="text-[22px] font-bold tracking-tight mb-1 text-white">
          ¿Cuál es tu profesión?
        </h2>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          El formulario y el diseño del PDF se adaptan a tu actividad
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ALL_PROFILES.map((profile, i) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={selected === profile.id}
            onSelect={onSelect}
            index={i}
          />
        ))}
      </div>

      <p
        className="mt-5 text-center text-[11px] flex items-center justify-center gap-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Selecciona un perfil para continuar
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </p>
    </div>
  )
}

function ProfileCard({
  profile, isSelected, onSelect, index,
}: {
  profile: Profile; isSelected: boolean; onSelect: (t: ProfileType) => void; index: number
}) {
  const [hovered, setHovered]       = useState(false)
  const [shimmerKey, setShimmerKey] = useState(0)

  const Icon  = PROFILE_ICONS[profile.id]
  const style = PROFILE_STYLE[profile.id]

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    setShimmerKey(k => k + 1)
  }, [])
  const handleMouseLeave = useCallback(() => setHovered(false), [])

  const active = isSelected || hovered

  return (
    <button
      onClick={() => onSelect(profile.id)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        animationDelay: `${index * 60}ms`,
        background: isSelected
          ? `rgba(${style.accentRgb},0.1)`
          : hovered
            ? `rgba(${style.accentRgb},0.07)`
            : 'rgba(255,255,255,0.055)',
        border: `1px solid ${
          isSelected ? style.ringColor
          : hovered   ? `rgba(${style.accentRgb},0.4)`
          :             'rgba(255,255,255,0.13)'
        }`,
        boxShadow: isSelected
          ? `0 0 0 1px ${style.ringColor}, 0 8px 32px ${style.glowStrong}, inset 0 1px 0 rgba(255,255,255,0.1)`
          : hovered
            ? `0 0 24px ${style.glow}, 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`
            : 'inset 0 1px 0 rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transform: isSelected
          ? 'translateY(-1px)'
          : hovered
            ? 'translateY(-3px)'
            : 'translateY(0)',
        transition: [
          'background 0.22s ease',
          'border-color 0.22s ease',
          'box-shadow 0.22s ease',
          'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        ].join(', '),
      }}
      className="animate-slide-up relative flex flex-col items-start p-4 sm:p-5 rounded-2xl cursor-pointer text-left w-full focus:outline-none overflow-hidden"
    >

      {/* ── Shimmer on hover ── */}
      <span
        key={shimmerKey}
        aria-hidden="true"
        className={hovered && !isSelected ? 'animate-shimmer-slide' : ''}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '35%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, rgba(${style.accentRgb},0.12), transparent)`,
          pointerEvents: 'none',
          willChange: 'transform',
          display: hovered && !isSelected ? 'block' : 'none',
        }}
      />

      {/* ── Glow radial (selected) ── */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 0% 0%, ${style.glow} 0%, transparent 70%)` }}
        />
      )}

      {/* ── Top accent line ── */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{
          background: active
            ? `linear-gradient(90deg, transparent, rgba(${style.accentRgb},0.6), transparent)`
            : 'rgba(255,255,255,0.06)',
          transition: 'background 0.25s ease',
        }}
      />

      {/* ── Check badge ── */}
      {isSelected && (
        <div
          className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${style.gradient}`}
          style={{ boxShadow: `0 0 12px ${style.glow}` }}
        >
          <IconCheck className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {/* ── Category tag ── */}
      <span
        className="text-[9px] font-bold uppercase tracking-[0.1em] mb-3"
        style={{
          color: active ? style.accentColor : 'rgba(160,160,200,0.65)',
          transition: 'color 0.2s ease',
        }}
      >
        {style.tag}
      </span>

      {/* ── Icon ── */}
      <div
        className="w-11 h-11 rounded-xl mb-3 flex items-center justify-center"
        style={{
          background: isSelected
            ? style.iconBg
            : hovered
              ? style.iconBgHover
              : 'rgba(255,255,255,0.08)',
          boxShadow: active ? `0 0 18px ${style.glow}` : 'none',
          transition: 'background 0.22s ease, box-shadow 0.22s ease',
        }}
      >
        {Icon && (
          <Icon
            className="w-5 h-5"
            style={{
              color: active ? style.iconColor : 'rgba(255,255,255,0.55)',
              transition: 'color 0.2s ease',
              filter: active ? `drop-shadow(0 0 6px rgba(${style.accentRgb},0.5))` : 'none',
            }}
          />
        )}
      </div>

      {/* ── Name ── */}
      <span
        className="font-bold text-[14px] leading-snug mb-0.5"
        style={{
          color: active ? 'white' : '#d4d4f0',
          transition: 'color 0.2s ease',
        }}
      >
        {profile.name}
      </span>

      {/* ── Tagline (replaces generic description on hover) ── */}
      <span
        className="text-[10px] font-medium leading-relaxed"
        style={{
          color: active ? `rgba(${style.accentRgb},0.85)` : 'rgba(160,160,200,0.55)',
          transition: 'color 0.2s ease',
        }}
      >
        {style.tagline}
      </span>

      {/* ── Description (full, fades in slightly on hover) ── */}
      <span
        className="text-[11px] leading-relaxed mt-1 line-clamp-2"
        style={{
          color: active ? 'rgba(210,210,240,0.7)' : 'rgba(160,160,200,0.5)',
          transition: 'color 0.2s ease',
        }}
      >
        {profile.description}
      </span>
    </button>
  )
}
