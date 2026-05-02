import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PriceTable } from "./PriceTable";

const CAT_ORDER = ["puerta","ventana","closet","screen","aluminio","cristal","tornilleria","miscelanea"];
const CAT_LABEL: Record<string,string> = { puerta:"Puertas", ventana:"Ventanas", closet:"Closets", screen:"Screen", aluminio:"Aluminio / Perfiles", cristal:"Cristales", tornilleria:"Tornillería", miscelanea:"Miscelánea" };

export default async function PreciosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: products }, { data: userPrices }] = await Promise.all([
    supabase.from("products").select("id,code,name,category,price_type,base_price,unit_label").or(`owner_id.is.null,owner_id.eq.${user.id}`).eq("is_active",true).order("category").order("code"),
    supabase.from("user_prices").select("product_id, price").eq("user_id", user.id),
  ]);

  const priceMap = new Map((userPrices??[]).map(p=>[p.product_id, Number(p.price)]));
  const grouped = CAT_ORDER.map(cat=>({ cat, label:CAT_LABEL[cat]??cat, products:(products??[]).filter(p=>p.category===cat) })).filter(g=>g.products.length>0);

  return (
    <div style={{ padding:"24px", maxWidth:"900px", margin:"0 auto" }}>
      <div style={{ marginBottom:"16px" }}>
        <h1 style={{ margin:0, fontSize:"20px", fontWeight:700, color:"#171717" }}>Mis Precios</h1>
        <p style={{ margin:"4px 0 0", fontSize:"13px", color:"#737373" }}>Edita tus precios — el campo se guarda automáticamente al salir.</p>
      </div>
      <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"10px", padding:"10px 14px", marginBottom:"16px", fontSize:"13px", color:"#1d4ed8" }}>
        💡 El cliente nunca ve los precios unitarios, solo el total final.
      </div>
      {grouped.map(({ cat, label, products: prods }) => (
        <PriceTable key={cat} label={label} products={prods} priceMap={priceMap} />
      ))}
    </div>
  );
}
