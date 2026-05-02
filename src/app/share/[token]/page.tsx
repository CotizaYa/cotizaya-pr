import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatUSD } from "@/lib/calculations";
import { QuoteAcceptance } from "./QuoteAcceptance";

const CAT: Record<string,string> = { puerta:"Puertas / Portones", ventana:"Ventanas", closet:"Closets", screen:"Screen", aluminio:"Perfiles de Aluminio", cristal:"Cristales", tornilleria:"Tornillería", miscelanea:"Miscelánea" };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_public_quote", { p_token: token });
  if (!data) notFound();

  const quote = data as any;

  await supabase.rpc("log_quote_event", { p_token: token, p_event: "viewed", p_payload: {} });

  const grouped: Record<string, any[]> = {};
  for (const item of quote.items ?? []) {
    const cat = item.category_snapshot ?? "miscelanea";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#f97316", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"20px", fontWeight:800, color:"white" }}>
            <span style={{ opacity:0.85 }}>Cotiza</span>Ya<span style={{ fontSize:"14px" }}>PR</span>
          </h1>
          {quote.profile?.business_name && (
            <p style={{ margin:"2px 0 0", fontSize:"12px", color:"rgba(255,255,255,0.8)" }}>{quote.profile.business_name}</p>
          )}
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ margin:0, fontSize:"11px", color:"rgba(255,255,255,0.7)" }}>Cotización</p>
          <p style={{ margin:0, fontSize:"16px", fontWeight:700, color:"white" }}>#{quote.quote_number}</p>
        </div>
      </div>

      <div style={{ maxWidth:"640px", margin:"0 auto", padding:"20px 16px" }}>
        {quote.client && (
          <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"14px", marginBottom:"14px" }}>
            <p style={{ margin:"0 0 2px", fontSize:"10px", fontWeight:700, textTransform:"uppercase", color:"#a3a3a3" }}>Preparado para</p>
            <p style={{ margin:0, fontSize:"15px", fontWeight:600, color:"#171717" }}>{quote.client.full_name}</p>
          </div>
        )}

        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden", marginBottom:"14px" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5" }}>
            <p style={{ margin:0, fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:"#525252" }}>Detalle</p>
          </div>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div style={{ background:"#fafafa", padding:"6px 16px", borderBottom:"1px solid #f5f5f5" }}>
                <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", color:"#737373" }}>■ {CAT[cat]??cat}</span>
              </div>
              {items.map((item:any) => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 16px", borderBottom:"1px solid #fafafa" }}>
                  <div>
                    <p style={{ margin:0, fontSize:"13px", color:"#171717" }}>{item.name_snapshot}</p>
                    {item.metadata?.color && <p style={{ margin:0, fontSize:"11px", color:"#a3a3a3" }}>{item.metadata.color} · Cant: {item.quantity}</p>}
                  </div>
                  <span style={{ fontSize:"13px", fontWeight:600 }}>{formatUSD(item.line_total)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"16px", marginBottom:"14px" }}>
          {[["Subtotal", Number(quote.subtotal_materials)+Number(quote.subtotal_labor)], [`IVU (${(Number(quote.ivu_rate)*100).toFixed(1)}%)`, quote.ivu_amount]].map(([l,v])=>(
            <div key={String(l)} style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
              <span style={{ fontSize:"13px", color:"#737373" }}>{l}</span>
              <span style={{ fontSize:"13px" }}>{formatUSD(Number(v))}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e5e5e5", paddingTop:"10px", marginTop:"6px" }}>
            <span style={{ fontSize:"16px", fontWeight:700 }}>TOTAL</span>
            <span style={{ fontSize:"16px", fontWeight:700, color:"#f97316" }}>{formatUSD(quote.total)}</span>
          </div>
          <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"8px", padding:"10px 14px", marginTop:"12px" }}>
            <p style={{ margin:0, fontSize:"13px", fontWeight:700, color:"#c2410c" }}>Depósito para iniciar trabajo</p>
            <p style={{ margin:"2px 0 0", fontSize:"20px", fontWeight:800, color:"#f97316" }}>{formatUSD(quote.deposit_amount)}</p>
            <p style={{ margin:"2px 0 0", fontSize:"11px", color:"#ea580c" }}>Balance al completar: {formatUSD(Number(quote.total)-Number(quote.deposit_amount))}</p>
          </div>
        </div>

        {["draft","sent","viewed"].includes(quote.status) && (
          <QuoteAcceptance token={token} />
        )}
        {quote.status === "accepted" && (
          <div style={{ background:"#dcfce7", border:"1px solid #86efac", borderRadius:"12px", padding:"16px", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:"16px", fontWeight:700, color:"#15803d" }}>✓ Cotización Aprobada</p>
            <p style={{ margin:"4px 0 0", fontSize:"13px", color:"#166534" }}>El contratista estará en contacto pronto.</p>
          </div>
        )}
      </div>
    </div>
  );
}
