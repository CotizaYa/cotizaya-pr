"use client";
import { useState, useEffect } from "react";
import { calcLineTotal, parseFraction, formatUSD } from "@/lib/calculations";
import { DeductionsPanel } from "@/components/quote/DeductionsPanel";

interface QuickCalculatorProps {
  product: {
    id: string;
    code: string | null;
    name: string;
    price_type: string;
    base_price: number;
  };
  userPrice: number;
  onAddToQuote: (item: any) => void;
}

export function QuickCalculator({ product, userPrice, onAddToQuote }: QuickCalculatorProps) {
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [color, setColor] = useState("blanco");
  const [lineTotal, setLineTotal] = useState(0);
  const [showDeductions, setShowDeductions] = useState(false);

  // ── LIVE UPDATE: Recalcula el total cada vez que cambia algo ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (product.price_type === "por_unidad") {
        // Para unidades: precio × cantidad
        const qty = parseInt(quantity) || 1;
        setLineTotal(userPrice * qty);
      } else {
        // Para medidas: calcula con ancho × alto
        const width = parseFraction(widthInput);
        const height = parseFraction(heightInput);
        const qty = parseInt(quantity) || 1;

        if (width > 0 && height > 0) {
          const total = calcLineTotal({
            widthInches: width,
            heightInches: height,
            unitPrice: userPrice,
            quantity: qty,
            priceType: product.price_type as "por_unidad" | "por_pie_cuadrado" | "por_pie_lineal",
          });
          setLineTotal(total);
        } else {
          setLineTotal(0);
        }
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [widthInput, heightInput, quantity, userPrice, product.price_type]);

  const handleApplyDeductions = (adjustedWidth: number, adjustedHeight: number) => {
    setWidthInput(adjustedWidth.toString());
    setHeightInput(adjustedHeight.toString());
    setShowDeductions(false);
  };

  const handleAddToQuote = () => {
    onAddToQuote({
      product_id: product.id,
      product_snapshot: {
        code: product.code,
        name: product.name,
        price_type: product.price_type,
        base_price: product.base_price,
      },
      width_inches: parseFraction(widthInput),
      height_inches: parseFraction(heightInput),
      quantity: parseInt(quantity) || 1,
      color,
      line_total: lineTotal,
    });
  };

  const showMeasures = ["por_pie_cuadrado", "por_pie_lineal"].includes(product.price_type);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Encabezado con nombre del producto */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-900 text-gray-900">{product.name}</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
          {product.code}
        </p>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Inputs de Medidas (si aplica) */}
        {showMeasures && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">
              Medidas (en pulgadas)
            </label>

            {/* Ancho */}
            <div>
              <label className="text-[10px] text-gray-600 font-bold uppercase mb-2 block">
                Ancho (ej: 36 1/2)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                placeholder="36 1/2"
                autoFocus
                className="w-full h-14 px-4 text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#F97316] focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Alto */}
            <div>
              <label className="text-[10px] text-gray-600 font-bold uppercase mb-2 block">
                Alto (ej: 48 1/4)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                placeholder="48 1/4"
                className="w-full h-14 px-4 text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#F97316] focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Botón de Deducciones */}
            <div className="pt-2">
              <button
                onClick={() => setShowDeductions(!showDeductions)}
                className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                📐 {showDeductions ? "Cerrar Deducciones" : "Calcular Deducciones (Gaps)"}
              </button>
            </div>

            {/* Panel de Deducciones */}
            {showDeductions && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <DeductionsPanel
                  width={parseFraction(widthInput)}
                  height={parseFraction(heightInput)}
                  onApplyDeductions={handleApplyDeductions}
                />
              </div>
            )}
          </div>
        )}

        {/* Cantidad */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Cantidad
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
              className="flex-1 h-16 bg-white border-2 border-gray-200 rounded-2xl font-bold text-2xl text-gray-900 hover:bg-gray-50 active:scale-95 transition-all shadow-md"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value || "1")}
              className="flex-1 h-16 px-4 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#F97316] focus:bg-white outline-none transition-all shadow-md"
            />
            <button
              onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
              className="flex-1 h-16 bg-white border-2 border-gray-200 rounded-2xl font-bold text-2xl text-gray-900 hover:bg-gray-50 active:scale-95 transition-all shadow-md"
            >
              +
            </button>
          </div>
        </div>

        {/* Selector de Color */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">
            Color
          </label>
          <div className="grid grid-cols-5 gap-2">
            {["blanco", "aluminio", "negro", "bronce", "cristal"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-12 rounded-xl font-bold text-[10px] uppercase transition-all ${
                  color === c
                    ? "ring-2 ring-[#F97316] ring-offset-2"
                    : "border-2 border-gray-200"
                } shadow-md`}
              >
                {c.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Flotante de Precio (CRÍTICO) */}
      <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-[#F97316] to-orange-500 px-5 py-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-[10px] font-bold uppercase tracking-widest opacity-90">
              Total
            </p>
            <p className="text-white text-3xl font-900 leading-none">
              {formatUSD(lineTotal)}
            </p>
          </div>
          <button
            onClick={handleAddToQuote}
            disabled={showMeasures && (!widthInput || !heightInput)}
            className={`px-6 py-3 rounded-xl font-bold text-white uppercase tracking-widest transition-all ${
              showMeasures && (!widthInput || !heightInput)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-[#F97316] shadow-lg active:scale-95"
            }`}
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
