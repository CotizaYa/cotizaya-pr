"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calcLineTotal, formatUSD, parseFraction } from "@/lib/calculations";
import { Calculator, Plus, Check } from "lucide-react";

interface Product {
  id: string;
  code: string | null;
  name: string;
  category: string;
  price_type: string;
  base_price: number;
  unit_label: string | null;
}

interface QuoteBuilderStep2Props {
  product: Product;
  userPrice: number;
}

const COLORS = [
  { name: "Blanco", value: "blanco", hex: "#FFFFFF", border: "border-gray-200" },
  { name: "Negro", value: "negro", hex: "#000000", border: "border-black" },
  { name: "Bronce", value: "bronce", hex: "#4A3728", border: "border-[#4A3728]" },
  { name: "Beige", value: "beige", hex: "#F5F5DC", border: "border-[#E1E1C0]" },
  { name: "Champagne", value: "champagne", hex: "#E7D1B1", border: "border-[#D4B991]" },
];

export function QuoteBuilderStep2({ product, userPrice }: QuoteBuilderStep2Props) {
  const router = useRouter();
  
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [color, setColor] = useState("blanco");
  const [notes, setNotes] = useState("");
  const [lineTotal, setLineTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product.price_type === "por_unidad") {
      const qty = parseInt(quantity) || 1;
      setLineTotal(userPrice * qty);
    } else {
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
  }, [widthInput, heightInput, quantity, userPrice, product.price_type]);

  const handleCalculateGaps = () => {
    // Lógica para calcular deducciones estándar en PR (ej. -1/4" para marcos)
    if (widthInput) {
      const w = parseFraction(widthInput);
      if (w > 0) setWidthInput((w - 0.25).toString());
    }
    if (heightInput) {
      const h = parseFraction(heightInput);
      if (h > 0) setHeightInput((h - 0.25).toString());
    }
  };

  const handleAddToQuote = async () => {
    if (!widthInput && product.price_type !== "por_unidad") {
      return;
    }

    setIsLoading(true);
    try {
      const width = product.price_type === "por_unidad" ? 0 : parseFraction(widthInput);
      const height = product.price_type === "por_unidad" ? 0 : parseFraction(heightInput);
      const qty = parseInt(quantity) || 1;

      const quoteItem = {
        product_id: product.id,
        product_snapshot: {
          code: product.code,
          name: product.name,
          category: product.category,
          price_type: product.price_type,
          base_price: userPrice,
        },
        width_inches: width,
        height_inches: height,
        quantity: qty,
        color,
        notes,
        line_total: lineTotal,
      };

      const existingItems = JSON.parse(sessionStorage.getItem("quoteItems") || "[]");
      existingItems.push(quoteItem);
      sessionStorage.setItem("quoteItems", JSON.stringify(existingItems));

      router.push("/dashboard/cotizaciones/nueva?step=3");
    } catch (error) {
      console.error("Error al añadir item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showMeasures = ["por_pie_cuadrado", "por_pie_lineal"].includes(product.price_type);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Paso 2: <span className="text-orange-600">Configuración</span>
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
          {product.name}
        </p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8 max-w-lg mx-auto w-full">
        {/* Medidas */}
        {showMeasures && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Ancho (")</label>
                <input
                  type="text"
                  value={widthInput}
                  onChange={(e) => setWidthInput(e.target.value)}
                  placeholder="ej. 36 1/2"
                  className="w-full h-14 px-4 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Alto (")</label>
                <input
                  type="text"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder="ej. 72"
                  className="w-full h-14 px-4 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Botón Deducciones Rediseñado */}
            <button
              onClick={handleCalculateGaps}
              className="w-full py-3 px-4 border border-gray-200 bg-white text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              Calcular Deducciones
            </button>
          </div>
        )}

        {/* Cantidad */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Cantidad</label>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
              className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-xl font-bold text-gray-400 hover:text-orange-600 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value || "1")}
              className="flex-1 text-center text-xl font-bold bg-transparent outline-none"
            />
            <button
              onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
              className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-xl font-bold text-gray-400 hover:text-orange-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Selector de Color Visual */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Color del Perfil</label>
          <div className="grid grid-cols-5 gap-3">
            {COLORS.map(({ name, value, hex, border }) => (
              <button
                key={value}
                onClick={() => setColor(value)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                    color === value
                      ? "border-orange-500 ring-4 ring-orange-50 scale-105"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color === value && (
                    <Check className={`w-5 h-5 ${value === 'blanco' || value === 'beige' ? 'text-gray-400' : 'text-white'}`} />
                  )}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tighter ${color === value ? 'text-orange-600' : 'text-gray-400'}`}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Notas del Item</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Vidrio oscurecido, screen incluido..."
            className="w-full h-24 px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none shadow-sm"
          />
        </div>

        {/* Resumen de Precio */}
        <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-600/20">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total del Item</p>
              <p className="text-3xl font-bold mt-1">{formatUSD(lineTotal)}</p>
            </div>
            <div className="text-right opacity-80">
              <p className="text-[10px] font-bold uppercase tracking-widest">Precio Unitario</p>
              <p className="text-sm font-bold">{formatUSD(userPrice)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Acción Inferior Derecho Corregido */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-20">
        <div className="max-w-lg mx-auto flex justify-end">
          <button
            onClick={handleAddToQuote}
            disabled={isLoading || (showMeasures && (!widthInput || !heightInput))}
            className="flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-orange-600/30 hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Agregar</span>
                <Plus className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
