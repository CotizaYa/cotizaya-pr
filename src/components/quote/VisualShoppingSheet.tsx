'use client'

import React, { useState } from 'react'
import {
  Box,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Drill,
  GlassWater,
  Layers3,
  NotepadText,
  Package,
  Ruler,
  Scissors,
  Wrench,
} from 'lucide-react'
import { ShoppingSheet, OptimizedProfileItem, formatUSD } from '@/lib/shopping-sheet'

interface VisualShoppingSheetProps {
  sheet: ShoppingSheet
}

type SectionTone = 'slate' | 'amber' | 'sky'

function categorizeProfiles(items: OptimizedProfileItem[]) {
  const perfileria: OptimizedProfileItem[] = []
  const miscelaneos: OptimizedProfileItem[] = []
  const cristaleria: OptimizedProfileItem[] = []

  items.forEach((item) => {
    const t = item.profileType.toLowerCase()
    if (t.includes('cristal') || t.includes('vidrio') || t.includes('tola')) {
      cristaleria.push(item)
    } else if (
      t.includes('felpa') ||
      t.includes('varilla') ||
      t.includes('tornillo') ||
      t.includes('bisagra') ||
      t.includes('cerradura') ||
      t.includes('gozne') ||
      t.includes('silicón') ||
      t.includes('screen')
    ) {
      miscelaneos.push(item)
    } else {
      perfileria.push(item)
    }
  })

  return { perfileria, miscelaneos, cristaleria }
}

function ProfileIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t.includes('cristal') || t.includes('vidrio') || t.includes('tola')) return <GlassWater className="h-4 w-4" />
  if (t.includes('felpa') || t.includes('varilla') || t.includes('tornillo')) return <Wrench className="h-4 w-4" />
  if (t.includes('bisagra') || t.includes('gozne') || t.includes('cerradura')) return <Drill className="h-4 w-4" />
  if (t.includes('marco') || t.includes('adaptador') || t.includes('intermedio')) return <Layers3 className="h-4 w-4" />
  if (t.includes('malla') || t.includes('screen')) return <Box className="h-4 w-4" />
  return <Package className="h-4 w-4" />
}

function CutVisualization({ item }: { item: OptimizedProfileItem }) {
  const stockLength = 240
  const cutLength = Math.max(item.lengthInches, 1)
  const cutsPerBar = Math.max(1, Math.floor(stockLength / (cutLength + 0.125)))
  const usedLength = Math.min(stockLength, cutsPerBar * (cutLength + 0.125))
  const wasteLength = Math.max(0, stockLength - usedLength)

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase text-gray-500">Corte por barra de 20 pies</span>
        <span className="text-[9px] font-bold text-emerald-700">{cutsPerBar} piezas estimadas</span>
      </div>
      <div className="relative flex h-5 w-full overflow-hidden rounded-full border border-gray-200 bg-gray-100">
        <div
          className="h-full bg-gradient-to-b from-emerald-400 to-emerald-600"
          style={{ width: `${(usedLength / stockLength) * 100}%` }}
        />
        <div
          className="flex h-full items-center justify-center bg-gradient-to-b from-red-100 to-red-200"
          style={{ width: `${(wasteLength / stockLength) * 100}%` }}
        >
          {wasteLength > 18 && <span className="text-[8px] font-bold text-red-700">{wasteLength.toFixed(0)}&quot;</span>}
        </div>
      </div>
    </div>
  )
}

function CategorySection({ title, tone, items }: { title: string; tone: SectionTone; items: OptimizedProfileItem[] }) {
  if (items.length === 0) return null

  const sectionTotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const Icon = tone === 'slate' ? Layers3 : tone === 'amber' ? Wrench : GlassWater
  const color =
    tone === 'slate'
      ? 'from-slate-800 to-slate-700'
      : tone === 'amber'
        ? 'from-amber-700 to-amber-600'
        : 'from-sky-700 to-sky-600'

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className={`flex items-center justify-between bg-gradient-to-r ${color} px-4 py-3`}>
        <div className="flex items-center gap-2 text-white">
          <Icon className="h-4 w-4" />
          <h4 className="text-xs font-black uppercase tracking-[0.18em]">{title}</h4>
        </div>
        <span className="text-sm font-black text-white">{formatUSD(sectionTotal)}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 text-[10px] font-black uppercase text-gray-500">Material</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase text-gray-500">Pie lineal</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase text-gray-500">Precio</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase text-gray-500">Qty</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase text-gray-500">Barras</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={`${item.profileType}-${idx}`} className="transition-colors hover:bg-orange-50/30">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
                      <ProfileIcon type={item.profileType} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black leading-tight text-gray-900">{item.profileType}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-gray-500">{item.profileSize} · {item.finish || 'natural'}</p>
                      <CutVisualization item={item} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center align-top text-xs font-bold text-gray-700">{(item.lengthInches / 12).toFixed(2)}'</td>
                <td className="px-4 py-3 text-center align-top text-xs font-bold text-gray-700">{formatUSD(item.unitPrice)}</td>
                <td className="px-4 py-3 text-center align-top">
                  <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-black text-blue-800">{item.quantity}</span>
                </td>
                <td className="px-4 py-3 text-center align-top">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-800">{item.stockLengthUsed}</span>
                </td>
                <td className="px-4 py-3 text-right align-top text-sm font-black text-gray-900">{formatUSD(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function VisualShoppingSheet({ sheet }: VisualShoppingSheetProps) {
  const [showNotes, setShowNotes] = useState(false)
  const { perfileria, miscelaneos, cristaleria } = categorizeProfiles(sheet.profileItems)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
              <Scissors className="h-3.5 w-3.5" />
              Lista de compra automática
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">HOJA DE COMPRA</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">CotizaYa Pro · {new Date(sheet.date).toLocaleDateString('es-PR')}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total materiales</p>
            <p className="text-2xl font-black text-[#F97316]">{formatUSD(sheet.totalCost)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-400">Pies lineales</p>
            <p className="text-sm font-black text-white">{sheet.totalLinearFeet.toFixed(1)}'</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-400">Desperdicio</p>
            <p className={`text-sm font-black ${sheet.wastePercentage < 10 ? 'text-emerald-400' : 'text-amber-400'}`}>{sheet.wastePercentage.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center">
            <p className="text-[9px] font-bold uppercase text-slate-400">Renglones</p>
            <p className="text-sm font-black text-white">{sheet.profileItems.length}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <CategorySection title="Perfilería" tone="slate" items={perfileria} />
        <CategorySection title="Misceláneo" tone="amber" items={miscelaneos} />
        <CategorySection title="Cristalería" tone="sky" items={cristaleria} />
      </div>

      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-600">
            <NotepadText className="h-4 w-4" />
            Notas de optimización ({sheet.optimizationNotes.length})
          </span>
          {showNotes ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showNotes && (
          <div className="space-y-1.5 px-5 pb-4">
            {sheet.optimizationNotes.slice(0, 8).map((note, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-lg bg-gray-50 p-2 text-[11px] text-gray-600">
                <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">CotizaYa Pro · Optimización automática</p>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
          <CircleCheck className="h-3 w-3" />
          Verificado
        </span>
      </div>
    </div>
  )
}
