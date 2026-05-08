/**
 * Motor de Hoja de Compra para CotizaYa.
 * Genera una lista de materiales práctica para contratistas de puertas,
 * ventanas y screens en Puerto Rico.
 */

export interface ProfileItem {
  profileType: string
  profileSize: string
  lengthInches: number
  quantity: number
  unitPrice: number
  color?: string
  finish?: string
}

export interface OptimizedProfileItem extends ProfileItem {
  totalPrice: number
  stockLengthUsed: number
  wasteInches: number
}

export const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(amount) ? amount : 0)
}

export interface ShoppingSheet {
  quoteId: string
  date: Date
  totalLinearFeet: number
  totalCost: number
  profileItems: OptimizedProfileItem[]
  totalWasteInches: number
  wastePercentage: number
  optimizationNotes: string[]
  cuttingSheetUrl?: string
}

function normalizeProductType(category: string): 'puerta' | 'ventana' | 'screen' | 'garage' | 'closet' {
  const value = category.toLowerCase()
  if (value.includes('screen') || value.includes('malla')) return 'screen'
  if (value.includes('ventana')) return 'ventana'
  if (value.includes('garaje')) return 'garage'
  if (value.includes('closet')) return 'closet'
  return 'puerta'
}

function glass(width: number, height: number, quantity = 1): ProfileItem {
  const glassWidth = Math.max(width - 3, 1)
  const glassHeight = Math.max(height - 4, 1)
  return {
    profileType: `Cristal / Vidrio ${glassWidth.toFixed(1)}\" x ${glassHeight.toFixed(1)}\"`,
    profileSize: `${glassWidth.toFixed(1)}\" x ${glassHeight.toFixed(1)}\"`,
    lengthInches: glassWidth * glassHeight,
    quantity,
    unitPrice: 0.08,
    finish: 'claro',
  }
}

/**
 * Calcula materiales por dimensiones en pulgadas.
 */
