// ============================================================
// COTIZAYA PR — /share/[token]/page.tsx
// Página pública de cotización. 100% aislada del dashboard.
// Sin auth. Se ve como una factura profesional.
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

// Cliente público — solo anon key, sin cookies de sesión
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PageProps {
  params: Promise<{ token: string }>
}

function fmt(n: number | string) {
  return new Intl.NumberFormat('es-PR', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(n))
}

function fmtFecha(iso: string) {
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
  approved: { label: 'Aprobada',  color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  paid:     { label: 'Pagada',    color: 'bg-orange-100 text-orange-700' },
}

export default async function CotizacionPublicaPage({ params }: PageProps) {
  const { token } = await params

  // ── Cargar cotización ──────────────────────────────────────
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(`
      id, quote_number, status, public_token,
      subtotal_materials, subtotal_labor, ivu_amount, ivu_rate,
      total, deposit_amount, notes, valid_until, created_at,
      clients ( full_name, phone, address ),
      profiles ( business_name, phone, address, logo_url )
    `)
    .eq('public_token', token)
    .single()

  if (error || !quote) notFound()

  // ── Cargar items ───────────────────────────────────────────
  const { data: items } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quote.id)
    .order('position')

  const contratista = quote.profiles as any
  const cliente = quote.clients as any
  const statusInfo = STATUS_LABEL[quote.status] ?? STATUS_LABEL.sent
  const ivu_pct = Math.round(Number(quote.ivu_rate) * 100)

  // WhatsApp mensaje
  const waMsg = encodeURIComponent(
    `Hola ${contratista?.business_name ?? 'CotizaYa'}, vi la cotización ${quote.quote_number} por ${fmt(quote.total)} y me interesa proceder. 👍`
  )
  const waUrl = contratista?.phone
    ? `https://wa.me/1${contratista.phone.replace(/\D/g, '')}?text=${waMsg}`
    : null

  const shareUrl = typeof window === 'undefined'
    ? `https://cotizaya-pr.vercel.app/share/${token}`
    : window.location.href

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER NAVY ─────────────────────────────────────── */}
      <div className="bg-[#0F172A] px-5 pt-8 pb-6">
        {/* Logo / Empresa */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {contratista?.logo_url ? (
              <img
                src={contratista.logo_url}
                alt={contratista.business_name}
                className="h-10 object-contain mb-1"
              />
            ) : (
              <p className="text-white font-bold text-lg leading-tight">
                {contratista?.business_name ?? 'CotizaYa PR'}
              </p>
            )}
            {contratista?.phone && (
              <p className="text-gray-400 text-xs mt-0.5">
                📞 {contratista.phone}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Cotización
            </p>
            <p className="text-white font-bold text-xl">
              {quote.quote_number}
            </p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Fecha */}
        <p className="text-gray-400 text-xs">
          {fmtFecha(quote.created_at)}
          {quote.valid_until && (
            <> · Válida hasta {fmtFecha(quote.valid_until)}</>
          )}
        </p>
      </div>

      {/* ── CLIENTE ─────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Preparado para
        </p>
        {cliente?.full_name ? (
          <>
            <p className="font-bold text-[#0F172A] text-base">
              {cliente.full_name}
            </p>
            {cliente.phone && (
              <p className="text-sm text-gray-500 mt-0.5">📞 {cliente.phone}</p>
            )}
            {cliente.address && (
              <p className="text-sm text-gray-500">📍 {cliente.address}</p>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm italic">Cliente no especificado</p>
        )}
      </div>

      {/* ── ITEMS ───────────────────────────────────────────── */}
      <div className="px-5 py-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Detalle de productos
        </p>

        <div className="space-y-3">
          {(items ?? []).map((item: any) => {
            const esPie2 = item.price_type_snapshot === 'por_pie_cuadrado'
            const esPie = item.price_type_snapshot === 'por_pie_lineal'
            const pie2 = esPie2 && item.width_inches && item.height_inches
              ? (item.width_inches * item.height_inches / 144).toFixed(2)
              : null

            return (
              <div key={item.id}
                className="bg-gray-50 rounded-2xl px-4 py-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-[#0F172A] text-sm leading-snug">
                      {item.name_snapshot}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {esPie2 && item.width_inches && item.height_inches && (
                        <span className="text-xs text-gray-400">
                          {Math.round(item.width_inches)}" × {Math.round(item.height_inches)}"
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
                  <p className="font-bold text-[#0F172A] text-sm tabular-nums whitespace-nowrap">
                    {fmt(item.line_total)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TOTALES ─────────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <div className="bg-[#0F172A] rounded-2xl px-5 py-5 space-y-2.5">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Materiales</span>
            <span className="tabular-nums">{fmt(quote.subtotal_materials)}</span>
          </div>
          {Number(quote.subtotal_labor) > 0 && (
            <div className="flex justify-between text-sm text-gray-300">
              <span>Mano de obra</span>
              <span className="tabular-nums">{fmt(quote.subtotal_labor)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-300 border-t border-white/10 pt-2">
            <span>IVU ({ivu_pct}%)</span>
            <span className="tabular-nums">{fmt(quote.ivu_amount)}</span>
          </div>

          {/* TOTAL — grande y naranja */}
          <div className="flex justify-between items-baseline border-t border-white/20 pt-3">
            <span className="text-white font-bold text-lg">TOTAL</span>
            <span className="text-[#F97316] font-bold text-3xl tabular-nums">
              {fmt(quote.total)}
            </span>
          </div>

          {Number(quote.deposit_amount) > 0 && (
            <div className="flex justify-between text-sm text-gray-400 border-t border-white/10 pt-2">
              <span>Depósito requerido (50%)</span>
              <span className="tabular-nums font-semibold text-white">
                {fmt(quote.deposit_amount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── NOTA ────────────────────────────────────────────── */}
      {quote.notes && (
        <div className="px-5 pb-5">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-4">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
              Nota
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">{quote.notes}</p>
          </div>
        </div>
      )}

      {/* ── ACCIONES ────────────────────────────────────────── */}
      <div className="px-5 pb-8 space-y-3">
        {/* WhatsApp — primario, verde, grande */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full h-14 bg-[#25D366] text-white rounded-2xl font-bold text-base shadow-lg shadow-green-100 active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Contactar por WhatsApp
          </a>
        )}

        {/* Copiar link — secundario */}
        <CopyLinkButton token={token} />
      </div>

      {/* ── PIE ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Cotización generada con{' '}
          <span className="font-semibold text-[#F97316]">CotizaYa PR</span>
          {' · '}Los precios incluyen IVU {ivu_pct}%
        </p>
      </div>
    </div>
  )
}

// ── Botón copiar link (Client Component inline) ──────────────
function CopyLinkButton({ token }: { token: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(
          `${window.location.origin}/share/${token}`
        )
      }}
      className="flex items-center justify-center gap-2 w-full h-12 border-2 border-gray-200 text-gray-500 rounded-2xl font-medium text-sm hover:border-gray-300 active:scale-95 transition-all"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      Copiar enlace
    </button>
  )
}
