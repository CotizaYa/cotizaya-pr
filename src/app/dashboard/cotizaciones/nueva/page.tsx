'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QuickCalculator } from "@/components/quote-builder/QuickCalculator";
import { formatUSD } from "@/lib/calculations";
import { ChevronLeft, Search, Package } from "lucide-react";

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
  miscelanea: "ICON_PACKAGE",
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("No autenticado");
          return;
        }

        // Cargar productos
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true);

        if (productsError) {
          console.error("Error cargando productos:", productsError);
          setError("Error al cargar productos");
          return;
        }

        setProducts(productsData ?? []);

        // Cargar precios del usuario
        const { data: pricesData, error: pricesError } = await supabase
          .from("user_prices")
          .select("*")
          .eq("user_id", user.id);

        if (pricesError) {
          console.error("Error cargando precios:", pricesError);
        }

        const pricesMap: Record<string, number> = {};
        (pricesData ?? []).forEach((p: any) => {
          pricesMap[p.product_id] = p.price;
        });
        setUserPrices(pricesMap);
      } catch (err) {
        console.error("Error en loadData:", err);
        setError("Error al cargar datos");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [supabase]);

  const groupedProducts = CAT_ORDER.map((cat) => ({
    cat,
    label: CAT_LABEL[cat],
    products: products
      .filter((p) => p.category === cat)
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
  })).filter((g) => g.products.length > 0);

  const handleAddToQuote = (item: any) => {
    const newItem: QuoteItem = {
      id: Math.random().toString(),
      product_id: item.product_id,
      product_snapshot: item.product_snapshot,
      width_inches: item.width_inches,
      height_inches: item.height_inches,
      quantity: item.quantity,
      color: item.color,
      line_total: item.line_total,
    };

    setQuoteItems([...quoteItems, newItem]);
    setSelectedProduct(null);
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

  const getProductImage = (p: Product): string => {
    if (p.imagen_url) return p.imagen_url;
    if (p.code && PRODUCT_IMAGES[p.code]) return PRODUCT_IMAGES[p.code];
    return CAT_IMAGES[p.category] || "ICON_PACKAGE";
  };

  const renderProductImage = (imagePath: string) => {
    if (imagePath === "ICON_PACKAGE") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
      );
    }
    return (
      <img
        src={imagePath}
        alt="Producto"
        className="w-full h-full object-contain drop-shadow-lg"
      />
    );
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest hover:text-[#F97316] transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
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

  return (
    <div className="pb-32 bg-[#0F172A] min-h-screen">
      <div className="px-4 pt-4 pb-3 border-b border-white/5 sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-20">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black text-white tracking-tight">Nueva Cotización</h1>
          {quoteItems.length > 0 && (
            <span className="bg-[#F97316] text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
              {quoteItems.length} {quoteItems.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-[#F97316]/30 focus:outline-none focus:border-[#F97316]/50 transition-all"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {groupedProducts.map(({ cat, label, products: catProducts }) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-5 rounded-full" style={{ backgroundColor: CAT_ACCENT[cat] || "#F97316" }} />
              <h2 className="text-xs font-black text-white/80 uppercase tracking-wider">{label}</h2>
              <span className="ml-auto text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{catProducts.length}</span>
            </div>

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
                    <div className="w-full aspect-square bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-xl mb-2.5 flex items-center justify-center overflow-hidden border border-white/[0.05]">
                      {renderProductImage(imgSrc)}
                    </div>

                    <p className="text-[11px] font-bold text-white/90 leading-tight line-clamp-2 mb-1.5">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-white/50 mb-2">{formatUSD(price)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {quoteItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Subtotal</p>
              <p className="text-lg font-black text-gray-900">{formatUSD(subtotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-black text-[#F97316]">{formatUSD(total)}</p>
            </div>
          </div>
          <button
            onClick={handleSaveQuote}
            disabled={isSaving}
            className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "GUARDAR COTIZACIÓN"}
          </button>
        </div>
      )}
    </div>
  );
}
