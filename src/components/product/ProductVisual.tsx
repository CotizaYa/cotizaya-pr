'use client'

const C = {
  bg:       '#dce8f0',
  panel:    '#8fb5cc',
  panelLt:  '#a8cce0',
  panelDk:  '#6a96b0',
  frame:    '#ffffff',
  frameStr: '#c8dae4',
  glass:    '#cde4ef',
  glassLt:  '#dff0f8',
  handle:   '#4a7a94',
  meshLine: '#7a9fb5',
  floor:    '#b8cdd8',
}

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

function Floor({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <rect x={x1} y={y} width={x2 - x1} height={7} rx="2" fill={C.floor} />
}
function Sill({ y, x1, x2 }: { y: number; x1: number; x2: number }) {
  return <rect x={x1} y={y} width={x2 - x1} height={7} rx="2" fill={C.floor} />
}
function Handle({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="4" fill={C.handle} />
      <rect x={cx - 2} y={cy + 4} width="4" height="14" rx="2" fill={C.handle} />
    </>
  )
}

// ── Doors ─────────────────────────────────────────────────────────────────────
function SingleDoorGlass() {
  return (
    <svg viewBox="0 0 200 280" className="w-full h-full">
      <rect width="200" height="280" fill={C.bg} rx="4" />
      <rect x="42" y="18" width="116" height="242" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="50" y="26" width="100" height="226" rx="2" fill={C.panel} />
      <rect x="50" y="26" width="9" height="226" rx="2" fill={C.panelDk} opacity="0.35" />
      <rect x="63" y="42" width="74" height="88" rx="2" fill={C.glass} />
      <rect x="63" y="42" width="74" height="3" fill={C.frame} opacity="0.7" />
      <rect x="63" y="127" width="74" height="3" fill={C.frame} opacity="0.7" />
      <rect x="99" y="42" width="3" height="88" fill={C.frame} opacity="0.7" />
      <rect x="66" y="46" width="28" height="82" rx="1" fill={C.glassLt} opacity="0.45" />
      <rect x="63" y="143" width="74" height="90" rx="2" fill={C.panelDk} opacity="0.2" />
      <Handle cx={134} cy={166} />
      <Floor x1={28} x2={172} y={262} />
    </svg>
  )
}

function DoubleDoorGlass() {
  return (
    <svg viewBox="0 0 220 280" className="w-full h-full">
      <rect width="220" height="280" fill={C.bg} rx="4" />
      <rect x="18" y="18" width="184" height="242" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="26" y="26" width="82" height="226" rx="2" fill={C.panel} />
      <rect x="26" y="26" width="8" height="226" fill={C.panelDk} opacity="0.3" />
      <rect x="112" y="26" width="82" height="226" rx="2" fill={C.panel} />
      <rect x="112" y="26" width="8" height="226" fill={C.panelDk} opacity="0.3" />
      <rect x="104" y="18" width="12" height="242" fill={C.frame} />
      <rect x="38" y="44" width="58" height="80" rx="2" fill={C.glass} />
      <rect x="38" y="44" width="22" height="80" rx="1" fill={C.glassLt} opacity="0.4" />
      <rect x="124" y="44" width="58" height="80" rx="2" fill={C.glass} />
      <rect x="124" y="44" width="22" height="80" rx="1" fill={C.glassLt} opacity="0.4" />
      <rect x="38" y="138" width="58" height="96" rx="2" fill={C.panelDk} opacity="0.18" />
      <rect x="124" y="138" width="58" height="96" rx="2" fill={C.panelDk} opacity="0.18" />
      <Handle cx={97} cy={168} />
      <Handle cx={122} cy={168} />
      <Floor x1={8} x2={212} y={262} />
    </svg>
  )
}

function PivotDoor() {
  return (
    <svg viewBox="0 0 200 280" className="w-full h-full">
      <rect width="200" height="280" fill={C.bg} rx="4" />
      <rect x="28" y="18" width="144" height="242" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="36" y="26" width="128" height="226" rx="2" fill={C.panel} />
      <rect x="36" y="26" width="10" height="226" fill={C.panelDk} opacity="0.3" />
      <rect x="50" y="44" width="100" height="160" rx="2" fill={C.glass} />
      <rect x="50" y="44" width="36" height="160" rx="1" fill={C.glassLt} opacity="0.38" />
      <rect x="36" y="148" width="128" height="5" fill={C.frame} opacity="0.5" />
      <rect x="95" y="150" width="10" height="36" rx="3" fill={C.handle} />
      <rect x="91" y="162" width="18" height="6" rx="2" fill={C.handle} />
      <Floor x1={18} x2={182} y={262} />
    </svg>
  )
}

// ── Screens ───────────────────────────────────────────────────────────────────
function ScreenDoor({ double = false }: { double?: boolean }) {
  const id = double ? 'sdm' : 'ssm'
  return (
    <svg viewBox="0 0 200 280" className="w-full h-full">
      <defs>
        <pattern id={id} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0L0 0 0 5" fill="none" stroke={C.meshLine} strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="200" height="280" fill={C.bg} rx="4" />
      {double ? (
        <>
          <rect x="18" y="18" width="164" height="242" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
          <rect x="26" y="26" width="74" height="226" rx="2" fill={`url(#${id})`} stroke={C.frameStr} strokeWidth="2" />
          <rect x="100" y="26" width="74" height="226" rx="2" fill={`url(#${id})`} stroke={C.frameStr} strokeWidth="2" />
          <rect x="96" y="18" width="8" height="242" fill={C.frame} />
          <rect x="26" y="134" width="74" height="6" fill={C.frame} />
          <rect x="100" y="134" width="74" height="6" fill={C.frame} />
          <Handle cx={88} cy={148} />
          <Handle cx={112} cy={148} />
        </>
      ) : (
        <>
          <rect x="40" y="18" width="120" height="242" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
          <rect x="48" y="26" width="104" height="226" rx="2" fill={`url(#${id})`} stroke={C.frameStr} strokeWidth="2" />
          <rect x="48" y="134" width="104" height="6" fill={C.frame} />
          <Handle cx={136} cy={148} />
        </>
      )}
      <Floor x1={28} x2={172} y={262} />
    </svg>
  )
}

function ScreenWindow() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <defs>
        <pattern id="swm" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0L0 0 0 5" fill="none" stroke={C.meshLine} strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="240" height="180" fill={C.bg} rx="4" />
      <rect x="18" y="20" width="204" height="120" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="26" y="28" width="188" height="104" rx="2" fill="url(#swm)" stroke={C.frameStr} strokeWidth="2" />
      <rect x="116" y="20" width="8" height="120" fill={C.frame} />
      <Handle cx={108} cy={84} />
      <Handle cx={124} cy={84} />
      <Sill y={140} x1={8} x2={232} />
    </svg>
  )
}

