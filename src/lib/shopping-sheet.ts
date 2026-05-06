/**
 * Módulo de Hoja de Compra Visual
 * Genera un documento visual con los perfiles necesarios, cantidades y optimización de material
 */

export interface ProfileItem {
  profileType: string; // 'marco_lateral', 'marco_superior', 'vareta', etc.
  profileSize: string; // '1/2 x 1/2', '3/4 x 3/4', etc.
  lengthInches: number; // Longitud de cada pieza individual
  quantity: number; // Cantidad de piezas de esa longitud
  unitPrice: number; // Precio por pulgada lineal del perfil
  color?: string;
  finish?: string; // 'natural', 'anodizado', 'pintura'
}

export interface OptimizedProfileItem extends ProfileItem {
  totalPrice: number; // Precio total de todas las piezas de este tipo
  stockLengthUsed: number; // Cantidad de barras de stock utilizadas para este perfil
  wasteInches: number; // Desperdicio total en pulgadas para este perfil
}

export const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export interface ShoppingSheet {
  quoteId: string;
  date: Date;
  totalLinearFeet: number;
  totalCost: number;
  profileItems: OptimizedProfileItem[]; // Ahora usa OptimizedProfileItem
  totalWasteInches: number; // Desperdicio total en pulgadas
  wastePercentage: number; // Porcentaje de desperdicio estimado
  optimizationNotes: string[];
  cuttingSheetUrl?: string;
}

/**
 * Calcula los perfiles necesarios basado en dimensiones
 */
export function calculateProfilesNeeded(
  width: number,
  height: number,
  productType: 'puerta' | 'ventana' | 'screen'
): ProfileItem[] {
  const profiles: ProfileItem[] = [];

  // Conversión a pulgadas si es necesario
  const w = width; // Asumimos que ya está en pulgadas
  const h = height;

  if (productType === 'puerta') {
    // Marcos laterales (2x)
    profiles.push({
      profileType: 'Marco Lateral',
      profileSize: '1 x 1',
      lengthInches: h,
      quantity: 2,
      unitPrice: 2.5,
      finish: 'anodizado',
    });

    // Marco superior (1x)
    profiles.push({
      profileType: 'Marco Superior',
      profileSize: '1 x 1',
      lengthInches: w,
      quantity: 1,
      unitPrice: 2.5,
      finish: 'anodizado',
    });

    // Marco inferior (1x)
    profiles.push({
      profileType: 'Marco Inferior',
      profileSize: '1 x 1',
      lengthInches: w,
      quantity: 1,
      unitPrice: 2.5,
      finish: 'anodizado',
    });

    // Vareta central (1x)
    profiles.push({
      profileType: 'Vareta Central',
      profileSize: '3/4 x 3/4',
      lengthInches: h,
      quantity: 1,
      unitPrice: 1.8,
      finish: 'anodizado',
    });
  } else if (productType === 'ventana') {
    // Marcos (4x)
    profiles.push({
      profileType: 'Marco',
      profileSize: '3/4 x 3/4',
      lengthInches: w,
      quantity: 2,
      unitPrice: 1.8,
      finish: 'anodizado',
    });
    profiles.push({
      profileType: 'Marco',
      profileSize: '3/4 x 3/4',
      lengthInches: h,
      quantity: 2,
      unitPrice: 1.8,
      finish: 'anodizado',
    });

    // Varetas (2x)
    profiles.push({
      profileType: 'Vareta Horizontal',
      profileSize: '1/2 x 1/2',
      lengthInches: w,
      quantity: 2,
      unitPrice: 1.2,
      finish: 'anodizado',
    });
  } else if (productType === 'screen') {
    // Marco exterior
    profiles.push({
      profileType: 'Marco Exterior',
      profileSize: '1 x 1',
      lengthInches: w,
      quantity: 2,
      unitPrice: 2.0,
      finish: 'natural',
    });
    profiles.push({
      profileType: 'Marco Exterior',
      profileSize: '1 x 1',
      lengthInches: h,
      quantity: 2,
      unitPrice: 2.0,
      finish: 'natural',
    });

    // Malla
    // Malla no es un perfil lineal, se calcula diferente.
    // Por ahora, no la incluimos en la optimización de corte de perfiles.
    // profiles.push({
    //   profileType: 'Malla Fiberglass',
    //   profileSize: 'Regular',
    //   lengthInches: w * h,
    //   quantity: 1,
    //   unitPrice: 0.15,
    //   finish: 'gris',
    // });
  }

  return profiles;
}

/**
 * Optimiza los perfiles para minimizar desperdicio
 */
