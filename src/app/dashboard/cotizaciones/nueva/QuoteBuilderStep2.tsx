"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { calcLineTotal, formatUSD, parseFraction } from "@/lib/calculations";

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

const CATEGORY_ICONS: Record<string, string> = {
  puerta: "",
  ventana: "",
  screen: "",
  screen_ac: "",
  closet: "",
  garaje: "",
  miscelanea: "",
};

const COLORS = [
  { name: "Blanco", value: "blanco", hex: "#FFFFFF" },
  { name: "Aluminio", value: "aluminio", hex: "#A8A8A8" },
  { name: "Negro", value: "negro", hex: "#1F1F1F" },
  { name: "Bronce", value: "bronce", hex: "#8B6F47" },
  { name: "Cristal", value: "cristal", hex: "#E8F4F8" },
];

export function QuoteBuilderStep2({ product, userPrice }: QuoteBuilderStep2Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [color, setColor] = useState("blanco");
  const [notes, setNotes] = useState("");
  const [lineTotal, setLineTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  //  CORRECCIÓN 1: useEffect con lógica de cálculo correcta 
  useEffect(() => {
    if (product.price_type === "por_unidad") {
      // Para productos por unidad, solo multiplica precio × cantidad
      const qty = parseInt(quantity) || 1;
      setLineTotal(userPrice * qty);
    } else {
      // Para medidas (pie cuadrado, pie lineal), calcula con dimensiones
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

  const handleAddToQuote = async () => {
    if (!widthInput && product.price_type !== "por_unidad") {
      alert("Por favor ingresa ancho y alto");
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
      alert("Error al procesar. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  //  CORRECCIÓN 2: Mostrar cantidad SIEMPRE 
  const showMeasures = ["por_pie_cuadrado", "por_pie_lineal"].includes(product.price_type);
  const showQuantity = true; // ← SIEMPRE visible

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-sm font-black text-gray-900">
          Paso 2 de 3: <span className="text-[#F97316]">Medidas</span>
        </h1>
        <p className="text-[10px] text-gray-400 font-medium mt-1">
          {product.name}
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Resumen del Producto */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
          <span className="text-3xl">{CATEGORY_ICONS[product.category] || ""}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-900">{product.name}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              Código: {product.code}
            </p>
            <p className="text-[10px] text-[#F97316] font-bold mt-2">
              Precio Base: {formatUSD(userPrice)} x {product.unit_label || "u"}
            </p>
          </div>
        </div>

        {/* Inputs de Medidas (Condicional) */}
        {showMeasures && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">
                Ancho (pulgadas)
              </label>
              <input
                type="text"
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                placeholder="ej. 36 1/2"
                className="w-full h-16 px-4 text-xl font-bold bg-white border-2 border-gray-200 rounded-2xl focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              <p className="text-[9px] text-gray-400 font-medium mt-1">
                Acepta fracciones: 36, 36 1/2, 36 1/4, etc.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">
                Alto (pulgadas)
              </label>
              <input
                type="text"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                placeholder="ej. 72"
                className="w-full h-16 px-4 text-xl font-bold bg-white border-2 border-gray-200 rounded-2xl focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Cantidad (SIEMPRE visible) */}
        {showQuantity && (
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              Cantidad
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                className="flex-1 h-14 bg-white border-2 border-gray-200 rounded-2xl font-bold text-lg text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value || "1")}
                className="flex-1 h-14 px-4 text-center text-xl font-bold bg-white border-2 border-gray-200 rounded-2xl focus:border-[#F97316] outline-none"
              />
              <button
                onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                className="flex-1 h-14 bg-white border-2 border-gray-200 rounded-2xl font-bold text-lg text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Selector de Color */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-3">
            Color (Opcional)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map(({ name, value, hex }) => (
              <button
                key={value}
                onClick={() => setColor(value)}
                className={`h-12 rounded-xl border-2 transition-all ${
                  color === value
                    ? "border-[#F97316] ring-2 ring-orange-200"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: hex }}
                title={name}
              >
                {color === value && (
                  <span className="text-white font-bold text-lg"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notas Opcionales */}
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-2">
            Notas (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Instalación incluida, vidrio especial, etc."
            className="w-full h-20 px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-2xl focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
          />
        </div>

        {/* Cálculo en Vivo */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border-2 border-[#F97316]">
          <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">
            Total de Este Ítem
          </p>
          <p className="text-3xl font-black text-[#F97316] mt-2">
            {formatUSD(lineTotal)}
          </p>
          <p className="text-[9px] text-gray-600 font-medium mt-2">
            {showMeasures
              ? `${parseFraction(widthInput)}" × ${parseFraction(heightInput)}" × ${quantity} unidades`
              : `${quantity} unidades`}
          </p>
        </div>
      </div>

      {/* Botón de Acción Flotante */}
      <div className="fixed bottom-24 left-4 right-4">
        <button
          onClick={handleAddToQuote}
          disabled={isLoading || (showMeasures && (!widthInput || !heightInput))}
          className={`w-full h-14 rounded-2xl font-bold text-white uppercase tracking-widest transition-all ${
            isLoading || (showMeasures && (!widthInput || !heightInput))
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#F97316] shadow-xl active:scale-95"
          }`}
        >
          {isLoading ? "Procesando..." : "Añadir a Cotización →"}
        </button>
      </div>
    </div>
  );
}
