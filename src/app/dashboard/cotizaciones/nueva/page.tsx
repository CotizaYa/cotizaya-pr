"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QuickCalculator } from "@/components/quote-builder/QuickCalculator";
import { formatUSD } from "@/lib/calculations";

interface Product {
  id: string;
  code: string | null;
  name: string;
  category: string;
  price_type: string;
  base_price: number;
  unit_label: string | null;
  is_active: boolean;
  imagen_url?: string | null;
}

interface QuoteItem {
  id: string;
  product_id: string;
  product_snapshot: any;
  width_inches: number;
  height_inches: number;
  quantity: number;
  color: string;
  line_total: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  puerta: "🚪",
  ventana: "🪟",
  screen: "🛡️",
  screen_ac: "❄️",
  closet: "📦",
  garaje: "🚗",
  miscelanea: "🔧",
};

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [userPrices, setUserPrices] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ── CARGAR DATOS INICIALES ──
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [productsRes, pricesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, code, name, category, price_type, base_price, unit_label, is_active, imagen_url")
          .or(`owner_id.is.null,owner_id.eq.${user.id}`)
          .eq("is_active", true)
          .order("category")
          .order("code"),
        supabase
          .from("user_prices")
          .select("product_id, price")
          .eq("user_id", user.id),
      ]);

      setProducts(productsRes.data ?? []);

      // Crear mapa de precios personalizados
      const priceMap: Record<string, number> = {};
      (pricesRes.data ?? []).forEach(({ product_id, price }) => {
        priceMap[product_id] = price;
      });
      setUserPrices(priceMap);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // ── AGRUPAR PRODUCTOS POR CATEGORÍA ──
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // ── AGREGAR ITEM A LA COTIZACIÓN ──
  const handleAddToQuote = (item: any) => {
    const newItem: QuoteItem = {
      id: Math.random().toString(),
      ...item,
    };
    setQuoteItems([...quoteItems, newItem]);
    setSelectedProduct(null); // Vuelve al selector
  };

  // ── ELIMINAR ITEM DE LA COTIZACIÓN ──
  const handleRemoveItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  // ── GUARDAR COTIZACIÓN ──
  const handleSaveQuote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || quoteItems.length === 0) return;

    setIsSaving(true);

    const subtotal = quoteItems.reduce((sum, item) => sum + item.line_total, 0);
    const ivu = subtotal * 0.115;
    const total = subtotal + ivu;

    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        status: "draft",
        subtotal,
        ivu_amount: ivu,
        ivu_rate: 0.115,
        total,
        deposit_amount: total * 0.5,
      })
      .select()
      .single();

    if (error || !quote) {
      console.error("Error al guardar cotización:", error);
      setIsSaving(false);
      return;
    }

    await supabase.from("quote_items").insert(
      quoteItems.map((item, index) => ({
        quote_id: quote.id,
        product_id: item.product_id,
        product_snapshot: item.product_snapshot,
        width_inches: item.width_inches,
        height_inches: item.height_inches,
        quantity: item.quantity,
        color: item.color,
        line_total: item.line_total,
        position: index,
      }))
    );

    setIsSaving(false);
    router.push(`/dashboard/cotizaciones/${quote.id}`);
  };

  // ── CALCULAR TOTAL ──
  const subtotal = quoteItems.reduce((sum, item) => sum + item.line_total, 0);
  const ivu = subtotal * 0.115;
  const total = subtotal + ivu;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-500 font-bold">Cargando...</p>
      </div>
    );
  }

  // ── VISTA: SELECTOR DE PRODUCTOS ──
  if (!selectedProduct) {
    return (
      <div className="pb-32">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h1 className="text-3xl font-900 text-gray-900">Nueva Cotización</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            Selecciona un producto para empezar
          </p>
        </div>

        {/* Contenido */}
        <div className="px-5 py-6 space-y-8">
          {/* Mostrar categorías */}
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{CATEGORY_ICONS[category] || "📦"}</span>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  {category}
                </h2>
              </div>

              {/* Grid de Productos (2 columnas) */}
              <div className="grid grid-cols-2 gap-3">
                {categoryProducts.map(product => {
                  const userPrice = userPrices[product.id] ?? product.base_price;
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#F97316] hover:bg-orange-50 active:scale-95 transition-all shadow-md gap-3"
                    >
                      {product.imagen_url ? (
                        <img 
                          src={product.imagen_url} 
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {product.code?.charAt(0) || "📦"}
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-[11px] font-black text-gray-900 line-clamp-2 leading-tight">
                          {product.name}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                          {product.code}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Lista de Ítems Agregados (Flotante) */}
        {quoteItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl max-h-[50vh] overflow-y-auto">
            {/* Lista de Ítems */}
            <div className="p-5 space-y-2">
              {quoteItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {item.product_snapshot.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {item.width_inches}" × {item.height_inches}" × {item.quantity}u
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-[#F97316]">
                      {formatUSD(item.line_total)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-400 font-bold text-lg hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen y Botón */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900">{formatUSD(subtotal)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">IVU (11.5%)</p>
                  <p className="text-lg font-bold text-gray-900">{formatUSD(ivu)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">Total</p>
                  <p className="text-2xl font-900 text-[#F97316]">{formatUSD(total)}</p>
                </div>
              </div>

              <button
                onClick={handleSaveQuote}
                disabled={isSaving}
                className="w-full h-14 bg-[#F97316] text-white font-bold uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-orange-600 disabled:bg-gray-400"
              >
                {isSaving ? "Guardando..." : "Guardar Cotización"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VISTA: CALCULADORA RÁPIDA ──
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Botón de Atrás */}
      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-[#F97316] transition-colors"
        >
          ← Volver a Productos
        </button>
      </div>

      {/* Calculadora */}
      <QuickCalculator
        product={selectedProduct}
        userPrice={userPrices[selectedProduct.id] ?? selectedProduct.base_price}
        onAddToQuote={handleAddToQuote}
      />
    </div>
  );
}
