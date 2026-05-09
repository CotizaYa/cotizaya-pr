import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ShareActions from './ShareActions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

interface PageProps { params: Promise<{ token: string }> }

const fmt = (n: any) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n ?? 0))

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

const CAT_LABEL: Record<string, string> = {
  puerta: 'Puertas', ventana: 'Ventanas', screen: 'Screens',
  closet: 'Closets', aluminio: 'Perfilería', cristal: 'Cristalería',
  tornilleria: 'Tornillería', miscelanea: 'Servicios',
}

export const revalidate = 0

export default async function CotizacionPublicaPage({ params }: PageProps) {
  const { token } = await params

  const { data: quote, error } = await supabase.rpc('get_public_quote', { p_token: token })
  if (error || !quote?.id) notFound()

  const biz   = quote.profile as any
  const client = quote.client as any
  const items  = (quote.items ?? []) as any[]

  const subtotal    = Number(quote.subtotal_materials) + Number(quote.subtotal_labor)
  const total       = Number(quote.total)
  const deposito    = Number(quote.deposit_amount) || total * 0.5
  const balance     = total - deposito
  const fecha       = fmtDate(quote.created_at)
  const validHasta  = fmtDate(quote.valid_until)

  const waMsg = encodeURIComponent(
    `Hola ${biz?.business_name ?? 'CotizaYa'},\n\nConfirmo cotización ${quote.quote_number}\nTotal: ${fmt(total)}\nDepósito: ${fmt(deposito)}\n\nDirección: [escribe aquí]\n¿Cuándo pueden comenzar?`
  )
  const phone = biz?.phone?.replace(/\D/g, '') || ''
  const waUrl = phone ? `https://wa.me/1${phone}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`

  // Group items by category
  const grouped: Record<string, any[]> = {}
  for (const item of items) {
    const cat = item.category_snapshot || 'miscelanea'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-2 print:bg-white print:p-0">
      <div className="max-w-2xl mx-auto bg-white shadow-xl print:shadow-none" id="invoice">

        {/* ── HEADER: Logo + Invoice title ────────────────────── */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-start justify-between mb-4">
            {/* Business identity */}
            <div className="flex items-center gap-4">
              {biz?.logo_url ? (
                <img src={biz.logo_url} alt={biz.business_name} className="h-16 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-lg">{(biz?.business_name ?? 'C')[0].toUpperCase()}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="font-black text-gray-900 text-xl leading-tight">{biz?.business_name ?? 'CotizaYa'}</p>
                {biz?.phone && <p className="text-sm text-gray-500 mt-0.5">{biz.phone}</p>}
                {biz?.email && <p className="text-sm text-gray-500">{biz.email}</p>}
              </div>
            </div>
            {/* Invoice badge */}
            <div className="text-right">
              <p className="text-4xl font-black text-orange-500 tracking-tight uppercase">Invoice</p>
              <p className="text-gray-900 font-black text-lg mt-1">{quote.quote_number}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fecha}</p>
              {validHasta && <p className="text-xs text-gray-400">Válida hasta {validHasta}</p>}
            </div>
          </div>

          {/* Orange accent line */}
          <div className="h-1 bg-orange-500 rounded-full mb-6" />
        </div>

        {/* ── CLIENT INFO ──────────────────────────────────────── */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Preparado para</p>
              {client?.full_name ? (
                <>
                  <p className="font-black text-gray-900 text-base">{client.full_name}</p>
                  {client.phone && <p className="text-sm text-gray-600 mt-0.5">Tel: {client.phone}</p>}
                  {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                </>
              ) : (
                <p className="text-gray-400 text-sm italic">Cliente no especificado</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Detalles</p>
              <p className="text-sm text-gray-600">Fecha: <span className="font-bold text-gray-900">{fecha}</span></p>
              <p className="text-sm text-gray-600">Invoice#: <span className="font-bold text-gray-900">{quote.quote_number}</span></p>
            </div>
          </div>
        </div>

        {/* ── PRODUCT TABLE ────────────────────────────────────── */}
        <div className="px-8 pb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider rounded-tl-lg">Producto</th>
                <th className="text-right px-3 py-3 text-xs font-black uppercase tracking-wider">Precio</th>
                <th className="text-right px-3 py-3 text-xs font-black uppercase tracking-wider">Cant.</th>
                <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([cat, catItems]) => (
                <>
                  {/* Category subheader */}
                  <tr key={`cat-${cat}`} className="bg-orange-50">
                    <td colSpan={4} className="px-4 py-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                        {CAT_LABEL[cat] ?? cat}
                      </span>
                    </td>
                  </tr>
                  {catItems.map((item: any, idx: number) => {
                    const isPie2 = item.price_type_snapshot === 'por_pie_cuadrado'
                    const pie2 = isPie2 && item.width_inches && item.height_inches
                      ? (Number(item.width_inches) * Number(item.height_inches) / 144).toFixed(2)
                      : null
                    return (
                      <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm">
                          <p className="font-bold text-gray-900">{item.name_snapshot}</p>
                          {isPie2 && item.width_inches && item.height_inches && (
                            <p className="text-xs text-gray-400">
                              {Math.round(Number(item.width_inches))}" × {Math.round(Number(item.height_inches))}"{pie2 ? ` · ${pie2} pie²` : ''}
                              {item.metadata?.color ? ` · ${item.metadata.color}` : ''}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-right text-gray-600 tabular-nums">
                          {fmt(item.unit_price_snapshot)}{isPie2 ? '/pie²' : ''}
                        </td>
                        <td className="px-3 py-3 text-sm text-right text-gray-600 tabular-nums">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right font-black text-gray-900 tabular-nums">{fmt(item.line_total)}</td>
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── TOTALS ───────────────────────────────────────────── */}
        <div className="px-8 pb-6">
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-3">
              <span className="font-bold">SUBTOTAL</span>
              <span className="tabular-nums font-bold">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-2">
              <span className="font-bold">TAX</span>
              <span className="tabular-nums">$ 0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2">
              <span>TOTAL</span>
              <span className="tabular-nums">{fmt(total)}</span>
            </div>
          </div>
          {/* Deposit info — left aligned like ScreenPRO */}
          <div className="mt-4 pt-3 border-t border-dashed border-orange-200 text-sm space-y-1">
            <p className="text-orange-600 font-bold">Deposit: 50%= {fmt(deposito)}</p>
            <p className="text-gray-500">Date: ___________________</p>
            <p className="text-gray-500">PAYMENT METHOD: CASH / ATH Móvil</p>
          </div>
        </div>

        {/* ── TERMS & CONDITIONS ───────────────────────────────── */}
        <div className="px-8 pb-6">
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Terms & Conditions</p>
            {quote.notes ? (
              <p className="text-xs text-gray-600 leading-relaxed">{quote.notes}</p>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                Cualquier trabajo adicional debido a vicios ocultos tendrá un costo adicional.
                El depósito del 50% es requerido para comenzar los trabajos.
                El balance se paga al completar la instalación.
              </p>
            )}
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <div className="bg-gray-900 px-8 py-5 rounded-b-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              {biz?.phone && (
                <p className="text-white font-black text-base">{biz.phone}</p>
              )}
              {biz?.email && (
                <p className="text-orange-400 text-sm">{biz.email}</p>
              )}
            </div>
            <div className="text-center sm:text-right">
              <p className="text-gray-400 text-xs">Generado con</p>
              <p className="text-orange-400 font-black text-sm">CotizaYa PR</p>
            </div>
          </div>
        </div>

        {/* ── CTA BUTTONS (outside print area) ─────────────────── */}
        <div className="print:hidden">
          <ShareActions waUrl={waUrl} token={token} />
        </div>
      </div>
    </div>
  )
}
