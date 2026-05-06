"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QuickCalculator } from "@/components/quote-builder/QuickCalculator";
import { formatUSD } from "@/lib/calculations";
import Image from "next/image";

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

// Mapeo de imágenes locales por categoría (fallback si no hay imagen_url)
const CAT_IMAGES: Record<string, string> = {
  puerta: "/products/puerta-sencilla-vidrio.png",
  ventana: "/products/ventana-corrediza.png",
  screen: "/products/screen-puerta.png",
  screen_ac: "/products/screen-ventana.png",
  closet: "/products/closet-cristal.png",
  garaje: "/products/puerta-doble-vidrio.png",
  miscelanea: "/products/ventana-fija.png",
};

// Mapeo específico por código de producto
const PRODUCT_IMAGES: Record<string, string> = {
  P001: "/products/puerta-sencilla-vidrio.png",
  P002: "/products/puerta-doble-vidrio.png",
  P003: "/products/puerta-pivot.png",
  V001: "/products/ventana-proyectante.png",
  V002: "/products/ventana-casement.png",
  V003: "/products/ventana-corrediza.png",
  V004: "/products/ventana-fija.png",
  S001: "/products/screen-puerta.png",
  S002: "/products/screen-puerta.png",
  S003: "/products/screen-ventana.png",
  C001: "/products/closet-cristal.png",
  C002: "/products/closet-cristal.png",
  C003: "/products/closet-cristal.png",
};

// Colores de acento por categoría
const CAT_ACCENT: Record<string, string> = {
  puerta: "#3B82F6",
  ventana: "#06B6D4",
  screen: "#14B8A6",
  screen_ac: "#6366F1",
  closet: "#8B5CF6",
  garaje: "#64748B",
  miscelanea: "#F97316",
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

  // ── Obtener imagen del producto ──
  const getProductImage = (p: Product): string => {
    if (p.imagen_url) return p.imagen_url;
    if (p.code && PRODUCT_IMAGES[p.code]) return PRODUCT_IMAGES[p.code];
    return CAT_IMAGES[p.category] || "/products/ventana-fija.png";
  };

  // ── Totales ──
  const subtotal = quoteItems.reduce((sum, item) => sum + item.line_total, 0);
  const ivu = subtotal * 0.115;
  const total = subtotal + ivu;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 font-bold text-sm">Cargando catálogo...</p>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Volver al catálogo
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

  // ── VISTA: CATÁLOGO PREMIUM (DARK THEME - LUMINIO KILLER) ──
  return (
    <div className="pb-32 bg-[#0F172A] min-h-screen">
      {/* Header sticky */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5 sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black text-white tracking-tight">Nueva Cotización</h1>
          {quoteItems.length > 0 && (
            <span className="bg-[#F97316] text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
              {quoteItems.length} {quoteItems.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#F97316]/30 focus:outline-none focus:border-[#F97316]/50 transition-all"
          />
        </div>
      </div>

      {/* Catálogo por categorías */}
      <div className="px-4 py-4 space-y-6">
        {groupedProducts.map(({ cat, label, products: catProducts }) => (
          <div key={cat}>
            {/* Header de categoría */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: CAT_ACCENT[cat] || "#F97316" }} />
              <h2 className="text-xs font-black text-white/80 uppercase tracking-wider">{label}</h2>
              <span className="ml-auto text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{catProducts.length}</span>
            </div>

            {/* Grid de productos - 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              {catProducts.map((p) => {
                const price = userPrices[p.id] ?? p.base_price;
                const imgSrc = getProductImage(p);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2.5 text-left active:scale-[0.96] hover:bg-white/[0.06] hover:border-[#F97316]/30 transition-all duration-200"
                  >
                    {/* Imagen del producto */}
                    <div className="w-full aspect-square bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-xl mb-2.5 flex items-center justify-center overflow-hidden border border-white/[0.05]">
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="w-[85%] h-[85%] object-contain drop-shadow-lg"
                      />
                    </div>

                    {/* Info */}
                    <p className="text-[11px] font-bold text-white/90 leading-tight line-clamp-2 mb-1.5">
                      {p.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30 font-medium">{p.code}</span>
                      <span className="text-xs font-black text-[#F97316]">{formatUSD(price)}</span>
                    </div>

                    {/* Hover/Active indicator */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#F97316] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity shadow-lg shadow-orange-500/30">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
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
            <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-white/50 font-bold">No se encontraron productos</p>
            <p className="text-white/30 text-sm mt-1">Intenta con otro término</p>
          </div>
        )}
      </div>

      {/* Panel flotante de items agregados */}
      {quoteItems.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t-2 border-[#F97316] shadow-[0_-8px_30px_rgba(0,0,0,0.3)] z-30 max-h-[45vh] overflow-y-auto rounded-t-2xl">
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
                  <p className="text-[10px] text-gray-500">{item.width_inches}&quot; x {item.height_inches}&quot; · {item.quantity}u</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <p className="text-sm font-black text-[#F97316]">{formatUSD(item.line_total)}</p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
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
              {isSaving ? "Guardando..." : "Guardar Cotización"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