export function calculateProfilesNeeded(width: number, height: number, category: string): ProfileItem[] {
  const w = Math.max(width || 0, 1)
  const h = Math.max(height || 0, 1)
  const type = normalizeProductType(category)
  const perimeter = 2 * (w + h)

  if (type === 'screen') {
    return [
      { profileType: 'Marco Exterior Screen', profileSize: '1 x 1', lengthInches: h, quantity: 2, unitPrice: 2.1, finish: 'aluminio' },
      { profileType: 'Marco Exterior Screen', profileSize: '1 x 1', lengthInches: w, quantity: 2, unitPrice: 2.1, finish: 'aluminio' },
      { profileType: 'Intermedio Heavy', profileSize: '3/4 x 3/4', lengthInches: w, quantity: h > 60 ? 1 : 0, unitPrice: 1.75, finish: 'aluminio' },
      { profileType: 'Malla Screen Fiberglass', profileSize: `${w.toFixed(1)}\" x ${h.toFixed(1)}\"`, lengthInches: w * h, quantity: 1, unitPrice: 0.035, finish: 'gris' },
      { profileType: 'Felpa', profileSize: 'Regular', lengthInches: perimeter, quantity: 1, unitPrice: 0.18, finish: 'negra' },
      { profileType: 'Varilla Roscada', profileSize: '1/8', lengthInches: h, quantity: 1, unitPrice: 0.22, finish: 'acero' },
    ].filter((item) => item.quantity > 0)
  }

  if (type === 'ventana') {
    return [
      { profileType: 'Marco Heavy', profileSize: '2 x 1', lengthInches: h, quantity: 2, unitPrice: 2.65, finish: 'aluminio' },
      { profileType: 'Marco Heavy', profileSize: '2 x 1', lengthInches: w, quantity: 2, unitPrice: 2.65, finish: 'aluminio' },
      { profileType: 'Adaptador Curvo', profileSize: 'Regular', lengthInches: w, quantity: 2, unitPrice: 1.85, finish: 'aluminio' },
      { profileType: 'Intermedio Heavy', profileSize: '3/4 x 3/4', lengthInches: h, quantity: 1, unitPrice: 1.95, finish: 'aluminio' },
      { profileType: 'Felpa', profileSize: 'Regular', lengthInches: perimeter, quantity: 1, unitPrice: 0.18, finish: 'negra' },
      glass(w / 2, h, 2),
    ]
  }

  if (type === 'garage') {
    return [
      { profileType: 'Marco Exterior Heavy', profileSize: '3 x 2', lengthInches: h, quantity: 2, unitPrice: 4.5, finish: 'aluminio' },
      { profileType: 'Marco Exterior Heavy', profileSize: '3 x 2', lengthInches: w, quantity: 2, unitPrice: 4.5, finish: 'aluminio' },
      { profileType: 'Intermedio Heavy', profileSize: '2 x 1', lengthInches: w, quantity: Math.max(2, Math.ceil(h / 24)), unitPrice: 2.75, finish: 'aluminio' },
      { profileType: 'Bisagras y accesorios', profileSize: 'Kit', lengthInches: 1, quantity: 1, unitPrice: 65, finish: 'herrajes' },
      { profileType: 'Tola / Panel', profileSize: `${w.toFixed(1)}\" x ${h.toFixed(1)}\"`, lengthInches: w * h, quantity: 1, unitPrice: 0.055, finish: 'blanco' },
    ]
  }

  if (type === 'closet') {
    return [
      { profileType: 'Marco Closet', profileSize: '2 x 1', lengthInches: h, quantity: 2, unitPrice: 2.4, finish: 'aluminio' },
      { profileType: 'Marco Closet', profileSize: '2 x 1', lengthInches: w, quantity: 2, unitPrice: 2.4, finish: 'aluminio' },
      { profileType: 'Riel Superior', profileSize: 'Doble', lengthInches: w, quantity: 1, unitPrice: 3.25, finish: 'aluminio' },
      { profileType: 'Riel Inferior', profileSize: 'Doble', lengthInches: w, quantity: 1, unitPrice: 3.25, finish: 'aluminio' },
      { profileType: 'Tola / Panel', profileSize: `${Math.max(w / 2 - 1, 1).toFixed(1)}\" x ${h.toFixed(1)}\"`, lengthInches: (w / 2) * h, quantity: 2, unitPrice: 0.05, finish: 'blanco' },
    ]
  }

  return [
    { profileType: 'Marco Exterior Heavy', profileSize: '2 x 1', lengthInches: h, quantity: 2, unitPrice: 2.95, finish: 'aluminio' },
    { profileType: 'Marco Exterior Heavy', profileSize: '2 x 1', lengthInches: w, quantity: 2, unitPrice: 2.95, finish: 'aluminio' },
    { profileType: 'Adaptador Curvo', profileSize: 'Regular', lengthInches: h, quantity: 2, unitPrice: 1.95, finish: 'aluminio' },
    { profileType: 'Intermedio Heavy', profileSize: '3/4 x 3/4', lengthInches: w, quantity: h > 54 ? 1 : 0, unitPrice: 1.85, finish: 'aluminio' },
    { profileType: 'Felpa', profileSize: 'Regular', lengthInches: perimeter, quantity: 1, unitPrice: 0.18, finish: 'negra' },
    { profileType: 'Varilla Roscada', profileSize: '1/8', lengthInches: h, quantity: 1, unitPrice: 0.22, finish: 'acero' },
    glass(w, h, 1),
  ].filter((item) => item.quantity > 0)
}

