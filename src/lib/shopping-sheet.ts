/**
 * Módulo de Hoja de Compra Visual
 * Genera un documento visual con los perfiles necesarios, cantidades y optimización de material
 */

export interface ProfileItem {
  profileType: string; // 'marco_lateral', 'marco_superior', 'vareta', etc.
  profileSize: string; // '1/2 x 1/2', '3/4 x 3/4', etc.
  lengthInches: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  color?: string;
  finish?: string; // 'natural', 'anodizado', 'pintura'
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
  profileItems: ProfileItem[];
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
      lengthInches: h * 2,
      quantity: 2,
      unitPrice: 2.5,
      totalPrice: h * 2 * 2 * 2.5,
      finish: 'anodizado',
    });

    // Marco superior (1x)
    profiles.push({
      profileType: 'Marco Superior',
      profileSize: '1 x 1',
      lengthInches: w,
      quantity: 1,
      unitPrice: 2.5,
      totalPrice: w * 1 * 2.5,
      finish: 'anodizado',
    });

    // Marco inferior (1x)
    profiles.push({
      profileType: 'Marco Inferior',
      profileSize: '1 x 1',
      lengthInches: w,
      quantity: 1,
      unitPrice: 2.5,
      totalPrice: w * 1 * 2.5,
      finish: 'anodizado',
    });

    // Vareta central (1x)
    profiles.push({
      profileType: 'Vareta Central',
      profileSize: '3/4 x 3/4',
      lengthInches: h,
      quantity: 1,
      unitPrice: 1.8,
      totalPrice: h * 1 * 1.8,
      finish: 'anodizado',
    });
  } else if (productType === 'ventana') {
    // Marcos (4x)
    profiles.push({
      profileType: 'Marco',
      profileSize: '3/4 x 3/4',
      lengthInches: (w + h) * 2,
      quantity: 1,
      unitPrice: 1.8,
      totalPrice: (w + h) * 2 * 1.8,
      finish: 'anodizado',
    });

    // Varetas (2x)
    profiles.push({
      profileType: 'Vareta Horizontal',
      profileSize: '1/2 x 1/2',
      lengthInches: w * 2,
      quantity: 2,
      unitPrice: 1.2,
      totalPrice: w * 2 * 2 * 1.2,
      finish: 'anodizado',
    });
  } else if (productType === 'screen') {
    // Marco exterior
    profiles.push({
      profileType: 'Marco Exterior',
      profileSize: '1 x 1',
      lengthInches: (w + h) * 2,
      quantity: 1,
      unitPrice: 2.0,
      totalPrice: (w + h) * 2 * 2.0,
      finish: 'natural',
    });

    // Malla
    profiles.push({
      profileType: 'Malla Fiberglass',
      profileSize: 'Regular',
      lengthInches: w * h,
      quantity: 1,
      unitPrice: 0.15,
      totalPrice: w * h * 0.15,
      finish: 'gris',
    });
  }

  return profiles;
}

/**
 * Optimiza los perfiles para minimizar desperdicio
 */
export function optimizeProfiles(profiles: ProfileItem[]): {
  optimized: ProfileItem[];
  wastePercentage: number;
  notes: string[];
} {
  const notes: string[] = [];
  let totalLinearFeet = 0;
  let wastePercentage = 0;

  // Agrupar perfiles del mismo tipo y tamaño
  const grouped = profiles.reduce(
    (acc, profile) => {
      const key = `${profile.profileType}_${profile.profileSize}`;
      if (!acc[key]) {
        acc[key] = { ...profile, quantity: 0, lengthInches: 0, totalPrice: 0 };
      }
      acc[key].quantity += profile.quantity;
      acc[key].lengthInches += profile.lengthInches;
      acc[key].totalPrice += profile.totalPrice;
      return acc;
    },
    {} as Record<string, ProfileItem>
  );

  const optimized = Object.values(grouped);

  // Calcular desperdicio estimado
  optimized.forEach((profile) => {
    const standardLength = 20; // 20 pies estándar
    const needed = profile.lengthInches / 12; // Convertir a pies
    const waste = (needed % standardLength) / standardLength;
    wastePercentage += waste * 10; // Aproximación
  });

  wastePercentage = Math.min(wastePercentage / optimized.length, 25); // Máximo 25%

  notes.push(`✓ Perfiles agrupados para minimizar desperdicio`);
  notes.push(`✓ Desperdicio estimado: ${wastePercentage.toFixed(1)}%`);
  notes.push(`✓ Recomendación: Comprar con ${Math.ceil(wastePercentage)}% de margen adicional`);

  return { optimized, wastePercentage, notes };
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
