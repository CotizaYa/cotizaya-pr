'use client';

import React from 'react';
import { ShoppingSheet, ProfileItem, formatUSD } from '@/lib/shopping-sheet';

interface VisualShoppingSheetProps {
  sheet: ShoppingSheet;
}

export function VisualShoppingSheet({ sheet }: VisualShoppingSheetProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">📋 Hoja de Compra de Materiales</h3>
            <p className="text-blue-100 text-sm mt-1">CotizaYa Pro · {new Date(sheet.date).toLocaleDateString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Costo Estimado</p>
            <p className="text-lg font-black">{formatUSD(sheet.totalCost)}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alerta de Desperdicio */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-amber-900 font-bold text-sm">Desperdicio Estimado: {sheet.wastePercentage.toFixed(1)}%</p>
            <p className="text-amber-700 text-xs mt-0.5">Se recomienda comprar con un margen de seguridad para cortes.</p>
          </div>
        </div>

        {/* Tabla de Perfiles */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Perfil / Icono</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Longitud</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Barras</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Desperdicio</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sheet.profileItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg shadow-inner">
                        {getProfileIcon(item.profileType)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.profileType}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase">{item.profileSize} · {item.finish}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="bg-blue-100 text-blue-700 font-black px-2 py-1 rounded text-xs">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-600">
                    {item.lengthInches.toFixed(1)}" x {item.quantity}
                  </td>
                  <td className="py-4 text-center text-sm font-bold text-gray-900">
                    {item.stockLengthUsed}
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-red-600">
                    {item.wasteInches.toFixed(1)}"
                  </td>
                  <td className="py-4 text-right text-sm font-bold text-gray-900">
                    {formatUSD(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notas de Optimización */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>📝</span> Notas de Optimización
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sheet.optimizationNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-green-500 font-bold">✓</span>
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase">CotizaYa Pro Engineering Tools</p>
        <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">
          Descargar PDF →
        </button>
      </div>
    </div>
  );
}

function getProfileIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('marco')) return '🔲';
  if (t.includes('vareta')) return '📏';
  if (t.includes('malla')) return '🕸️';
  if (t.includes('cristal')) return '💎';
  return '📦';
}
