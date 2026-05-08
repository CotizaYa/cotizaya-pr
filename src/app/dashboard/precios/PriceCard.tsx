"use client";
import { useState } from "react";
import { upsertPrice } from "./actions";
import { ProductVisual } from "@/components/product/ProductVisual";

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

const PRICE_TYPE_LABEL: Record<string, string> = {
  por_pie_cuadrado: 'pie²',
  por_pie_lineal:   'pie lineal',
  por_unidad:       'unidad',
}

export function PriceCard({ product, currentPrice }: { product: Product; currentPrice: number }) {
  const [price, setPrice] = useState(currentPrice.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleBlur = async () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice === currentPrice) { setHasChanged(false); return; }
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
      {/* Product visual render — igual que el catálogo */}
      <div className="flex-shrink-0 w-14 h-14 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <ProductVisual
          category={product.category}
          code={product.code}
          name={product.name}
          className="w-full h-full border-0 shadow-none rounded-none"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">
            {product.code}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            / {PRICE_TYPE_LABEL[product.price_type] || product.unit_label || 'u'}
          </span>
        </div>
      </div>

      {/* Price input */}
      <div className="relative w-28 shrink-0">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setHasChanged(true); }}
          onBlur={handleBlur}
          className={`w-full pl-6 pr-2 py-2.5 bg-gray-50 border-2 ${
            hasChanged ? "border-orange-300 bg-white" : "border-transparent"
          } rounded-xl text-sm font-black text-gray-800 text-right focus:bg-white focus:border-orange-500 outline-none transition-all`}
          placeholder="0.00"
        />
        {isSaving && <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
      </div>
    </div>
  );
}
