import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuoteBuilder } from "@/components/quote-builder/QuoteBuilder";

export default async function NuevaCotizacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: products }, { data: userPrices }, { data: clients }, { count }] = await Promise.all([
    supabase.from("products").select("*").or(`owner_id.is.null,owner_id.eq.${user.id}`).eq("is_active", true).order("category").order("code"),
    supabase.from("user_prices").select("product_id, price").eq("user_id", user.id),
    supabase.from("clients").select("id, full_name").eq("owner_id", user.id).order("full_name"),
    supabase.from("quotes").select("id", { count:"exact", head:true }).eq("owner_id", user.id),
  ]);

  const n = (count ?? 0) + 1;
  const suggestedNumber = `COT-${new Date().getFullYear()}-${String(n).padStart(3,"0")}`;

  return (
    <div style={{ padding:"20px" }}>
      <div style={{ marginBottom:"16px" }}>
        <h1 style={{ margin:0, fontSize:"20px", fontWeight:700, color:"#171717" }}>Nueva Cotización</h1>
        <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#737373" }}>Selecciona productos y agrega medidas</p>
      </div>
      <QuoteBuilder products={products ?? []} userPrices={userPrices ?? []} clients={clients ?? []} suggestedQuoteNumber={suggestedNumber} />
    </div>
  );
}
