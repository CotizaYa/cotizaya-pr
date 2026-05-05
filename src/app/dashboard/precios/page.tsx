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

  // Cargamos productos globales y personalizados del usuario
  const [{ data: products }, { data: userPrices }] = await Promise.all([
    supabase
      .from("products")
      .select("id, code, name, category, price_type, base_price, unit_label")
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Catálogo y <span className="text-[#F97316]">Mis Precios</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza tus precios de venta. El sistema usará estos valores en tus cotizaciones automáticamente.
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex items-start gap-3">
        <span className="text-lg">💡</span>
        <p className="text-xs text-orange-800 leading-relaxed">
          Los clientes **nunca** verán tus precios unitarios ni el costo base. Solo verán el total final de la cotización.
        </p>
      </div>

      <div className="space-y-10">
        {grouped.map(({ cat, label, products: prods }) => (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-[#F97316] rounded-full" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                {label}
              </h2>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {prods.length} ítems
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
}
