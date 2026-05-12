/**
 * DoorWindowPreview — Preview 2D a escala del producto
 * El FACTOR "WOW" que reemplaza al AR de Luminio.
 *
 * Genera un SVG proporcional en tiempo real según las medidas
 * del contratista. El cliente ve EXACTAMENTE lo que está comprando.
 * Funciona offline, sin cámara, sin permisos especiales.
 *
 * Uso:
 *   <DoorWindowPreview code="S001" widthIn={36} heightIn={80} color="negro" />
 */

'use client'

import { useMemo } from 'react'

interface DoorWindowPreviewProps {
  code: string | null
  category: string
  widthIn: number    // pulgadas reales
  heightIn: number   // pulgadas reales
  color?: string
  showDimensions?: boolean
  className?: string
}

const COLOR_MAP: Record<string, { frame: string; glass: string; label: string }> = {
  negro:     { frame: '#1a1a1a', glass: '#c8dde6',  label: 'Negro' },
  blanco:    { frame: '#e8e8e8', glass: '#daedf7',  label: 'Blanco' },
  bronce:    { frame: '#7C5C3A', glass: '#c8d5c0',  label: 'Bronce' },
  beige:     { frame: '#d4c4a0', glass: '#daedf7',  label: 'Beige' },
  champagne: { frame: '#c8a96e', glass: '#daedf7',  label: 'Champagne' },
}

// Determina el tipo de renderizado según código/categoría
function getPreviewType(code: string | null, category: string): string {
  if (!code) return category
  const c = code.toUpperCase()
  if (c.startsWith('S0') && !['S004','S005','S006','S007','S008','S009'].includes(c)) return 'screen'
  if (c.startsWith('P')) return 'puerta'
  if (c.startsWith('V')) return 'ventana'
  if (c.startsWith('C')) return 'closet'
  return category
}

// Convierte pulgadas a texto de fracción legible
function toFraction(inches: number): string {
  if (inches <= 0) return '—'
  const w = Math.floor(inches)
  const f = inches - w
  const fracs: [number, string][] = [[7/8,'⅞'],[3/4,'¾'],[5/8,'⅝'],[1/2,'½'],[3/8,'⅜'],[1/4,'¼'],[1/8,'⅛']]
  for (const [v, s] of fracs) {
    if (Math.abs(f - v) < 0.01) return w > 0 ? `${w} ${s}"` : `${s}"`
  }
  return `${w}"`
}

