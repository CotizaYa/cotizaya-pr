"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QuickCalculator } from "@/components/quote-builder/QuickCalculator";
import { PremiumProductGrid } from "@/components/quote/PremiumProductGrid";
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
        {/* Header compacto */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 sticky top-12 md:top-0 bg-white/95 backdrop-blur-md z-10">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Nueva Cotización</h1>
        </div>

        {/* Lista de productos compacta */}
        <div className="px-4 py-3">
          {/* Lista simple con iconos por categoría */}
          {Object.entries(groupedProducts).map(([cat, catProducts]) => (
            <div key={cat} className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="text-base">{CATEGORY_ICONS[cat] || '📦'}</span>
                {cat}
              </p>
              <div className="space-y-1">
                {catProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="w-full flex items-center justify-between px-3 py-3 bg-gray-50 rounded-xl active:scale-[0.98] active:bg-orange-50 transition-all"
                  >
                    <span className="font-semibold text-sm text-[#0F172A] text-left">{p.name}</span>
                    <span className="text-xs font-bold text-[#F97316] whitespace-nowrap ml-2">
                      {formatUSD(userPrices[p.id] ?? p.base_price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {/* Grid Premium (oculto en móvil, visible en desktop) */}
          <div className="hidden md:block">
          <PremiumProductGrid
            products={products.map(p => ({
              code: p.code || "",
              name: p.name,
              category: p.category,
              image: p.imagen_url || undefined,
              price: userPrices[p.id] ?? p.base_price,
              description: `${p.category.toUpperCase()} - ${p.price_type.replace("_", " ")}`,
            }))}
            onSelect={(product: any) => {
              setSelectedProduct(product);
            }}
            groupByCategory={true}
          />
          </div>
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
