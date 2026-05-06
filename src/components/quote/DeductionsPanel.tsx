'use client';

import React, { useState } from 'react';
import { calculateDeductions, generateDeductionReport, DEDUCTION_PRESETS, DeductionConfig } from '@/lib/deductions';

interface DeductionsPanelProps {
  width: number;
  height: number;
  onApplyDeductions: (adjustedWidth: number, adjustedHeight: number) => void;
}

export function DeductionsPanel({ width, height, onApplyDeductions }: DeductionsPanelProps) {
  const [config, setConfig] = useState<DeductionConfig>(DEDUCTION_PRESETS.concreto_aluminio);
  const [showReport, setShowReport] = useState(false);

  const result = calculateDeductions(width, height, config);
  const report = generateDeductionReport(result);

  const handlePresetChange = (presetKey: keyof typeof DEDUCTION_PRESETS) => {
    setConfig(DEDUCTION_PRESETS[presetKey]);
  };

  const handleApply = () => {
    onApplyDeductions(result.adjustedWidth, result.adjustedHeight);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">📐</div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">Deducciones (Gaps)</h3>
          <p className="text-sm text-gray-600">Ajusta automáticamente las medidas según el tipo de instalación</p>
        </div>
      </div>

      {/* Presets rápidos */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => handlePresetChange('concreto_aluminio')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            config.installationType === 'concreto'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
          }`}
        >
          🏗️ Concreto
        </button>
        <button
          onClick={() => handlePresetChange('marco_madera')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            config.installationType === 'marco'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
          }`}
        >
          🪵 Marco Madera
        </button>
        <button
          onClick={() => handlePresetChange('reemplazo_ventana')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            config.installationType === 'ventana_existente'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
          }`}
        >
          🪟 Ventana
        </button>
        <button
          onClick={() => handlePresetChange('reemplazo_puerta')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            config.installationType === 'puerta_existente'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
          }`}
        >
          🚪 Puerta
        </button>
      </div>

      {/* Medidas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Original</p>
          <p className="text-2xl font-bold text-gray-900">{result.originalWidth.toFixed(2)}"</p>
          <p className="text-xs text-gray-600">Ancho</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Ajustada</p>
          <p className="text-2xl font-bold text-green-600">{result.adjustedWidth.toFixed(2)}"</p>
          <p className="text-xs text-gray-600">Ancho</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Original</p>
          <p className="text-2xl font-bold text-gray-900">{result.originalHeight.toFixed(2)}"</p>
          <p className="text-xs text-gray-600">Alto</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Ajustada</p>
          <p className="text-2xl font-bold text-green-600">{result.adjustedHeight.toFixed(2)}"</p>
          <p className="text-xs text-gray-600">Alto</p>
        </div>
      </div>

      {/* Deducción */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-amber-200">
        <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Deducción Total</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-bold text-amber-600">{(result.deductionX * 2).toFixed(2)}"</p>
            <p className="text-xs text-gray-600">Ancho (ambos lados)</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-600">{(result.deductionY * 2).toFixed(2)}"</p>
            <p className="text-xs text-gray-600">Alto (ambos lados)</p>
          </div>
        </div>
      </div>

      {/* Advertencias */}
      {result.warningFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          {result.warningFlags.map((flag, idx) => (
            <p key={idx} className="text-sm text-red-700 font-medium">
              {flag}
            </p>
          ))}
        </div>
      )}

      {/* Reporte detallado */}
      <button
        onClick={() => setShowReport(!showReport)}
        className="w-full mb-6 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
      >
        {showReport ? '▼ Ocultar reporte' : '▶ Ver reporte detallado'}
      </button>

      {showReport && (
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 font-mono text-xs whitespace-pre-wrap text-gray-700">
          {report}
        </div>
      )}

      {/* Botón aplicar */}
      <button
        onClick={handleApply}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-md"
      >
        ✓ Aplicar Deducciones
      </button>
    </div>
  );
}
