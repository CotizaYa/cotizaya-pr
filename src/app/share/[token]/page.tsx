// ============================================================
// COTIZAYA PR — /share/[token]/page.tsx
// Página pública de cotización. 100% aislada del dashboard.
// Usa RPC SECURITY DEFINER para acceso público seguro.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ShareActions from './ShareActions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')

interface PageProps {
  params: Promise<{ token: string }>
}

function fmt(n: number | string | null | undefined) {
  return new Intl.NumberFormat('es-PR', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n ?? 0))
}

function fmtFecha(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-PR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Borrador',  color: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Enviada',   color: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Vista',     color: 'bg-purple-100 text-purple-700' },
  accepted: { label: 'Aprobada',  color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  cancelled:{ label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
  paid:     { label: 'Pagada',    color: 'bg-orange-100 text-orange-700' },
}

export const revalidate = 0 // No cache — siempre fresco

export default async function CotizacionPublicaPage({ params }: PageProps) {
  const { token } = await params

  // ── Usar RPC SECURITY DEFINER para acceso público seguro ──
  const { data: quote, error } = await supabase.rpc('get_public_quote', {
    p_token: token,
  })

  if (error || !quote || !quote.id) notFound()

  const contratista = quote.profile as any
  const cliente = quote.client as any
  const items = (quote.items ?? []) as any[]
  const statusInfo = STATUS_LABEL[quote.status] ?? STATUS_LABEL.sent
  const ivu_pct = Math.round(Number(quote.ivu_rate ?? 0.115) * 100)

  // WhatsApp
  const waMsg = encodeURIComponent(
    `Hola ${contratista?.business_name ?? 'CotizaYa'}, vi la cotización ${quote.quote_number} por ${fmt(quote.total)} y me interesa proceder.`
  )
  const waUrl = contratista?.phone
    ? `https://wa.me/1${contratista.phone.replace(/\D/g, '')}?text=${waMsg}`
    : null

  // Agrupar items por categoría
  const grouped: Record<string, any[]> = {}
  for (const item of items) {
    const cat = item.category_snapshot || 'General'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="bg-[#0F172A] px-6 pt-10 pb-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white font-black text-xl leading-tight tracking-tight">
              {contratista?.business_name ?? 'Screen PRO'}
            </p>
            {contratista?.phone && (
              <p className="text-gray-400 text-sm mt-1">
                {contratista.phone}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.15em] mb-1 font-semibold">
              Cotización
            </p>
            <p className="text-white font-black text-2xl tracking-tight">
              {quote.quote_number}
            </p>
            <span className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-xs">
          {quote.valid_until && (
            <span>Válida hasta {fmtFecha(quote.valid_until)}</span>
          )}
        </div>
      </div>

      {/* ── CLIENTE ────────────────────────────────────────── */}
      <div className="px-6 py-6 border-b border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-bold mb-2">
          Preparado para
        </p>
        {cliente?.full_name ? (
          <>
            <p className="font-black text-[#0F172A] text-lg">
              {cliente.full_name}
            </p>
            {cliente.phone && (
              <p className="text-sm text-gray-500 mt-1">{cliente.phone}</p>
            )}
            {cliente.address && (
              <p className="text-sm text-gray-500">{cliente.address}</p>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm italic">Cliente no especificado</p>
        )}
      </div>

      {/* ── ITEMS AGRUPADOS POR CATEGORÍA ──────────────────── */}
      <div className="px-6 py-6">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-6 last:mb-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-bold mb-3 border-b border-gray-100 pb-2">
              {category}
            </p>
            <div className="space-y-3">
              {catItems.map((item: any, idx: number) => {
                const esPie2 = item.price_type_snapshot === 'por_pie_cuadrado'
                const esPie = item.price_type_snapshot === 'por_pie_lineal'
                const pie2 = esPie2 && item.width_inches && item.height_inches
                  ? (Number(item.width_inches) * Number(item.height_inches) / 144).toFixed(2)
                  : null

                return (
                  <div key={item.id || idx} className="flex justify-between items-start gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0F172A] text-[15px] leading-snug">
                        {item.name_snapshot}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {esPie2 && item.width_inches && item.height_inches && (
                          <span className="text-xs text-gray-400">
                            {Math.round(Number(item.width_inches))}&quot; × {Math.round(Number(item.height_inches))}&quot;
                            {pie2 && ` · ${pie2} pie²`}
                          </span>
                        )}
                        {esPie && item.width_inches && (
                          <span className="text-xs text-gray-400">
                            {item.width_inches} pies
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Cant: {item.quantity}
                        </span>
                        {item.metadata?.color && (
                          <span className="text-xs text-gray-400">
                            Color: {item.metadata.color}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmt(item.unit_price_snapshot)}
                        {esPie2 ? ' / pie²' : esPie ? ' / pie' : ' / und'}
                      </p>
                    </div>
                    <p className="font-black text-[#0F172A] text-[15px] tabular-nums whitespace-nowrap">
                      {fmt(item.line_total)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── TOTALES ────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <div className="bg-[#0F172A] rounded-2xl px-6 py-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Materiales</span>
            <span className="tabular-nums font-medium">{fmt(quote.subtotal_materials)}</span>
          </div>
          {Number(quote.subtotal_labor) > 0 && (
            <div className="flex justify-between text-sm text-gray-300">
              <span>Mano de obra</span>
              <span className="tabular-nums font-medium">{fmt(quote.subtotal_labor)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-300 border-t border-white/10 pt-3">
            <span>IVU ({ivu_pct}%)</span>
            <span className="tabular-nums font-medium">{fmt(quote.ivu_amount)}</span>
          </div>

          {/* TOTAL */}
          <div className="flex justify-between items-baseline border-t border-white/20 pt-4">
            <span className="text-white font-black text-xl">TOTAL</span>
            <span className="text-[#F97316] font-black text-4xl tabular-nums">
              {fmt(quote.total)}
            </span>
          </div>

          {Number(quote.deposit_amount) > 0 && (
            <div className="flex justify-between text-sm text-gray-400 border-t border-white/10 pt-3">
              <span>Depósito requerido (50%)</span>
              <span className="tabular-nums font-bold text-white">
                {fmt(quote.deposit_amount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── NOTA ───────────────────────────────────────────── */}
      {quote.notes && (
        <div className="px-6 pb-6">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-[0.15em] mb-1">
              Nota del contratista
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">{quote.notes}</p>
          </div>
        </div>
      )}

      {/* ── ACCIONES (Client Component) ────────────────────── */}
      <ShareActions waUrl={waUrl} token={token} />

      {/* ── PIE ────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Cotización generada con{' '}
          <span className="font-bold text-[#F97316]">CotizaYa PR</span>
        </p>
        <p className="text-[10px] text-gray-300 mt-1">
          Precios incluyen IVU {ivu_pct}% · Sujeto a inspección final
        </p>
      </div>
    </div>
  )
}
