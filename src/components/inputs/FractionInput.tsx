/**
 * FractionInput — Selector de medidas en pulgadas con soporte de fracciones
 * Diseñado para contratistas en PR: rápido, táctil, a prueba de sol y sudor.
 *
 * Uso:
 *   <FractionInput label="Ancho" value={width} onChange={setWidth} />
 *
 * El valor interno es siempre pulgadas decimales (number).
 * El display muestra fracciones legibles: 36 1/2", 48 3/4", etc.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { parseFraction, inchesToFraction } from '@/lib/calculations'

// Fracciones disponibles en 1/8" (estándar de la industria en PR)
const FRACTIONS = [
  { label: '0',   value: 0 },
  { label: '⅛',   value: 1/8 },
  { label: '¼',   value: 1/4 },
  { label: '⅜',   value: 3/8 },
  { label: '½',   value: 1/2 },
  { label: '⅝',   value: 5/8 },
  { label: '¾',   value: 3/4 },
  { label: '⅞',   value: 7/8 },
]

interface FractionInputProps {
  label: string
  value: number            // pulgadas decimales
  onChange: (inches: number) => void
  placeholder?: string
  min?: number
  max?: number
  className?: string
  error?: string
}

export function FractionInput({
  label,
  value,
  onChange,
  placeholder = '0',
  min = 0,
  max = 999,
  className = '',
  error,
}: FractionInputProps) {
  const [rawText, setRawText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [wholePart, setWholePart] = useState(Math.floor(value || 0))
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Sincronizar cuando cambia el valor externo
  useEffect(() => {
    if (!isFocused) {
      setWholePart(Math.floor(value || 0))
    }
  }, [value, isFocused])

  // Cerrar picker al tocar fuera
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const displayValue = value > 0 ? inchesToFraction(value) : ''
  const fracPart = value - Math.floor(value)
  const activeFrac = FRACTIONS.find(f => Math.abs(f.value - fracPart) < 0.01)

  function handleTextChange(raw: string) {
    setRawText(raw)
    const parsed = parseFraction(raw)
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed)
      setWholePart(Math.floor(parsed))
    }
  }

  function handleFocus() {
    setIsFocused(true)
    setRawText(value > 0 ? inchesToFraction(value).replace('"', '') : '')
    setShowPicker(true)
  }

  function handleBlur() {
    setIsFocused(false)
    setRawText('')
    setShowPicker(false)
  }

  function selectFraction(frac: number) {
    const newVal = wholePart + frac
    onChange(newVal)
    // Mantener el picker abierto para que el usuario vea el resultado
  }

  function incrementWhole(delta: number) {
    const newWhole = Math.max(min, Math.min(max, wholePart + delta))
    setWholePart(newWhole)
    onChange(newWhole + fracPart)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>

      {/* Input principal */}
      <div
        className={`relative flex items-center bg-white border-2 rounded-xl transition-all ${
          error
            ? 'border-red-400'
            : isFocused
            ? 'border-orange-500 shadow-sm shadow-orange-100'
            : 'border-gray-200'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={isFocused ? rawText : displayValue}
          onChange={e => handleTextChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 h-12 pl-4 pr-2 text-lg font-bold text-gray-900 bg-transparent outline-none placeholder-gray-300"
        />
        {/* Unidad */}
        <span className="pr-3 text-sm font-bold text-gray-400 select-none">"</span>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}

      {/* Picker de fracciones — aparece cuando está en foco */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          onMouseDown={e => e.preventDefault()} // Evitar que blur del input se dispare
          onTouchStart={e => e.stopPropagation()}
        >
          {/* Selector de enteros */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <button
              type="button"
              onMouseDown={() => incrementWhole(-1)}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-black text-gray-700 active:scale-95 transition-transform shadow-sm"
            >
              −
            </button>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 tabular-nums leading-none">
                {wholePart}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">pulgadas</p>
            </div>
            <button
              type="button"
              onMouseDown={() => incrementWhole(1)}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl font-black text-gray-700 active:scale-95 transition-transform shadow-sm"
            >
              +
            </button>
          </div>

          {/* Grid de fracciones */}
          <div className="p-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 pb-1.5">
              Fracción
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {FRACTIONS.map(f => {
                const isActive = activeFrac?.value === f.value
                return (
                  <button
                    key={f.label}
                    type="button"
                    onMouseDown={() => selectFraction(f.value)}
                    className={`h-11 rounded-xl text-sm font-black transition-all active:scale-95 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vista previa del resultado */}
          <div className="px-4 py-2.5 bg-orange-50 border-t border-orange-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600 font-bold">Medida final:</span>
              <span className="text-base font-black text-orange-600">
                {value > 0 ? inchesToFraction(value) : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
