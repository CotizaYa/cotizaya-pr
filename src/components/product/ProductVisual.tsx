'use client'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export type ProductVisualKind = 'door' | 'window' | 'screen' | 'garage' | 'closet' | 'glass' | 'material'

export function getProductVisualKind(category?: string | null, code?: string | null, name?: string | null): ProductVisualKind {
  const value = `${category ?? ''} ${code ?? ''} ${name ?? ''}`.toLowerCase()

  if (value.includes('screen') || value.startsWith('s0')) return 'screen'
  if (value.includes('ventana') || value.startsWith('c0')) return 'window'
  if (value.includes('garaje') || value.startsWith('gd')) return 'garage'
  if (value.includes('closet') || value.startsWith('cd')) return 'closet'
  if (value.includes('cristal') || value.includes('vidrio') || value.includes('tola')) return 'glass'
  if (value.includes('puerta') || value.startsWith('g0') || value.startsWith('m0') || value.startsWith('p0')) return 'door'
  return 'material'
}

interface ProductVisualProps {
  category?: string | null
  code?: string | null
  name?: string | null
  className?: string
  compact?: boolean
}

function DoorSvg({ variant }: { variant: 'solid' | 'glass' | 'grid' }) {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Modelo de puerta">
      <defs>
        <linearGradient id="aluminumDoor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="glassBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      <rect x="45" y="14" width="90" height="152" rx="7" fill="url(#aluminumDoor)" stroke="#334155" strokeWidth="5" />
      <rect x="56" y="25" width="68" height="130" rx="3" fill={variant === 'solid' ? '#e2e8f0' : 'url(#glassBlue)'} stroke="#64748b" strokeWidth="3" />
      {variant === 'grid' && (
        <>
          <line x1="90" y1="27" x2="90" y2="153" stroke="#64748b" strokeWidth="3" />
          <line x1="58" y1="90" x2="122" y2="90" stroke="#64748b" strokeWidth="3" />
        </>
      )}
      {variant === 'glass' && <line x1="63" y1="34" x2="116" y2="80" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="5" />}
      <circle cx="117" cy="91" r="4" fill="#334155" />
      <rect x="39" y="166" width="102" height="5" rx="2" fill="#94a3b8" />
    </svg>
  )
}

function WindowSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Modelo de ventana">
      <defs>
        <linearGradient id="windowGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <rect x="26" y="34" width="128" height="104" rx="8" fill="#e2e8f0" stroke="#334155" strokeWidth="5" />
      <rect x="38" y="46" width="104" height="80" rx="4" fill="url(#windowGlass)" stroke="#64748b" strokeWidth="3" />
      <line x1="90" y1="47" x2="90" y2="125" stroke="#64748b" strokeWidth="4" />
      <line x1="39" y1="86" x2="141" y2="86" stroke="#64748b" strokeWidth="3" />
      <line x1="50" y1="58" x2="79" y2="80" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="5" />
      <rect x="20" y="138" width="140" height="8" rx="3" fill="#94a3b8" />
    </svg>
  )
}

function ScreenSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Modelo de screen">
      <defs>
        <pattern id="mesh" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#94a3b8" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="42" y="14" width="96" height="152" rx="8" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
      <rect x="54" y="26" width="72" height="128" rx="4" fill="url(#mesh)" stroke="#64748b" strokeWidth="3" />
      <line x1="55" y1="90" x2="125" y2="90" stroke="#64748b" strokeWidth="3" />
      <circle cx="118" cy="90" r="4" fill="#334155" />
      <rect x="37" y="166" width="106" height="5" rx="2" fill="#94a3b8" />
    </svg>
  )
}

function GarageSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Modelo de puerta de garaje">
      <rect x="22" y="45" width="136" height="90" rx="8" fill="#e2e8f0" stroke="#334155" strokeWidth="5" />
      {[0, 1, 2].map((row) => (
        <line key={row} x1="24" y1={68 + row * 22} x2="156" y2={68 + row * 22} stroke="#64748b" strokeWidth="3" />
      ))}
      {[0, 1, 2].map((col) => (
        <line key={col} x1={56 + col * 34} y1="48" x2={56 + col * 34} y2="133" stroke="#94a3b8" strokeWidth="2" />
      ))}
      <rect x="18" y="136" width="144" height="8" rx="3" fill="#94a3b8" />
    </svg>
  )
}

function ClosetSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Modelo de puerta de closet">
      <rect x="34" y="25" width="112" height="130" rx="8" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
      <line x1="90" y1="29" x2="90" y2="151" stroke="#64748b" strokeWidth="4" />
      <rect x="47" y="42" width="30" height="92" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <rect x="103" y="42" width="30" height="92" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="84" cy="92" r="3" fill="#334155" />
      <circle cx="96" cy="92" r="3" fill="#334155" />
    </svg>
  )
}

function GlassSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Cristalería">
      <defs>
        <linearGradient id="glassPanel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ecfeff" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <rect x="45" y="25" width="90" height="130" rx="6" fill="url(#glassPanel)" stroke="#0891b2" strokeWidth="4" opacity="0.9" />
      <line x1="60" y1="40" x2="120" y2="95" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="7" />
      <line x1="70" y1="112" x2="112" y2="150" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="5" />
    </svg>
  )
}

function MaterialSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Material">
      <rect x="28" y="102" width="124" height="18" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
      <rect x="40" y="72" width="100" height="16" rx="7" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
      <rect x="54" y="43" width="72" height="14" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="50" cy="138" r="8" fill="#94a3b8" />
      <circle cx="78" cy="138" r="8" fill="#94a3b8" />
      <circle cx="106" cy="138" r="8" fill="#94a3b8" />
      <circle cx="134" cy="138" r="8" fill="#94a3b8" />
    </svg>
  )
}

export function ProductVisual({ category, code, name, className, compact = false }: ProductVisualProps) {
  const kind = getProductVisualKind(category, code, name)
  const codeValue = (code ?? '').toUpperCase()
  const variant = codeValue.includes('012') || codeValue.includes('002') ? 'grid' : codeValue.includes('M') ? 'solid' : 'glass'

  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 p-3 shadow-inner', compact ? 'h-24' : 'h-40', className)}>
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/60 to-transparent" />
      <div className="relative z-10 mx-auto h-full max-w-[160px]">
        {kind === 'door' && <DoorSvg variant={variant} />}
        {kind === 'window' && <WindowSvg />}
        {kind === 'screen' && <ScreenSvg />}
        {kind === 'garage' && <GarageSvg />}
        {kind === 'closet' && <ClosetSvg />}
        {kind === 'glass' && <GlassSvg />}
        {kind === 'material' && <MaterialSvg />}
      </div>
    </div>
  )
}