export function optimizeProfiles(profiles: ProfileItem[]): {
  optimized: OptimizedProfileItem[];
  totalWasteInches: number;
  wastePercentage: number;
  notes: string[];
} {
  const STANDARD_STOCK_LENGTH_INCHES = 240; // 20 pies * 12 pulgadas/pie
  const SAW_KERF_INCHES = 0.125; // 1/8 de pulgada por corte de sierra

  const notes: string[] = [];
  let totalOverallRequiredLength = 0; // Suma de todas las longitudes de corte solicitadas
  let totalOverallStockUsedLength = 0; // Suma de todas las longitudes de stock utilizadas
  let totalOverallWasteInches = 0; // Suma de todo el desperdicio
  let totalOverallCost = 0; // Costo total de los perfiles

  // 1. Agrupar perfiles por tipo, tamaño, color y acabado
  const groupedProfiles: Record<string, { profile: ProfileItem; cutLengths: number[] }> = {};

  profiles.forEach(p => {
    const key = `${p.profileType}-${p.profileSize}-${p.color || ''}-${p.finish || ''}`;
    if (!groupedProfiles[key]) {
      groupedProfiles[key] = { profile: { ...p, quantity: 0 }, cutLengths: [] };
    }
    for (let i = 0; i < p.quantity; i++) {
      groupedProfiles[key].cutLengths.push(p.lengthInches);
      groupedProfiles[key].profile.quantity++;
    }
    totalOverallRequiredLength += p.lengthInches * p.quantity;
  });

  const optimizedProfiles: OptimizedProfileItem[] = [];

  for (const key in groupedProfiles) {
    const { profile, cutLengths } = groupedProfiles[key];
    const sortedCutLengths = [...cutLengths].sort((a, b) => b - a); // Ordenar de mayor a menor

    let stockPiecesUsed = 0;
    let currentStockRemaining = 0;
    let currentProfileWasteInches = 0;
    let currentProfileTotalPrice = 0;

    // Implementación del algoritmo First Fit Decreasing (FFD)
    while (sortedCutLengths.length > 0) {
      stockPiecesUsed++;
      currentStockRemaining = STANDARD_STOCK_LENGTH_INCHES;
      notes.push(`Iniciando nueva barra de ${STANDARD_STOCK_LENGTH_INCHES}" para ${profile.profileType} ${profile.profileSize}`);

      let i = 0;
      while (i < sortedCutLengths.length) {
        const cut = sortedCutLengths[i];
        // Considerar el espacio del corte de sierra
        if (cut + SAW_KERF_INCHES <= currentStockRemaining) {
          currentStockRemaining -= (cut + SAW_KERF_INCHES);
          currentProfileTotalPrice += (cut / 12) * profile.unitPrice; // Precio por pulgada lineal
          notes.push(`  Cortando ${cut}" (restante: ${currentStockRemaining.toFixed(2)}")`);
          sortedCutLengths.splice(i, 1); // Remover la pieza cortada
        } else {
          i++; // Intentar con la siguiente pieza
        }
      }
      totalOverallStockUsedLength += STANDARD_STOCK_LENGTH_INCHES;
      currentProfileWasteInches += currentStockRemaining; // El restante es desperdicio de esta barra
      notes.push(`  Desperdicio en esta barra: ${currentStockRemaining.toFixed(2)}"`);
    }

    optimizedProfiles.push({
      ...profile,
      totalPrice: currentProfileTotalPrice,
      stockLengthUsed: stockPiecesUsed,
      wasteInches: currentProfileWasteInches,
    });
    totalOverallWasteInches += currentProfileWasteInches;
    totalOverallCost += currentProfileTotalPrice;
  }

  const finalTotalLinearFeet = totalOverallRequiredLength / 12;
  const wastePercentage = totalOverallStockUsedLength > 0 ? (totalOverallWasteInches / totalOverallStockUsedLength) * 100 : 0;

  notes.unshift(`Total de perfiles a cortar: ${totalOverallRequiredLength.toFixed(2)}"`);
  notes.unshift(`Longitud estándar de stock: ${STANDARD_STOCK_LENGTH_INCHES}"`);
  notes.unshift(`Ancho de corte de sierra (kerf): ${SAW_KERF_INCHES}"`);

  return { optimized: optimizedProfiles, totalWasteInches: totalOverallWasteInches, wastePercentage, notes };
}

/**
 * Genera el HTML para la Hoja de Compra visual
 */
export function generateShoppingSheetHTML(sheet: ShoppingSheet): string {
  const profileRows = sheet.profileItems
    .map(
      (item) => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3 font-semibold text-gray-900">${item.profileType}</td>
      <td class="px-4 py-3 text-gray-700">${item.profileSize}</td>
      <td class="px-4 py-3 text-right text-gray-700">${item.lengthInches.toFixed(2)}"</td>
      <td class="px-4 py-3 text-center font-bold text-blue-600">${item.quantity}</td>
      <td class="px-4 py-3 text-right text-gray-700">$${item.unitPrice.toFixed(2)}</td>
      <td class="px-4 py-3 text-right font-bold text-green-600">$${item.totalPrice.toFixed(2)}</td>
      <td class="px-4 py-3 text-center text-gray-700">${item.stockLengthUsed}</td>
      <td class="px-4 py-3 text-right text-red-600">${item.wasteInches.toFixed(2)}"</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hoja de Compra - CotizaYa</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; color: #333; }
    td { padding: 12px; }
    .total-row { background: #f9f9f9; font-weight: bold; font-size: 16px; }
    .waste-info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .notes { background: #e7f3ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; }
    .notes ul { margin-left: 20px; }
    .notes li { margin: 8px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Hoja de Compra de Materiales</h1>
      <p>CotizaYa Pro - ${new Date(sheet.date).toLocaleDateString('es-ES')}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="waste-info">
          <strong>⚠️ Desperdicio Estimado:</strong> ${sheet.wastePercentage.toFixed(1)}%
          <br><small>Se recomienda comprar con margen adicional para cortes y ajustes</small>
        </div>
        
        <table>
          <thead>
            <tr style="background: #667eea; color: white;">
              <th>Perfil</th>
              <th>Tamaño</th>
              <th>Longitud</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${profileRows}
            <tr class="total-row" style="background: #667eea; color: white;">
              <td colspan="5" style="text-align: right;">TOTAL:</td>
              <td style="text-align: right;">$${sheet.totalCost.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="section notes">
        <h3 style="margin-bottom: 10px;">📝 Notas de Optimización:</h3>
        <ul>
          ${sheet.optimizationNotes.map((note) => `<li>${note}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p>Documento generado por CotizaYa Pro - ${new Date().toLocaleTimeString('es-ES')}</p>
    </div>
  </div>
</body>
</html>
  `;
}
