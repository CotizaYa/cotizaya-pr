/**
 * Sistema de Deducciones (Gaps) para CotizaYa
 * Ajusta automáticamente las medidas según el tipo de instalación
 * (Concreto vs Marco, Interior vs Exterior, etc.)
 */

export type InstallationType = 'concreto' | 'marco' | 'ventana_existente' | 'puerta_existente';
export type FrameType = 'aluminio' | 'madera' | 'pvc';

export interface DeductionConfig {
  installationType: InstallationType;
  frameType: FrameType;
  hasExistingFrame: boolean;
  isExterior: boolean;
  climate: 'tropical' | 'templado' | 'frio'; // Para expansión térmica
}

export interface DeductionResult {
  originalWidth: number;
  originalHeight: number;
  adjustedWidth: number;
  adjustedHeight: number;
  deductionX: number;
  deductionY: number;
  notes: string[];
  warningFlags: string[];
}

/**
 * Calcula las deducciones automáticas basadas en el tipo de instalación
 */
export function calculateDeductions(
  width: number,
  height: number,
  config: DeductionConfig
): DeductionResult {
  let deductionX = 0;
  let deductionY = 0;
  const notes: string[] = [];
  const warningFlags: string[] = [];

  // Deducciones por tipo de instalación
  if (config.installationType === 'concreto') {
    // En concreto, se deja espacio para silicona y expansión
    deductionX = 0.5; // 1/2 pulgada en cada lado = 1" total
    deductionY = 0.5;
    notes.push('Deducción por silicona en concreto: 0.5" en cada lado');
  } else if (config.installationType === 'marco') {
    // En marco de madera/aluminio, se deja menos espacio
    deductionX = 0.25; // 1/4 pulgada en cada lado = 0.5" total
    deductionY = 0.25;
    notes.push('Deducción por marco existente: 0.25" en cada lado');
  } else if (config.installationType === 'ventana_existente') {
    // Reemplazo de ventana: se ajusta al hueco existente
    deductionX = 0.125; // 1/8 pulgada en cada lado
    deductionY = 0.125;
    notes.push('Deducción para reemplazo de ventana: 0.125" en cada lado');
  } else if (config.installationType === 'puerta_existente') {
    // Reemplazo de puerta: se ajusta al hueco existente
    deductionX = 0.25;
    deductionY = 0.5; // Más espacio en altura para piso
    notes.push('Deducción para reemplazo de puerta: 0.25" ancho, 0.5" alto');
  }

  // Ajustes adicionales por tipo de marco
  if (config.frameType === 'madera' && config.installationType === 'marco') {
    deductionX += 0.125; // La madera se expande más
    notes.push('Ajuste adicional por marco de madera: +0.125"');
  }

  // Ajustes por clima (expansión térmica)
  if (config.climate === 'tropical') {
    deductionX += 0.0625; // 1/16" adicional por expansión térmica
    notes.push('Ajuste por clima tropical (expansión térmica): +0.0625"');
  }

  // Validaciones y advertencias
  if (width - deductionX * 2 < 12) {
    warningFlags.push('⚠️ ADVERTENCIA: Ancho final muy pequeño (<12"). Verificar medidas.');
  }
  if (height - deductionY * 2 < 24) {
    warningFlags.push('⚠️ ADVERTENCIA: Alto final muy pequeño (<24"). Verificar medidas.');
  }

  const adjustedWidth = Math.max(width - deductionX * 2, 0);
  const adjustedHeight = Math.max(height - deductionY * 2, 0);

  return {
    originalWidth: width,
    originalHeight: height,
    adjustedWidth,
    adjustedHeight,
    deductionX,
    deductionY,
    notes,
    warningFlags,
  };
}

/**
 * Genera un reporte detallado de deducciones para mostrar al usuario
 */
export function generateDeductionReport(result: DeductionResult): string {
  let report = '📐 REPORTE DE DEDUCCIONES\n';
  report += '═'.repeat(40) + '\n\n';
  report += `Medidas Originales:  ${result.originalWidth.toFixed(2)}" × ${result.originalHeight.toFixed(2)}"\n`;
  report += `Medidas Ajustadas:   ${result.adjustedWidth.toFixed(2)}" × ${result.adjustedHeight.toFixed(2)}"\n\n`;
  report += `Deducción Total:     ${(result.deductionX * 2).toFixed(2)}" (ancho) × ${(result.deductionY * 2).toFixed(2)}" (alto)\n\n`;

  if (result.notes.length > 0) {
    report += '📝 Notas:\n';
    result.notes.forEach((note) => {
      report += `  • ${note}\n`;
    });
    report += '\n';
  }

  if (result.warningFlags.length > 0) {
    report += '⚠️ Advertencias:\n';
    result.warningFlags.forEach((flag) => {
      report += `  ${flag}\n`;
    });
  }

  return report;
}

/**
 * Presets comunes para contratistas
 */
export const DEDUCTION_PRESETS = {
  concreto_aluminio: {
    installationType: 'concreto' as InstallationType,
    frameType: 'aluminio' as FrameType,
    hasExistingFrame: false,
    isExterior: true,
    climate: 'tropical' as const,
  },
  marco_madera: {
    installationType: 'marco' as InstallationType,
    frameType: 'madera' as FrameType,
    hasExistingFrame: true,
    isExterior: false,
    climate: 'templado' as const,
  },
  reemplazo_ventana: {
    installationType: 'ventana_existente' as InstallationType,
    frameType: 'aluminio' as FrameType,
    hasExistingFrame: true,
    isExterior: true,
    climate: 'tropical' as const,
  },
  reemplazo_puerta: {
    installationType: 'puerta_existente' as InstallationType,
    frameType: 'aluminio' as FrameType,
    hasExistingFrame: true,
    isExterior: true,
    climate: 'tropical' as const,
  },
};
