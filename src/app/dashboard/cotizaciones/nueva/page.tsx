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

const CAT_ORDER = ["puerta", "ventana", "screen", "screen_ac", "closet", "garaje", "miscelanea"];

const CAT_LABEL: Record<string, string> = {
  puerta: "Puertas",
  ventana: "Ventanas",
  screen: "Screens",
  screen_ac: "Screen A/C",
  closet: "Closets",
  garaje: "Garaje",
  miscelanea: "Servicios",
};

const CAT_ICONS: Record<string, string> = {
  puerta: "🚪",
  ventana: "🪟",
  screen: "🛡️",
  screen_ac: "❄️",
  closet: "👔",
  garaje: "🚗",
  miscelanea: "🔧",
};

const CAT_COLORS: Record<string, string> = {
  puerta: "from-blue-500 to-blue-600",
  ventana: "from-cyan-500 to-cyan-600",
  screen: "from-teal-500 to-teal-600",
  screen_ac: "from-indigo-500 to-indigo-600",
  closet: "from-purple-500 to-purple-600",
  garaje: "from-slate-600 to-slate-700",
  miscelanea: "from-orange-500 to-orange-600",
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
  const [searchTerm, setSearchTerm] = useState("");

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
      const priceMap: Record<string, number> = {};
      (pricesRes.data ?? []).forEach(({ product_id, price }) => {
        priceMap[product_id] = price;
      });
      setUserPrices(priceMap);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // ── Filtrar y agrupar productos ──
  const filteredProducts = searchTerm
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : products;

  const groupedProducts = CAT_ORDER
    .map(cat => ({
      cat,
      label: CAT_LABEL[cat] ?? cat,
      icon: CAT_ICONS[cat] ?? "📦",
      color: CAT_COLORS[cat] ?? "from-gray-500 to-gray-600",
      products: filteredProducts.filter(p => p.category === cat),
    }))
    .filter(g => g.products.length > 0);

  // ── Handlers ──
  const handleAddToQuote = (item: any) => {
    const newItem: QuoteItem = { id: Math.random().toString(), ...item };
    setQuoteItems([...quoteItems, newItem]);
    setSelectedProduct(null);
  };

  const handleRemoveItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const handleSaveQuote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || quoteItems.length === 0) return;

    setIsSaving(true);
    const subtotalVal = quoteItems.reduce((sum, item) => sum + item.line_total, 0);
    const ivu = subtotalVal * 0.115;
    const total = subtotalVal + ivu;

    // Generar quote_number único: COT-YYYY-NNN
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900) + 100;
    const quoteNumber = `COT-${year}-${rand}`;

    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        owner_id: user.id,
        quote_number: quoteNumber,
        status: "draft",
        subtotal_materials: subtotalVal,
        subtotal_labor: 0,
        ivu_amount: ivu,
        ivu_rate: 0.115,
        total,
        deposit_rate: 0.50,
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
        name_snapshot: item.product_snapshot.name,
        category_snapshot: item.product_snapshot.category || "miscelanea",
        price_type_snapshot: item.product_snapshot.price_type || "sqft",
        unit_price_snapshot: item.product_snapshot.base_price,
        width_inches: item.width_inches,
        height_inches: item.height_inches,
        quantity: item.quantity,
        line_total: item.line_total,
        metadata: { color: item.color, product_snapshot: item.product_snapshot },
        position: index,
      }))
    );

    setIsSaving(false);
    router.push(`/dashboard/cotizaciones/${quote.id}`);
  };

  // ── Totales ──
  const subtotal = quoteItems.reduce((sum, item) => sum + item.line_total, 0);
  const ivu = subtotal * 0.115;
  const total = subtotal + ivu;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-bold text-sm">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  // ── VISTA: CALCULADORA ──
  if (selectedProduct) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-[#F97316] transition-colors active:scale-95"
          >
            <span className="text-lg">←</span> Volver
          </button>
        </div>
        <QuickCalculator
          product={selectedProduct}
          userPrice={userPrices[selectedProduct.id] ?? selectedProduct.base_price}
          onAddToQuote={handleAddToQuote}
        />
      </div>
    );
  }

  // ── VISTA: CATÁLOGO PREMIUM ──
  return (
    <div className="pb-32 bg-white min-h-screen">
      {/* Header sticky */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black text-[#0F172A] tracking-tight">Nueva Cotización</h1>
          {quoteItems.length > 0 && (
            <span className="bg-[#F97316] text-white text-xs font-black px-2.5 py-1 rounded-full">
              {quoteItems.length} items
            </span>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#F97316]/30 focus:outline-none transition-all border border-transparent focus:border-[#F97316]/30"
          />
        </div>
      </div>

      {/* Catálogo por categorías */}
      <div className="px-4 py-4 space-y-5">
        {groupedProducts.map(({ cat, label, icon, color, products: catProducts }) => (
          <div key={cat}>
            {/* Header de categoría con gradiente */}
            <div className={`flex items-center gap-2 mb-2.5 px-3 py-2 rounded-xl bg-gradient-to-r ${color} shadow-sm`}>
              <span className="text-lg">{icon}</span>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">{label}</h2>
              <span className="ml-auto text-[10px] font-bold text-white/70">{catProducts.length}</span>
            </div>

            {/* Grid de productos - 2 columnas en móvil */}
            <div className="grid grid-cols-2 gap-2">
              {catProducts.map((p) => {
                const price = userPrices[p.id] ?? p.base_price;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="group relative bg-white border-2 border-gray-100 rounded-xl p-3 text-left active:scale-[0.97] active:border-[#F97316] hover:border-[#F97316]/50 hover:shadow-md transition-all"
                  >
                    {/* Imagen o icono */}
                    <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-gray-100">
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl opacity-60">{icon}</span>
                      )}
                    </div>

                    {/* Info */}
                    <p className="text-[11px] font-bold text-[#0F172A] leading-tight line-clamp-2 mb-1">
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">{p.code}</span>
                      <span className="text-xs font-black text-[#F97316]">{formatUSD(price)}</span>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#F97316] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold">+</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sin resultados */}
        {groupedProducts.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-gray-500 font-bold">No se encontraron productos</p>
            <p className="text-gray-400 text-sm mt-1">Intenta con otro término</p>
          </div>
        )}
      </div>

      {/* Panel flotante de items agregados */}
      {quoteItems.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t-2 border-[#F97316]/20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 max-h-[45vh] overflow-y-auto rounded-t-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Items */}
          <div className="px-4 pb-2 space-y-1.5">
            {quoteItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.product_snapshot.name}</p>
                  <p className="text-[10px] text-gray-500">{item.width_inches}" × {item.height_inches}" · {item.quantity}u</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <p className="text-sm font-black text-[#F97316]">{formatUSD(item.line_total)}</p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totales y CTA */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-orange-50/50 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase">Subtotal</p>
                <p className="text-sm font-bold text-gray-800">{formatUSD(subtotal)}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase">IVU 11.5%</p>
                <p className="text-sm font-bold text-gray-800">{formatUSD(ivu)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-500 font-bold uppercase">Total</p>
                <p className="text-xl font-black text-[#F97316]">{formatUSD(total)}</p>
              </div>
            </div>

            <button
              onClick={handleSaveQuote}
              disabled={isSaving}
              className="w-full h-12 bg-[#F97316] text-white font-black uppercase text-sm tracking-wider rounded-xl shadow-lg shadow-orange-200 active:scale-[0.97] transition-all hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none"
            >
              {isSaving ? "Guardando..." : "💾 Guardar Cotización"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
