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

const frame = '#1f2937'
const rail = '#64748b'
const fill = '#f8fafc'
const glass = '#e8f7fb'
const guide = '#cbd5e1'
const accent = '#0f766e'

function DimensionLine({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={guide} strokeWidth="1.5" strokeDasharray="3 4" />
      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">{label}</text>
    </>
  )
}

function DoorSvg({ variant }: { variant: 'solid' | 'glass' | 'grid' }) {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de puerta">
      <rect x="52" y="18" width="76" height="140" rx="2" fill="#ffffff" stroke={frame} strokeWidth="4" />
      <rect x="61" y="28" width="58" height="120" rx="1.5" fill={variant === 'solid' ? fill : glass} stroke={rail} strokeWidth="2.5" />
      {variant === 'grid' && (
        <>
          <line x1="90" y1="29" x2="90" y2="147" stroke={rail} strokeWidth="2" />
          <line x1="62" y1="88" x2="118" y2="88" stroke={rail} strokeWidth="2" />
        </>
      )}
      {variant === 'solid' && (
        <>
          <line x1="69" y1="54" x2="111" y2="54" stroke={guide} strokeWidth="2" />
          <line x1="69" y1="88" x2="111" y2="88" stroke={guide} strokeWidth="2" />
          <line x1="69" y1="122" x2="111" y2="122" stroke={guide} strokeWidth="2" />
        </>
      )}
      <circle cx="112" cy="90" r="3" fill={frame} />
      <line x1="45" y1="160" x2="135" y2="160" stroke={rail} strokeWidth="3" />
      <DimensionLine x1={42} y1={18} x2={42} y2={158} label="alto" />
      <DimensionLine x1={52} y1={169} x2={128} y2={169} label="ancho" />
    </svg>
  )
}

function WindowSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de ventana">
      <rect x="28" y="42" width="124" height="86" rx="2" fill="#ffffff" stroke={frame} strokeWidth="4" />
      <rect x="38" y="52" width="104" height="66" rx="1.5" fill={glass} stroke={rail} strokeWidth="2.5" />
      <line x1="90" y1="53" x2="90" y2="117" stroke={rail} strokeWidth="2.5" />
      <line x1="39" y1="85" x2="141" y2="85" stroke={rail} strokeWidth="2" />
      <line x1="22" y1="131" x2="158" y2="131" stroke={rail} strokeWidth="3" />
      <DimensionLine x1={22} y1={42} x2={22} y2={128} label="alto" />
      <DimensionLine x1={28} y1={143} x2={152} y2={143} label="ancho" />
    </svg>
  )
}

function ScreenSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de screen">
      <defs>
        <pattern id="technical-screen-mesh" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M 7 0 L 0 0 0 7" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect x="50" y="18" width="80" height="140" rx="2" fill="#ffffff" stroke={frame} strokeWidth="4" />
      <rect x="60" y="29" width="60" height="118" rx="1.5" fill="url(#technical-screen-mesh)" stroke={rail} strokeWidth="2.5" />
      <line x1="61" y1="88" x2="119" y2="88" stroke={rail} strokeWidth="2" />
      <circle cx="113" cy="88" r="2.8" fill={frame} />
      <line x1="43" y1="160" x2="137" y2="160" stroke={rail} strokeWidth="3" />
      <DimensionLine x1={40} y1={18} x2={40} y2={158} label="alto" />
      <DimensionLine x1={50} y1={169} x2={130} y2={169} label="ancho" />
    </svg>
  )
}

function GarageSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de puerta de garaje">
      <rect x="22" y="50" width="136" height="78" rx="2" fill="#ffffff" stroke={frame} strokeWidth="4" />
      {[0, 1, 2].map((row) => (
        <line key={row} x1="24" y1={70 + row * 19} x2="156" y2={70 + row * 19} stroke={rail} strokeWidth="2" />
      ))}
      {[0, 1, 2].map((col) => (
        <line key={col} x1={56 + col * 34} y1="52" x2={56 + col * 34} y2="126" stroke={guide} strokeWidth="1.5" />
      ))}
      <line x1="18" y1="132" x2="162" y2="132" stroke={rail} strokeWidth="3" />
      <DimensionLine x1={16} y1={50} x2={16} y2={128} label="alto" />
      <DimensionLine x1={22} y1={146} x2={158} y2={146} label="ancho" />
    </svg>
  )
}

function ClosetSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de puerta de closet">
      <rect x="35" y="28" width="110" height="122" rx="2" fill="#ffffff" stroke={frame} strokeWidth="4" />
      <line x1="90" y1="30" x2="90" y2="148" stroke={rail} strokeWidth="3" />
      <rect x="48" y="43" width="29" height="88" rx="1.5" fill={fill} stroke={guide} strokeWidth="2" />
      <rect x="103" y="43" width="29" height="88" rx="1.5" fill={fill} stroke={guide} strokeWidth="2" />
      <circle cx="84" cy="88" r="2.8" fill={frame} />
      <circle cx="96" cy="88" r="2.8" fill={frame} />
      <DimensionLine x1={29} y1={28} x2={29} y2={150} label="alto" />
      <DimensionLine x1={35} y1={164} x2={145} y2={164} label="ancho" />
    </svg>
  )
}

function GlassSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de cristalería">
      <rect x="50" y="24" width="80" height="132" rx="2" fill={glass} stroke={accent} strokeWidth="3" />
      <line x1="62" y1="42" x2="118" y2="96" stroke="#a7f3d0" strokeWidth="2.5" />
      <line x1="62" y1="114" x2="98" y2="149" stroke="#a7f3d0" strokeWidth="2" />
      <DimensionLine x1={42} y1={24} x2={42} y2={156} label="alto" />
      <DimensionLine x1={50} y1={168} x2={130} y2={168} label="ancho" />
    </svg>
  )
}

function MaterialSvg() {
  return (
    <svg viewBox="0 0 180 180" className="h-full w-full" role="img" aria-label="Diagrama técnico de material">
      <rect x="26" y="108" width="128" height="14" rx="2" fill={fill} stroke={frame} strokeWidth="2.5" />
      <rect x="40" y="78" width="100" height="12" rx="2" fill="#ffffff" stroke={rail} strokeWidth="2.5" />
      <rect x="55" y="50" width="70" height="10" rx="2" fill="#ffffff" stroke={guide} strokeWidth="2" />
      <line x1="28" y1="138" x2="152" y2="138" stroke={guide} strokeWidth="2" strokeDasharray="4 5" />
      <text x="90" y="152" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">perfil / material</text>
    </svg>
  )
}

export function ProductVisual({ category, code, name, className, compact = false }: ProductVisualProps) {
  const kind = getProductVisualKind(category, code, name)
  const codeValue = (code ?? '').toUpperCase()
  const variant = codeValue.includes('012') || codeValue.includes('002') ? 'grid' : codeValue.includes('M') ? 'solid' : 'glass'

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', compact ? 'h-24' : 'h-40', className)}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:18px_18px] opacity-70" />
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