// ── Windows ───────────────────────────────────────────────────────────────────
function WindowSliding() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <rect width="240" height="180" fill={C.bg} rx="4" />
      <rect x="14" y="20" width="212" height="124" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="22" y="28" width="96" height="108" rx="2" fill={C.panel} />
      <rect x="22" y="28" width="8" height="108" fill={C.panelDk} opacity="0.3" />
      <rect x="30" y="36" width="80" height="92" rx="1" fill={C.glass} />
      <rect x="30" y="36" width="28" height="92" rx="1" fill={C.glassLt} opacity="0.42" />
      <rect x="118" y="28" width="100" height="108" rx="2" fill={C.panel} opacity="0.85" />
      <rect x="118" y="28" width="8" height="108" fill={C.panelDk} opacity="0.3" />
      <rect x="126" y="36" width="84" height="92" rx="1" fill={C.glass} opacity="0.7" />
      <rect x="110" y="28" width="16" height="108" fill={C.frameStr} opacity="0.4" />
      <Handle cx={108} cy={88} />
      <Handle cx={120} cy={88} />
      <Sill y={144} x1={4} x2={236} />
    </svg>
  )
}

function WindowCasement() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full">
      <rect width="200" height="180" fill={C.bg} rx="4" />
      <rect x="22" y="20" width="156" height="124" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="30" y="28" width="140" height="108" rx="2" fill={C.panel} />
      <rect x="30" y="28" width="10" height="108" fill={C.panelDk} opacity="0.3" />
      <rect x="40" y="38" width="122" height="88" rx="1" fill={C.glass} />
      <rect x="40" y="38" width="42" height="88" rx="1" fill={C.glassLt} opacity="0.42" />
      <line x1="30" y1="136" x2="88" y2="98" stroke={C.frameStr} strokeWidth="2" strokeDasharray="5 4" opacity="0.7" />
      <Handle cx={152} cy={88} />
      <Sill y={144} x1={12} x2={188} />
    </svg>
  )
}