export function DoorWindowPreview({
  code,
  category,
  widthIn,
  heightIn,
  color = 'negro',
  showDimensions = true,
  className = '',
}: DoorWindowPreviewProps) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.negro
  const type = getPreviewType(code, category)

  // Calcular proporciones para el SVG
  // Viewport: 280 x 320 (siempre fijo para mobile)
  const VP_W = 280
  const VP_H = 320
  const MARGIN = 36  // espacio para dimensiones
  const MAX_W = VP_W - MARGIN * 2
  const MAX_H = VP_H - MARGIN * 2

  const { svgW, svgH, scale } = useMemo(() => {
    if (!widthIn || !heightIn) return { svgW: MAX_W * 0.6, svgH: MAX_H * 0.6, scale: 1 }
    const ratio = widthIn / heightIn
    let w = MAX_W
    let h = w / ratio
    if (h > MAX_H) { h = MAX_H; w = h * ratio }
    return { svgW: Math.round(w), svgH: Math.round(h), scale: w / widthIn }
  }, [widthIn, heightIn, MAX_W, MAX_H])

  const x0 = Math.round((VP_W - svgW) / 2)
  const y0 = Math.round((VP_H - svgH) / 2)
  const fw = 6  // frame width in SVG units

  // Pies cuadrados
  const sqft = widthIn && heightIn ? ((widthIn * heightIn) / 144).toFixed(2) : null

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Preview SVG */}
      <div className="relative bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl overflow-hidden border border-gray-200 shadow-inner w-full">
        <svg
          viewBox={`0 0 ${VP_W} ${VP_H}`}
          width="100%"
          style={{ display: 'block', maxHeight: '340px' }}
          aria-label={`Preview: ${widthIn}" × ${heightIn}"`}
        >
          {/* Grid de fondo (efecto plano de trabajo) */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dde5ed" strokeWidth="0.5"/>
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#00000022"/>
            </filter>
          </defs>
          <rect width={VP_W} height={VP_H} fill="url(#grid)"/>

          {/* Render según tipo de producto */}
          {type === 'screen' && (
            <ScreenRender x={x0} y={y0} w={svgW} h={svgH} fw={fw} colors={colors} code={code} />
          )}
          {type === 'ventana' && (
            <VentanaRender x={x0} y={y0} w={svgW} h={svgH} fw={fw} colors={colors} code={code} />
          )}
          {type === 'puerta' && (
            <PuertaRender x={x0} y={y0} w={svgW} h={svgH} fw={fw} colors={colors} code={code} />
          )}
          {type === 'closet' && (
            <ClosetRender x={x0} y={y0} w={svgW} h={svgH} fw={fw} colors={colors} />
          )}

          {/* Cotas de medidas */}
          {showDimensions && widthIn > 0 && heightIn > 0 && (
            <DimensionLines
              x={x0} y={y0} w={svgW} h={svgH}
              widthLabel={toFraction(widthIn)}
              heightLabel={toFraction(heightIn)}
            />
          )}
        </svg>

        {/* Badge de pie² */}
        {sqft && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider leading-none">pie²</p>
            <p className="text-sm font-black text-gray-900 leading-none">{sqft}</p>
          </div>
        )}

        {/* Badge de código */}
        {code && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 rounded-lg shadow-sm">
            <p className="text-[10px] font-black text-white tracking-wider">{code}</p>
          </div>
        )}
      </div>

      {/* Dimensiones resumidas */}
      {showDimensions && widthIn > 0 && heightIn > 0 && (
        <div className="flex gap-3 mt-2.5 w-full">
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 px-3 py-2 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ancho</p>
            <p className="text-base font-black text-gray-900">{toFraction(widthIn)}</p>
          </div>
          <div className="w-6 flex items-center justify-center text-gray-300 font-black">×</div>
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 px-3 py-2 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Alto</p>
            <p className="text-base font-black text-gray-900">{toFraction(heightIn)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-renders por tipo de producto ────────────────────────────────────────

interface RenderProps {
  x: number; y: number; w: number; h: number; fw: number
  colors: { frame: string; glass: string; label: string }
  code?: string | null
}

function ScreenRender({ x, y, w, h, fw, colors, code }: RenderProps) {
  // Determinar si es sencilla (1 hoja) o doble (2 hojas) basado en el código
  const isDouble = code && ['S002','S003','S005','S008','S010','S011','S012'].includes(code.toUpperCase())
  return (
    <g filter="url(#shadow)">
      {/* Marco exterior */}
      <rect x={x} y={y} width={w} height={h} rx={3} fill={colors.frame}/>
      {/* Panel interior */}
      {isDouble ? (
        <>
          {/* Puerta izquierda */}
          <rect x={x+fw} y={y+fw} width={w/2-fw-1} height={h-fw*2} fill={colors.glass} opacity={0.8}/>
          {/* Malla screen en izquierda */}
          <ScreenMesh x={x+fw+4} y={y+fw+4} w={w/2-fw-9} h={h-fw*2-8}/>
          {/* Puerta derecha */}
          <rect x={x+w/2+1} y={y+fw} width={w/2-fw-1} height={h-fw*2} fill={colors.glass} opacity={0.7}/>
          {/* Malla screen en derecha */}
          <ScreenMesh x={x+w/2+5} y={y+fw+4} w={w/2-fw-9} h={h-fw*2-8}/>
          {/* División central */}
          <rect x={x+w/2-1} y={y} width={3} height={h} fill={colors.frame}/>
          {/* Manija izquierda */}
          <circle cx={x+w/2-8} cy={y+h/2} r={3} fill={colors.frame} opacity={0.8}/>
          {/* Manija derecha */}
          <circle cx={x+w/2+8} cy={y+h/2} r={3} fill={colors.frame} opacity={0.8}/>
        </>
      ) : (
        <>
          <rect x={x+fw} y={y+fw} width={w-fw*2} height={h-fw*2} fill={colors.glass} opacity={0.8}/>
          <ScreenMesh x={x+fw+4} y={y+fw+4} w={w-fw*2-8} h={h-fw*2-8}/>
          <circle cx={x+w-fw*2} cy={y+h/2} r={3} fill={colors.frame} opacity={0.8}/>
        </>
      )}
    </g>
  )
}

function ScreenMesh({ x, y, w, h }: { x:number; y:number; w:number; h:number }) {
  const lines = []
  for (let i = 0; i < w; i += 6) {
    lines.push(<line key={`v${i}`} x1={x+i} y1={y} x2={x+i} y2={y+h} stroke="#aac8d8" strokeWidth={0.4}/>)
  }
  for (let i = 0; i < h; i += 6) {
    lines.push(<line key={`h${i}`} x1={x} y1={y+i} x2={x+w} y2={y+i} stroke="#aac8d8" strokeWidth={0.4}/>)
  }
  return <g>{lines}</g>
}

function VentanaRender({ x, y, w, h, fw, colors, code }: RenderProps) {
  const isSliding = code && ['V002','V004','V006'].some(c => code.toUpperCase().includes(c.slice(1)))
  return (
    <g filter="url(#shadow)">
      {/* Marco */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill={colors.frame}/>
      {isSliding ? (
        <>
          {/* Ventana corrediza — 2 paneles */}
          <rect x={x+fw} y={y+fw} width={w/2-fw-1} height={h-fw*2} fill={colors.glass} opacity={0.85}/>
          <rect x={x+w/2+1} y={y+fw} width={w/2-fw-1} height={h-fw*2} fill={colors.glass} opacity={0.7}/>
          <rect x={x+w/2-1} y={y} width={2} height={h} fill={colors.frame}/>
          {/* Reflejo de vidrio */}
          <rect x={x+fw+3} y={y+fw+3} width={12} height={h-fw*2-6} fill="white" opacity={0.15} rx={1}/>
          <rect x={x+w/2+4} y={y+fw+3} width={12} height={h-fw*2-6} fill="white" opacity={0.1} rx={1}/>
        </>
      ) : (
        <>
          {/* Ventana fija o proyectante */}
          <rect x={x+fw} y={y+fw} width={w-fw*2} height={h-fw*2} fill={colors.glass} opacity={0.85}/>
          {/* Reflejo */}
          <rect x={x+fw+3} y={y+fw+3} width={16} height={h-fw*2-6} fill="white" opacity={0.15} rx={1}/>
          {/* Manija */}
          <rect x={x+w/2-1} y={y+h-fw*4} width={3} height={fw*2} rx={1} fill={colors.frame} opacity={0.7}/>
        </>
      )}
    </g>
  )
}

function PuertaRender({ x, y, w, h, fw, colors, code }: RenderProps) {
  const hasGlass = code && code.toUpperCase().includes('V')
  const isDouble = w > 120
  return (
    <g filter="url(#shadow)">
      {/* Marco */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill={colors.frame}/>
      {isDouble ? (
        <>
          <rect x={x+fw} y={y+fw} width={w/2-fw-1} height={h-fw*2} fill={colors.glass} opacity={0.6}/>
          <rect x={x+w/2+1} y={y+fw} width={w/2-fw-1} height={h-fw*2} fill={colors.glass} opacity={0.6}/>
          <rect x={x+w/2-1} y={y} width={2} height={h} fill={colors.frame}/>
          {hasGlass && <>
            <rect x={x+fw+4} y={y+h*0.15} width={w/2-fw*2-4} height={h*0.35} fill="#c8dde6" opacity={0.8} rx={2}/>
            <rect x={x+w/2+4} y={y+h*0.15} width={w/2-fw*2-4} height={h*0.35} fill="#c8dde6" opacity={0.8} rx={2}/>
          </>}
          <circle cx={x+w/2-8} cy={y+h*0.55} r={4} fill={colors.frame} opacity={0.9}/>
          <circle cx={x+w/2+8} cy={y+h*0.55} r={4} fill={colors.frame} opacity={0.9}/>
        </>
      ) : (
        <>
          <rect x={x+fw} y={y+fw} width={w-fw*2} height={h-fw*2} fill={colors.glass} opacity={0.6}/>
          {hasGlass && (
            <rect x={x+fw+6} y={y+h*0.1} width={w-fw*2-12} height={h*0.4} fill="#c8dde6" opacity={0.8} rx={2}/>
          )}
          <circle cx={x+w-fw*3} cy={y+h*0.5} r={4} fill={colors.frame} opacity={0.9}/>
          {/* Bisagras */}
          <rect x={x+fw} y={y+h*0.15} width={fw} height={fw*1.5} fill="#888" rx={1}/>
          <rect x={x+fw} y={y+h*0.7}  width={fw} height={fw*1.5} fill="#888" rx={1}/>
        </>
      )}
    </g>
  )
}

function ClosetRender({ x, y, w, h, fw, colors }: Omit<RenderProps,'code'>) {
  const panels = w > 150 ? 3 : 2
  const panelW = (w - fw * (panels + 1)) / panels
  return (
    <g filter="url(#shadow)">
      {/* Marco exterior */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill={colors.frame}/>
      {/* Paneles */}
      {Array.from({ length: panels }).map((_, i) => (
        <g key={i}>
          <rect
            x={x + fw + i * (panelW + fw)}
            y={y + fw}
            width={panelW}
            height={h - fw * 2}
            fill={colors.glass}
            opacity={0.7}
          />
          {/* Jala */}
          <rect
            x={x + fw + i*(panelW+fw) + panelW/2 - 1}
            y={y + h * 0.4}
            width={2.5}
            height={h * 0.2}
            rx={1}
            fill={colors.frame}
            opacity={0.8}
          />
        </g>
      ))}
    </g>
  )
}

function DimensionLines({
  x, y, w, h, widthLabel, heightLabel
}: { x:number; y:number; w:number; h:number; widthLabel:string; heightLabel:string }) {
  const aw = 5  // arrow size
  const gap = 8

  return (
    <g fill="none" stroke="#f97316" strokeWidth={1}>
      {/* Cota de ancho — abajo */}
      <line x1={x} y1={y+h+gap} x2={x+w} y2={y+h+gap}/>
      <line x1={x} y1={y+h+gap-aw} x2={x} y2={y+h+gap+aw}/>
      <line x1={x+w} y1={y+h+gap-aw} x2={x+w} y2={y+h+gap+aw}/>
      <text x={x+w/2} y={y+h+gap+14} textAnchor="middle" fill="#f97316" fontSize={9}
        fontWeight="bold" stroke="none">{widthLabel}</text>

      {/* Cota de alto — izquierda */}
      <line x1={x-gap} y1={y} x2={x-gap} y2={y+h}/>
      <line x1={x-gap-aw} y1={y} x2={x-gap+aw} y2={y}/>
      <line x1={x-gap-aw} y1={y+h} x2={x-gap+aw} y2={y+h}/>
      <text x={x-gap-6} y={y+h/2} textAnchor="middle" fill="#f97316" fontSize={9}
        fontWeight="bold" stroke="none" transform={`rotate(-90, ${x-gap-6}, ${y+h/2})`}>
        {heightLabel}
      </text>
    </g>
  )
}
