/**
 * Módulo de Hojas de Corte
 * Calcula automáticamente los perfiles de aluminio necesarios y optimiza el uso de material
 * Inspirado en la funcionalidad de Luminio.app
 */

export interface CuttingProfile {
  name: string;
  standardLength: number; // en pulgadas
  quantity: number;
  wastePercentage: number; // % de desperdicio típico
}

export interface CuttingSheet {
  profiles: CuttingProfile[];
  totalMaterial: number;
  estimatedWaste: number;
  netMaterial: number;
  optimizationScore: number; // 0-100, donde 100 es sin desperdicio
}

export interface QuoteItemCutting {
  productCode: string;
  productName: string;
  width: number;
  height: number;
  quantity: number;
  profilesNeeded: CuttingProfile[];
}

/**
 * Calcula los perfiles de aluminio necesarios basado en dimensiones
 * @param width - Ancho en pulgadas
 * @param height - Alto en pulgadas
 * @param quantity - Cantidad de unidades
 * @param productCode - Código del producto (puerta, ventana, etc)
 */
export function calculateProfilesNeeded(
  width: number,
  height: number,
  quantity: number,
  productCode: string
): CuttingProfile[] {
  const profiles: CuttingProfile[] = [];

  // Perfiles estándar por tipo de producto
  const profilesByType: Record<string, any> = {
    // Puertas
    P001: { vertical: height + 1.5, horizontal: width + 1.5, verticalQty: 2, horizontalQty: 2 },
    P002: { vertical: height + 1.5, horizontal: width + 1.5, verticalQty: 4, horizontalQty: 3 },
    P003: { vertical: height + 2, horizontal: width + 2, verticalQty: 2, horizontalQty: 2 },
    
    // Ventanas
    V001: { vertical: height + 1, horizontal: width + 1, verticalQty: 2, horizontalQty: 2 },
    V002: { vertical: height + 1, horizontal: width + 1, verticalQty: 2, horizontalQty: 2 },
    V003: { vertical: height + 1.5, horizontal: width + 1.5, verticalQty: 2, horizontalQty: 2 },
    V004: { vertical: height, horizontal: width, verticalQty: 2, horizontalQty: 2 },
    
    // Screens
    S001: { vertical: height + 1, horizontal: width + 1, verticalQty: 2, horizontalQty: 2 },
    S002: { vertical: height + 1, horizontal: width + 1, verticalQty: 4, horizontalQty: 3 },
    S003: { vertical: height + 0.5, horizontal: width + 0.5, verticalQty: 2, horizontalQty: 2 },
  };

  const spec = profilesByType[productCode] || { vertical: height + 1, horizontal: width + 1, verticalQty: 2, horizontalQty: 2 };

  // Perfiles verticales (marcos laterales)
  const verticalLength = spec.vertical;
  const verticalQtyPerUnit = spec.verticalQty;
  const totalVerticalNeeded = verticalLength * verticalQtyPerUnit * quantity;
  
  profiles.push({
    name: "Perfil Vertical (Marco Lateral)",
    standardLength: 144, // 12 pies = 144 pulgadas
    quantity: Math.ceil(totalVerticalNeeded / 144),
    wastePercentage: 8,
  });

  // Perfiles horizontales (marcos superior/inferior)
  const horizontalLength = spec.horizontal;
  const horizontalQtyPerUnit = spec.horizontalQty;
  const totalHorizontalNeeded = horizontalLength * horizontalQtyPerUnit * quantity;
  
  profiles.push({
    name: "Perfil Horizontal (Marco Superior/Inferior)",
    standardLength: 144,
    quantity: Math.ceil(totalHorizontalNeeded / 144),
    wastePercentage: 10,
  });

  // Perfiles intermedios (si aplica)
  if (width > 36) {
    const intermediateLength = height + 1;
    const intermediateQty = Math.floor(width / 24) * quantity;
    profiles.push({
      name: "Perfil Intermedio",
      standardLength: 144,
      quantity: Math.ceil((intermediateLength * intermediateQty) / 144),
      wastePercentage: 12,
    });
  }

  return profiles;
}

/**
 * Genera la hoja de corte completa para una cotización
 */
export function generateCuttingSheet(items: QuoteItemCutting[]): CuttingSheet {
  const profileMap = new Map<string, CuttingProfile>();

  // Agregar todos los perfiles necesarios
  items.forEach(item => {
    const profiles = calculateProfilesNeeded(
      item.width,
      item.height,
      item.quantity,
      item.productCode
    );

    profiles.forEach(profile => {
      const key = profile.name;
      if (profileMap.has(key)) {
        const existing = profileMap.get(key)!;
        existing.quantity += profile.quantity;
      } else {
        profileMap.set(key, { ...profile });
      }
    });
  });

  const profiles = Array.from(profileMap.values());

  // Calcular totales
  const totalMaterial = profiles.reduce((sum, p) => sum + (p.standardLength * p.quantity), 0);
  const estimatedWaste = profiles.reduce((sum, p) => sum + (p.standardLength * p.quantity * p.wastePercentage / 100), 0);
  const netMaterial = totalMaterial - estimatedWaste;
  const optimizationScore = Math.round((netMaterial / totalMaterial) * 100);

  return {
    profiles,
    totalMaterial,
    estimatedWaste,
    netMaterial,
    optimizationScore,
  };
}

/**
 * Genera un reporte de compra optimizado
 */
export function generatePurchaseReport(cuttingSheet: CuttingSheet) {
  return {
    date: new Date().toISOString(),
    profiles: cuttingSheet.profiles.map(p => ({
      name: p.name,
      standardLength: `${p.standardLength}"`,
      quantityNeeded: p.quantity,
      totalLength: `${p.standardLength * p.quantity}"`,
      estimatedWaste: `${p.wastePercentage}%`,
    })),
    summary: {
      totalMaterialInches: cuttingSheet.totalMaterial,
      totalMaterialFeet: Math.round(cuttingSheet.totalMaterial / 12),
      estimatedWasteInches: Math.round(cuttingSheet.estimatedWaste),
      netMaterialInches: Math.round(cuttingSheet.netMaterial),
      optimizationScore: `${cuttingSheet.optimizationScore}%`,
    },
  };
}
