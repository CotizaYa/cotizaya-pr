"use client";
import { useState } from "react";
import { upsertPrice } from "./actions";

interface Product {
  id: string;
  code: string | null;
  name: string;
  category: string;
  price_type: string;
  base_price: number;
  unit_label: string | null;
  imagen_url?: string | null;
}

const CAT_ICONS: Record<string, string> = {
  puerta: "🚪",
  ventana: "🪟",
  screen: "🛡️",
  screen_ac: "❄️",
  closet: "👔",
  garaje: "🚗",
  miscelanea: "🛠️"
};

export function PriceCard({ 
  product, 
  currentPrice 
}: { 
  product: Product; 
  currentPrice: number 
}) {
  const [price, setPrice] = useState(currentPrice.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleBlur = async () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice === currentPrice) {
      setHasChanged(false);
      return;
    }

    setIsSaving(true);
    try {
      await upsertPrice(product.id, newPrice);
      setHasChanged(false);
    } catch (error) {
      console.error("Error al guardar precio:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white border-b border-gray-100 p-3 hover:bg-orange-50/30 transition-colors">
      {/* Imagen o Icono de Categoría Compacto */}
      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100 overflow-hidden">
        {product.imagen_url ? (
          <img 
            src={product.imagen_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          CAT_ICONS[product.category] || "📦"
        )}
      </div>

      {/* Información del Producto - Prominente */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold text-[#F97316] bg-orange-50 px-1.5 py-0.5 rounded uppercase">
            {product.code}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            x {product.unit_label || "u"}
          </span>
        </div>
      </div>

      {/* Input de Precio - Optimizado para Pulgar */}
      <div className="relative w-28">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setHasChanged(true);
          }}
          onBlur={handleBlur}
          className={`w-full pl-6 pr-2 py-2.5 bg-gray-50 border-2 ${
            hasChanged ? "border-orange-300 bg-white" : "border-transparent"
          } rounded-xl text-sm font-black text-gray-800 text-right focus:bg-white focus:border-[#F97316] outline-none transition-all shadow-inner`}
          placeholder="0.00"
        />
        {isSaving && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#F97316] rounded-full animate-ping" />
        )}
      </div>
    </div>
  );
}