function WindowProjecting() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full">
      <rect width="240" height="180" fill={C.bg} rx="4" />
      <rect x="14" y="20" width="212" height="124" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="22" y="28" width="96" height="108" rx="2" fill={C.panel} />
      <rect x="22" y="28" width="8" height="108" fill={C.panelDk} opacity="0.3" />
      <rect x="30" y="36" width="80" height="92" rx="1" fill={C.glass} />
      <rect x="30" y="36" width="26" height="92" fill={C.glassLt} opacity="0.42" />
      <rect x="122" y="28" width="96" height="108" rx="2" fill={C.panel} />
      <rect x="122" y="28" width="8" height="108" fill={C.panelDk} opacity="0.3" />
      <rect x="130" y="36" width="80" height="92" rx="1" fill={C.glass} />
      <rect x="130" y="36" width="26" height="92" fill={C.glassLt} opacity="0.42" />
      <line x1="22" y1="136" x2="58" y2="100" stroke={C.frameStr} strokeWidth="2" strokeDasharray="5 4" opacity="0.6" />
      <line x1="218" y1="136" x2="182" y2="100" stroke={C.frameStr} strokeWidth="2" strokeDasharray="5 4" opacity="0.6" />
      <Sill y={144} x1={4} x2={236} />
    </svg>
  )
}

function WindowFixed() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full">
      <rect width="200" height="180" fill={C.bg} rx="4" />
      <rect x="22" y="20" width="156" height="124" rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="30" y="28" width="140" height="108" rx="2" fill={C.glass} />
      <rect x="30" y="28" width="46" height="108" rx="2" fill={C.glassLt} opacity="0.5" />
      <line x1="30" y1="28" x2="170" y2="136" stroke={C.frameStr} strokeWidth="1.5" opacity="0.22" />
      <line x1="170" y1="28" x2="30" y2="136" stroke={C.frameStr} strokeWidth="1.5" opacity="0.22" />
      <Sill y={144} x1={12} x2={188} />
    </svg>
  )
}

