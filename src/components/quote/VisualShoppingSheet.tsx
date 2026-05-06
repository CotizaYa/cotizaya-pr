'use client';

import React, { useState } from 'react';
import { ShoppingSheet, OptimizedProfileItem, formatUSD } from '@/lib/shopping-sheet';

interface VisualShoppingSheetProps {
  sheet: ShoppingSheet;
}

// ── Categorización tipo Luminio ──
function categorizeProfiles(items: OptimizedProfileItem[]) {
  const perfileria: OptimizedProfileItem[] = [];
  const miscelaneos: OptimizedProfileItem[] = [];
  const cristaleria: OptimizedProfileItem[] = [];

  items.forEach(item => {
    const t = item.profileType.toLowerCase();
    if (t.includes('cristal') || t.includes('vidrio') || t.includes('tola')) {
      cristaleria.push(item);
    } else if (t.includes('felpa') || t.includes('varilla') || t.includes('tornillo') || t.includes('bisagra') || t.includes('cerradura') || t.includes('gozne')) {
      miscelaneos.push(item);
    } else {
      perfileria.push(item);
    }
  });

  return { perfileria, miscelaneos, cristaleria };
}

// ── Visualización de Corte de Barra ──
function CutVisualization({ item }: { item: OptimizedProfileItem }) {
  const STOCK_LENGTH = 240; // 20 pies
  const cutLength = item.lengthInches;
  const cutsPerBar = Math.floor(STOCK_LENGTH / (cutLength + 0.125));
  const usedLength = cutsPerBar * (cutLength + 0.125);
  const wasteLength = STOCK_LENGTH - usedLength;
  const usedPercent = (usedLength / STOCK_LENGTH) * 100;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] font-bold text-gray-500 uppercase">Corte óptimo por barra de 20':</span>
        <span className="text-[9px] font-bold text-emerald-600">{cutsPerBar} piezas</span>
      </div>
      <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden flex relative border border-gray-200">
        {/* Piezas cortadas */}
        {Array.from({ length: cutsPerBar }).map((_, i) => (
          <div
            key={i}
            className="h-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-r border-white/50"
            style={{ width: `${(cutLength / STOCK_LENGTH) * 100}%` }}
          />
        ))}
        {/* Desperdicio */}
        <div
          className="h-full bg-gradient-to-b from-red-200 to-red-300 flex items-center justify-center"
          style={{ width: `${(wasteLength / STOCK_LENGTH) * 100}%` }}
        >
          {wasteLength > 20 && (
            <span className="text-[8px] font-bold text-red-700">{wasteLength.toFixed(0)}"</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sección de Categoría ──
function CategorySection({ title, icon, color, items }: {
  title: string;
  icon: string;
  color: string;
  items: OptimizedProfileItem[];
}) {
  if (items.length === 0) return null;

  const sectionTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="mb-6">
      {/* Header de categoría */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl ${color}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className="text-sm font-black text-white uppercase tracking-wider">{title}</h4>
        </div>
        <span className="text-sm font-black text-white">{formatUSD(sectionTotal)}</span>
      </div>

      {/* Tabla de items */}
      <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase">Perfil</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase text-center">Pie Lineal</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase text-center">Cant.</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase text-center">Barras</th>
              <th className="px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm border border-slate-200">
                      {getProfileIcon(item.profileType)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{item.profileType}</p>
                      <p className="text-[10px] text-gray-500">{item.profileSize} · {item.finish || 'natural'}</p>
                    </div>
                  </div>
                  {/* Visualización de corte inline */}
                  <CutVisualization item={item} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-bold text-gray-700">
                    {(item.lengthInches / 12).toFixed(1)}'
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded text-xs">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded text-xs">
                    {item.stockLengthUsed}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-black text-gray-900">{formatUSD(item.totalPrice)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VisualShoppingSheet({ sheet }: VisualShoppingSheetProps) {
  const [showNotes, setShowNotes] = useState(false);
  const { perfileria, miscelaneos, cristaleria } = categorizeProfiles(sheet.profileItems);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Header Premium - Estilo superior a Luminio */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">HOJA DE COMPRA</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">CotizaYa Pro · {new Date(sheet.date).toLocaleDateString('es-PR')}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Materiales</p>
            <p className="text-2xl font-black text-[#F97316]">{formatUSD(sheet.totalCost)}</p>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/5 rounded-lg px-3 py-2 text-center border border-white/10">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Pies Lineales</p>
            <p className="text-sm font-black text-white">{sheet.totalLinearFeet.toFixed(1)}'</p>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2 text-center border border-white/10">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Desperdicio</p>
            <p className={`text-sm font-black ${sheet.wastePercentage < 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {sheet.wastePercentage.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2 text-center border border-white/10">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Perfiles</p>
            <p className="text-sm font-black text-white">{sheet.profileItems.length}</p>
          </div>
        </div>
      </div>

      {/* Contenido categorizado */}
      <div className="p-4">
        <CategorySection
          title="Perfilería"
          icon="🔲"
          color="bg-gradient-to-r from-slate-700 to-slate-800"
          items={perfileria}
        />
        <CategorySection
          title="Misceláneos"
          icon="🔧"
          color="bg-gradient-to-r from-amber-600 to-amber-700"
          items={miscelaneos}
        />
        <CategorySection
          title="Cristalería"
          icon="💎"
          color="bg-gradient-to-r from-sky-600 to-sky-700"
          items={cristaleria}
        />
      </div>

      {/* Footer con notas colapsables */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider flex items-center gap-2">
            <span>📝</span> Notas de Optimización ({sheet.optimizationNotes.length})
          </span>
          <span className="text-gray-400 text-sm">{showNotes ? '▲' : '▼'}</span>
        </button>
        {showNotes && (
          <div className="px-5 pb-4 space-y-1.5">
            {sheet.optimizationNotes.slice(0, 6).map((note, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra inferior */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">CotizaYa Pro · Optimización Automática</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
            <span>✓</span> Algoritmo FFD
          </span>
        </div>
      </div>
    </div>
  );
}

function getProfileIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('marco')) return '🔲';
  if (t.includes('vareta')) return '📏';
  if (t.includes('malla')) return '🕸️';
  if (t.includes('cristal') || t.includes('vidrio')) return '💎';
  if (t.includes('felpa')) return '🧹';
  if (t.includes('varilla')) return '🔩';
  if (t.includes('bisagra') || t.includes('gozne')) return '🔗';
  if (t.includes('cerradura')) return '🔒';
  return '📦';
}