export function optimizeProfiles(profiles: ProfileItem[]): {
  optimized: OptimizedProfileItem[]
  totalWasteInches: number
  wastePercentage: number
  notes: string[]
} {
  const standardStockLengthInches = 240
  const sawKerfInches = 0.125
  const notes: string[] = []
  let totalRequired = 0
  let totalStockUsed = 0
  let totalWaste = 0

  const grouped: Record<string, { profile: ProfileItem; cutLengths: number[] }> = {}

  profiles.forEach((profile) => {
    const key = `${profile.profileType}-${profile.profileSize}-${profile.color || ''}-${profile.finish || ''}-${profile.unitPrice}`
    if (!grouped[key]) grouped[key] = { profile: { ...profile, quantity: 0 }, cutLengths: [] }
    for (let i = 0; i < profile.quantity; i++) {
      grouped[key].cutLengths.push(profile.lengthInches)
      grouped[key].profile.quantity += 1
    }
    totalRequired += profile.lengthInches * profile.quantity
  })

  const optimized: OptimizedProfileItem[] = []

  Object.values(grouped).forEach(({ profile, cutLengths }) => {
    const sorted = [...cutLengths].sort((a, b) => b - a)
    let stockPiecesUsed = 0
    let wasteForProfile = 0

    while (sorted.length > 0) {
      stockPiecesUsed += 1
      let remaining = standardStockLengthInches
      let i = 0
      while (i < sorted.length) {
        const cut = sorted[i]
        const required = cut > 1200 ? 0 : cut + sawKerfInches
        if (cut > 1200 || required <= remaining) {
          if (cut <= 1200) remaining -= required
          sorted.splice(i, 1)
        } else {
          i += 1
        }
      }
      totalStockUsed += standardStockLengthInches
      wasteForProfile += remaining
    }

    const linearFeet = profile.lengthInches > 1200 ? 0 : (profile.lengthInches * profile.quantity) / 12
    const areaLike = profile.lengthInches > 1200 ? profile.lengthInches * profile.quantity : 0
    const totalPrice = profile.lengthInches > 1200 ? areaLike * profile.unitPrice : linearFeet * profile.unitPrice
    totalWaste += wasteForProfile

    optimized.push({
      ...profile,
      totalPrice,
      stockLengthUsed: Math.max(stockPiecesUsed, 1),
      wasteInches: wasteForProfile,
    })
  })

  const wastePercentage = totalStockUsed > 0 ? (totalWaste / totalStockUsed) * 100 : 0
  const totalLinearFeet = totalRequired / 12
  notes.push(`Material calculado para ${totalLinearFeet.toFixed(1)} pies lineales equivalentes.`)
  notes.push('Longitud estándar usada: barras de 20 pies para perfilería.')
  notes.push('La cristalería y tolas se calculan por medida neta con deducciones automáticas.')
  notes.push('Verificar disponibilidad de color y acabado antes de cortar.')

  return { optimized, totalWasteInches: totalWaste, wastePercentage, notes }
}

export function generateShoppingSheetHTML(sheet: ShoppingSheet): string {
  const rows = sheet.profileItems
    .map(
      (item) => `
        <tr>
          <td>${item.profileType}</td>
          <td>${item.profileSize}</td>
          <td style="text-align:right">${(item.lengthInches / 12).toFixed(2)}'</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">${formatUSD(item.unitPrice)}</td>
          <td style="text-align:right"><strong>${formatUSD(item.totalPrice)}</strong></td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="es-PR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hoja de Compra - CotizaYa</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; color: #111827; padding: 24px; }
    .container { max-width: 960px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { background: #0f172a; color: white; padding: 28px; }
    .header h1 { margin: 0; font-size: 26px; }
    .header p { color: #cbd5e1; margin: 8px 0 0; }
    .content { padding: 28px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #475569; }
    td { border-top: 1px solid #e5e7eb; padding: 10px; font-size: 13px; }
    .total { margin-top: 20px; text-align: right; font-size: 22px; font-weight: 800; color: #f97316; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hoja de Compra de Materiales</h1>
      <p>CotizaYa Pro · ${new Date(sheet.date).toLocaleDateString('es-PR')}</p>
    </div>
    <div class="content">
      <table>
        <thead><tr><th>Material</th><th>Medida</th><th>Pie lineal</th><th>Qty</th><th>Precio</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total materiales: ${formatUSD(sheet.totalCost)}</div>
    </div>
  </div>
</body>
</html>`
}
