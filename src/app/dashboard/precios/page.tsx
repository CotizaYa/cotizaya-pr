import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PriceCard } from "./PriceCard";

const CAT_ORDER = [
  "puerta", 
  "ventana", 
  "screen", 
  "screen_ac", 
  "closet", 
  "garaje", 
  "miscelanea"
];

const CAT_LABEL: Record<string, string> = { 
  puerta: "Puertas", 
  ventana: "Ventanas", 
  screen: "Screens", 
  screen_ac: "Screen A/C",
  closet: "Closets", 
  garaje: "Puertas de Garaje",
  miscelanea: "Servicios y Otros" 
};

export default async function PreciosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: products }, { data: userPrices }] = await Promise.all([
    supabase
      .from("products")
      .select("id, code, name, category, price_type, base_price, unit_label, imagen_url")
      .or(`owner_id.is.null,owner_id.eq.${user.id}`)
      .eq("is_active", true)
      .order("category")
      .order("code"),
    supabase
      .from("user_prices")
      .select("product_id, price")
      .eq("user_id", user.id),
  ]);

  const priceMap = new Map((userPrices ?? []).map(p => [p.product_id, Number(p.price)]));
  
  const grouped = CAT_ORDER.map(cat => ({ 
    cat, 
    label: CAT_LABEL[cat] ?? cat, 
    products: (products ?? []).filter(p => p.category === cat) 
  })).filter(g => g.products.length > 0);

  return (
    <div className="max-w-2xl mx-auto pb-24 bg-gray-50 min-h-screen">
      {/* Header Fijo o Prominente */}
      <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-black text-gray-900">
          Catálogo y <span className="text-[#F97316]">Precios</span>
        </h1>
        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">
          Ajusta tus márgenes de ganancia
        </p>
      </div>

      <div className="p-4">
        {grouped.map(({ cat, label, products: prods }) => (
          <div key={cat} className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Cabecera de Categoría */}
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
                {label}
              </h2>
              <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                {prods.length}
              </span>
            </div>
            
            {/* Lista de Productos */}
            <div className="divide-y divide-gray-50">
              {prods.map(product => (
                <PriceCard 
                  key={product.id} 
                  product={product} 
                  currentPrice={priceMap.get(product.id) ?? product.base_price}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Flotante de Ayuda Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap z-20">
        <span className="text-[#F97316]">💡</span> Los precios se guardan al salir del campo
      </div>
    </div>
  );
}
