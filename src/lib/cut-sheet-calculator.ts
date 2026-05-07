export interface CutItem {
  label: string
  width: number   // pulgadas
  height: number  // pulgadas
  quantity: number
  type: 'frame' | 'panel' | 'rail' | 'stile' | 'custom'
}

export interface CutResult {
  piece: string
  length: number
  quantity: number
  barIndex: number
  position: number
}

export interface CutSheetResult {
  items: CutItem[]
  cuts: CutResult[]
  totalBarsNeeded: number
  totalLinearInches: number
  wasteInches: number
  wastePct: number
  efficiency: number
  barLength: number
  materialList: MaterialItem[]
}

export interface MaterialItem {
  profile: string
  totalBars: number
  totalLinearFt: number
  estimatedCost?: number
}

// Genera los cortes necesarios para una puerta/ventana de aluminio
export function generateCuts(item: CutItem): { label: string; length: number; qty: number }[] {
  const { width, height, type } = item
  const cuts: { label: string; length: number; qty: number }[] = []

  if (type === 'frame' || type === 'panel') {
    // Marco estándar: 2 horizontales (ancho) + 2 verticales (alto)
    cuts.push({ label: `${item.label} - Horizontal`, length: width, qty: 2 * item.quantity })
    cuts.push({ label: `${item.label} - Vertical`, length: height, qty: 2 * item.quantity })
  } else if (type === 'rail') {
    cuts.push({ label: `${item.label} - Riel`, length: width, qty: item.quantity })
  } else if (type === 'stile') {
    cuts.push({ label: `${item.label} - Larguero`, length: height, qty: item.quantity })
  } else {
    cuts.push({ label: item.label, length: Math.max(width, height), qty: item.quantity })
  }

  return cuts
}

// Algoritmo First Fit Decreasing para optimizar cortes en barras
export function calculateCutSheet(
  items: CutItem[],
  barLengthInches = 236, // 19.67 ft estándar
  wastePct = 0.05
): CutSheetResult {
  const effectiveBarLength = barLengthInches * (1 - wastePct)

  // Generar todos los cortes necesarios
  const allCuts: { label: string; length: number }[] = []
  for (const item of items) {
    const cuts = generateCuts(item)
    for (const cut of cuts) {
      for (let i = 0; i < cut.qty; i++) {
        allCuts.push({ label: cut.label, length: cut.length })
      }
    }
  }

  // Ordenar de mayor a menor (FFD)
  allCuts.sort((a, b) => b.length - a.length)

  // Empacar en barras
  const bars: number[] = [] // espacio restante por barra
  const cutResults: CutResult[] = []

  for (const cut of allCuts) {
    if (cut.length > effectiveBarLength) {
      // Pieza más larga que la barra — necesita barra dedicada
      bars.push(effectiveBarLength - cut.length)
      cutResults.push({
        piece: cut.label,
        length: cut.length,
        quantity: 1,
        barIndex: bars.length - 1,
        position: 0,
      })
      continue
    }

    // Buscar barra con espacio suficiente
    let placed = false
    for (let i = 0; i < bars.length; i++) {
      if (bars[i] >= cut.length) {
        const position = effectiveBarLength - bars[i]
        bars[i] -= cut.length
        cutResults.push({
          piece: cut.label,
          length: cut.length,
          quantity: 1,
          barIndex: i,
          position,
        })
        placed = true
        break
      }
    }

    if (!placed) {
      bars.push(effectiveBarLength - cut.length)
      cutResults.push({
        piece: cut.label,
        length: cut.length,
        quantity: 1,
        barIndex: bars.length - 1,
        position: 0,
      })
    }
  }

  const totalLinearInches = allCuts.reduce((s, c) => s + c.length, 0)
  const totalBarsNeeded = bars.length
  const wasteInches = bars.reduce((s, r) => s + r, 0)
  const efficiency = totalBarsNeeded > 0
    ? Math.round((totalLinearInches / (totalBarsNeeded * effectiveBarLength)) * 100)
    : 100

  return {
    items,
    cuts: cutResults,
    totalBarsNeeded,
    totalLinearInches,
    wasteInches,
    wastePct,
    efficiency,
    barLength: barLengthInches,
    materialList: [
      {
        profile: 'Aluminio Estándar',
        totalBars: totalBarsNeeded,
        totalLinearFt: Math.round((totalBarsNeeded * barLengthInches) / 12 * 10) / 10,
      },
    ],
  }
}

export function inchesToFeetDisplay(inches: number): string {
  const feet = Math.floor(inches / 12)
  const remaining = Math.round(inches % 12 * 8) / 8
  if (feet === 0) return `${remaining}"`
  if (remaining === 0) return `${feet}'`
  return `${feet}' ${remaining}"`
}