// ── Closets ───────────────────────────────────────────────────────────────────
function ClosetDoor({ panels }: { panels: 2 | 3 | 4 }) {
  const fw = 200, fh = 260, fx = 14, fy = 18
  const totalW = fw - fx * 2
  const pw = totalW / panels

  return (
    <svg viewBox={`0 0 ${fw} ${fh}`} className="w-full h-full">
      <rect width={fw} height={fh} fill={C.bg} rx="4" />
      <rect x={fx} y={fy} width={totalW} height={222} rx="3" fill={C.frame} stroke={C.frameStr} strokeWidth="2.5" />
      {Array.from({ length: panels }).map((_, i) => (
        <g key={i}>
          <rect x={fx + 6 + i * pw} y={fy + 8} width={pw - 6} height={206} rx="1" fill={i % 2 === 0 ? C.panel : C.panelLt} />
          <rect x={fx + 6 + i * pw} y={fy + 8} width={7} height={206} fill={C.panelDk} opacity="0.25" />
          <rect x={fx + 16 + i * pw} y={fy + 20} width={pw - 26} height={182} rx="1" fill={C.glass} opacity="0.55" />
          <rect x={fx + 16 + i * pw} y={fy + 20} width={(pw - 26) * 0.35} height={182} fill={C.glassLt} opacity="0.4" />
        </g>
      ))}
      {Array.from({ length: panels - 1 }).map((_, i) => (
        <rect key={i} x={fx + (i + 1) * pw} y={fy} width="6" height={222} fill={C.frame} />
      ))}
      {panels === 2 && <><circle cx={fx + pw - 5} cy={fy + 116} r="4.5" fill={C.handle} /><circle cx={fx + pw + 11} cy={fy + 116} r="4.5" fill={C.handle} /></>}
      {panels === 3 && <><circle cx={fx + pw - 5} cy={fy + 116} r="4.5" fill={C.handle} /><circle cx={fx + pw + 11} cy={fy + 116} r="4.5" fill={C.handle} /></>}
      {panels === 4 && <><circle cx={fx + pw - 5} cy={fy + 116} r="4" fill={C.handle} /><circle cx={fx + pw + 9} cy={fy + 116} r="4" fill={C.handle} /><circle cx={fx + 3 * pw - 5} cy={fy + 116} r="4" fill={C.handle} /><circle cx={fx + 3 * pw + 9} cy={fy + 116} r="4" fill={C.handle} /></>}
      <Floor x1={4} x2={fw - 4} y={242} />
    </svg>
  )
}

// ── Materials / Glass ─────────────────────────────────────────────────────────
function MallaRender() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill={C.bg} rx="4" />
      <defs>
        <pattern id="malla-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M 12 0 L 0 0 0 12" fill="none" stroke={C.meshLine} strokeWidth="1.2" />
          <path d="M 12 0 L 12 12" fill="none" stroke={C.meshLine} strokeWidth="1.2" />
          <path d="M 0 12 L 12 12" fill="none" stroke={C.meshLine} strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect x="22" y="22" width="156" height="156" rx="4" fill={C.frame} stroke={C.frameStr} strokeWidth="3" />
      <rect x="30" y="30" width="140" height="140" rx="2" fill={`url(#malla-grid)`} />
      <rect x="22" y="22" width="156" height="8" rx="4" fill={C.panelDk} opacity="0.15" />
      <rect x="22" y="22" width="8" height="156" fill={C.panelDk} opacity="0.1" />
      <text x="100" y="192" textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a7a94" fontFamily="system-ui">MALLA</text>
    </svg>
  )
}

function TornilleriaRender() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill={C.bg} rx="4" />
      {/* Bolt head */}
      <polygon points="100,30 128,46 128,78 100,94 72,78 72,46" fill={C.panel} stroke={C.frameStr} strokeWidth="2.5" />
      <polygon points="100,44 118,54 118,74 100,84 82,74 82,54" fill={C.panelLt} />
      {/* Shaft */}
      <rect x="90" y="90" width="20" height="65" rx="2" fill={C.panel} stroke={C.frameStr} strokeWidth="2" />
      {/* Thread lines */}
      {[100,110,120,130,140,150].map(y => (
        <line key={y} x1="88" y1={y} x2="112" y2={y} stroke={C.panelDk} strokeWidth="1.5" opacity="0.5" />
      ))}
      {/* Point */}
      <polygon points="90,155 110,155 100,172" fill={C.panelDk} />
      <text x="100" y="192" textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a7a94" fontFamily="system-ui">TORNILLO</text>
    </svg>
  )
}

function ServicioRender() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <rect width="200" height="200" fill={C.bg} rx="4" />
      {/* Wrench body */}
      <ellipse cx="76" cy="58" rx="26" ry="22" fill="none" stroke={C.panel} strokeWidth="9" />
      <ellipse cx="76" cy="58" rx="12" ry="10" fill={C.bg} />
      {/* Handle */}
      <rect x="90" y="68" width="16" height="80" rx="8" fill={C.panel} stroke={C.frameStr} strokeWidth="2"
        transform="rotate(40, 98, 108)" />
      {/* Small circle on wrench */}
      <circle cx="76" cy="58" r="6" fill={C.panelLt} stroke={C.frameStr} strokeWidth="2" />
      <text x="100" y="192" textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a7a94" fontFamily="system-ui">SERVICIO</text>
    </svg>
  )
}

