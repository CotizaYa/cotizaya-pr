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
}

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
      alert("Error al guardar el precio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider mb-1">
            {product.code || "S/C"}
          </span>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight">
            {product.name}
          </h3>
        </div>
        <div className="bg-gray-50 px-2 py-1 rounded-md">
          <span className="text-[10px] text-gray-400 font-medium">
            {product.price_type.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setHasChanged(true);
            }}
            onBlur={handleBlur}
            className={`w-full pl-7 pr-4 py-2 bg-gray-50 border ${
              hasChanged ? "border-orange-200" : "border-transparent"
            } rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 outline-none transition-all`}
            placeholder="0.00"
          />
        </div>
        
        <div className="flex flex-col items-end min-w-[80px]">
          {isSaving ? (
            <span className="text-[10px] text-[#F97316] font-bold animate-pulse">
              GUARDANDO...
            </span>
          ) : hasChanged ? (
            <span className="text-[10px] text-gray-400 font-medium">
              PENDIENTE
            </span>
          ) : (
            <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
              ✓ GUARDADO
            </span>
          )}
          <span className="text-[9px] text-gray-400 uppercase mt-1">
            Precio x {product.unit_label || "u"}
          </span>
        </div>
      </div>
    </div>
  );
}