function MaterialRender({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect width="200" height="160" fill={C.bg} rx="4" />
      <rect x="20" y="28" width="160" height="18" rx="3" fill={C.panel} />
      <rect x="20" y="28" width="160" height="5" rx="3" fill={C.panelLt} />
      <rect x="20" y="58" width="160" height="14" rx="3" fill={C.panel} opacity="0.8" />
      <rect x="20" y="58" width="160" height="4" rx="3" fill={C.panelLt} opacity="0.8" />
      <rect x="20" y="84" width="160" height="10" rx="3" fill={C.panel} opacity="0.6" />
      <rect x="20" y="106" width="160" height="8" rx="3" fill={C.panel} opacity="0.45" />
      <rect x="20" y="126" width="160" height="6" rx="3" fill={C.panel} opacity="0.3" />
      <text x="100" y="150" textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a7a94" fontFamily="system-ui">{label}</text>
    </svg>
  )
}

function GlassRender() {
  return (
    <svg viewBox="0 0 180 220" className="w-full h-full">
      <rect width="180" height="220" fill={C.bg} rx="4" />
      <rect x="30" y="20" width="120" height="170" rx="3" fill={C.glass} stroke={C.frameStr} strokeWidth="2.5" />
      <rect x="30" y="20" width="44" height="170" rx="3" fill={C.glassLt} opacity="0.55" />
      <line x1="44" y1="30" x2="80" y2="182" stroke={C.glassLt} strokeWidth="2" opacity="0.6" />
      <line x1="62" y1="30" x2="96" y2="172" stroke={C.glassLt} strokeWidth="1.5" opacity="0.4" />
      <text x="90" y="208" textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a7a94" fontFamily="system-ui">CRISTAL</text>
    </svg>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
export function renderByCode(code: string | null, category: string | null) {
  const c = (code ?? '').toUpperCase()
  const cat = (category ?? '').toLowerCase()

  // ── Screens ──
  if (c === 'S001') return <ScreenDoor double={false} />
  if (c === 'S002') return <ScreenDoor double={true} />
  if (c === 'S003') return <ScreenWindow />
  if (c === 'S010') return <ScreenDoor double={false} />   // Heavy Duty
  if (c === 'S011') return <ScreenDoor double={false} />   // Extra Ancha
  if (c === 'S012') return <ScreenDoor double={true} />    // Doble Extra Ancha
  if (c === 'S013') return <ScreenWindow />                // Ventana Doble
  if (c === 'S014') return <ScreenWindow />                // Corredizo 2P
  if (c === 'S015') return <ScreenWindow />                // Corredizo 3P
  if (c === 'S016') return <ScreenWindow />                // Proyectante
  if (c === 'S017') return <ScreenWindow />                // A/C
  if (c === 'S018') return <ScreenDoor double={true} />   // Patio Corrediza
  if (c === 'S019') return <ScreenDoor double={true} />   // Acordeón 3P
  if (c === 'S020') return <ScreenDoor double={false} />  // Paso Premium

  // ── Puertas ──
  if (c === 'P001') return <SingleDoorGlass />
  if (c === 'P002') return <DoubleDoorGlass />
  if (c === 'P003') return <PivotDoor />
  if (c === 'P004') return <SingleDoorGlass />    // Sólido
  if (c === 'P005') return <DoubleDoorGlass />    // Doble Sólido
  if (c === 'P006') return <DoubleDoorGlass />    // Panel Fijo Lateral
  if (c === 'P007') return <DoubleDoorGlass />    // 2 Paneles Fijos
  if (c === 'P008') return <SingleDoorGlass />    // Corrediza Sencilla
  if (c === 'P009') return <DoubleDoorGlass />    // Corrediza Doble
  if (c === 'P010') return <SingleDoorGlass />    // Ventana Superior
  if (c === 'P011') return <SingleDoorGlass />    // Celosías
  if (c === 'P012') return <DoubleDoorGlass />    // Acordeón 2P
  if (c === 'P013') return <DoubleDoorGlass />    // Acordeón 4P
  if (c === 'P014') return <SingleDoorGlass />    // Marco Pesado
  if (c === 'P015') return <DoubleDoorGlass />    // Doble Con Transomé

  // ── Ventanas ──
  if (c === 'V001') return <WindowProjecting />
  if (c === 'V002') return <WindowCasement />
  if (c === 'V003') return <WindowSliding />
  if (c === 'V004') return <WindowFixed />
  if (c === 'V005') return <WindowFixed />        // Celosías Fijas
  if (c === 'V006') return <WindowCasement />     // Celosías Abatibles
  if (c === 'V007') return <WindowSliding />      // 3 Paneles
  if (c === 'V008') return <WindowSliding />      // 4 Paneles
  if (c === 'V009') return <WindowCasement />     // Guillotina
  if (c === 'V010') return <WindowFixed />        // Jalousie
  if (c === 'V011') return <WindowCasement />     // Pivote
  if (c === 'V012') return <WindowFixed />        // Panorámica
  if (c === 'V013') return <WindowProjecting />   // Proyectante Pesado
  if (c === 'V014') return <WindowCasement />     // Batiente 1H
  if (c === 'V015') return <WindowProjecting />   // Batiente 2H

  // ── Closets ──
  if (c === 'C001') return <ClosetDoor panels={2} />
  if (c === 'C002') return <ClosetDoor panels={3} />
  if (c === 'C003') return <ClosetDoor panels={4} />
  if (c === 'C004') return <ClosetDoor panels={2} />   // Espejo 2H
  if (c === 'C005') return <ClosetDoor panels={3} />   // Espejo 3H
  if (c === 'C006') return <ClosetDoor panels={4} />   // Espejo 4H
  if (c === 'C007') return <ClosetDoor panels={2} />   // Opaco 2H
  if (c === 'C008') return <ClosetDoor panels={3} />   // Opaco 3H
  if (c === 'C009') return <ClosetDoor panels={2} />   // Estampado 2H
  if (c === 'C010') return <ClosetDoor panels={3} />   // Estampado 3H
  if (c === 'C011') return <ClosetDoor panels={2} />   // Marco Ancho 2H
  if (c === 'C012') return <ClosetDoor panels={2} />   // Esmerilado 2H
  if (c === 'C013') return <ClosetDoor panels={3} />   // Esmerilado 3H

  // ── Materials ──
  if (cat === 'cristal' || c.startsWith('CR')) return <GlassRender />
  // Malla — mesh pattern (not a profile)
  if (c === 'S004' || c === 'S005') return <MallaRender />
  // Aluminum profiles
  if (cat === 'aluminio' || c.startsWith('A')) return <MaterialRender label="PERFIL" />
  // Screen accessories (S006-S009)
  if (c.startsWith('S')) return <MaterialRender label="PERFIL" />
  // Fasteners — bolt
  if (cat === 'tornilleria' || c.startsWith('T')) return <TornilleriaRender />
  // Services / miscellaneous — wrench
  if (cat === 'miscelanea' || c.startsWith('M')) return <ServicioRender />

  // ── Category fallback ──
  if (cat === 'screen') return <ScreenDoor />
  if (cat === 'puerta') return <SingleDoorGlass />
  if (cat === 'ventana') return <WindowSliding />
  if (cat === 'closet') return <ClosetDoor panels={2} />

  return <MaterialRender label="PRODUCTO" />
}

// ── Export ────────────────────────────────────────────────────────────────────
interface ProductVisualProps {
  category?: string | null
  code?: string | null
  name?: string | null
  className?: string
  compact?: boolean
}

export function ProductVisual({ category, code, className, compact = false }: ProductVisualProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center',
      compact ? 'h-24 p-1' : 'h-44 p-2',
      className,
    )}>
      {renderByCode(code ?? null, category ?? null)}
    </div>
  )
}

export type { ProductVisualProps }
// This file is intentionally left here for append detection
