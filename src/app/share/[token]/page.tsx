// v6
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatUSD } from "@/lib/calculations";
import { QuoteAcceptance } from "./QuoteAcceptance";

const CAT: Record<string, string> = {
  puerta: "Puertas / Portones", ventana: "Ventanas", closet: "Closets",
  screen: "Screen", aluminio: "Perfiles de Aluminio", cristal: "Cristales",
  tornilleria: "Tornillería", miscelanea: "Miscelánea",
};

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

  const today = new Date().toLocaleDateString("es-PR", { year: "numeric", month: "long", day: "numeric" });
  const validUntil = quote.valid_until
    ? new Date(quote.valid_until).toLocaleDateString("es-PR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #F0EDE8; }
        @media print { body { background: white; } .no-print { display: none !important; } .page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.5s ease 0.1s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.5s ease 0.2s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.5s ease 0.3s forwards; opacity: 0; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#F0EDE8", padding:"32px 16px 60px", fontFamily:"'Outfit', sans-serif" }}>
        <div className="no-print" style={{ maxWidth:"760px", margin:"0 auto 16px", display:"flex", justifyContent:"flex-end" }}>
          <button onClick={() => window.print()}
            style={{ background:"white", border:"1px solid #d4cfc9", borderRadius:"8px", padding:"8px 16px", fontSize:"13px", fontWeight:500, cursor:"pointer", color:"#6b6560", fontFamily:"'Outfit', sans-serif" }}>
            🖨 Imprimir
          </button>
        </div>

        <div className="page fade-up" style={{ maxWidth:"760px", margin:"0 auto", background:"white", borderRadius:"20px", overflow:"hidden", boxShadow:"0 4px 40px rgba(0,0,0,0.08)" }}>

          {/* HEADER */}
          <div style={{ background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"200px", height:"200px", background:"rgba(249,115,22,0.15)", borderRadius:"50%" }} />
            <div style={{ position:"absolute", bottom:"-60px", right:"80px", width:"140px", height:"140px", background:"rgba(249,115,22,0.08)", borderRadius:"50%" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
              <div>
                <div style={{ marginBottom:"20px" }}>
                  <h1 style={{ fontSize:"26px", fontWeight:800, color:"white", letterSpacing:"-0.5px" }}>{quote.profile?.business_name ?? "Mi Empresa"}</h1>
                  {quote.profile?.phone && <p style={{ marginTop:"4px", fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>📞 {quote.profile.phone}</p>}
                  {quote.profile?.email && <p style={{ marginTop:"2px", fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>✉ {quote.profile.email}</p>}
                </div>
                <div style={{ display:"inline-block", background:"#f97316", borderRadius:"6px", padding:"4px 12px", marginBottom:"6px" }}>
                  <span style={{ fontSize:"11px", fontWeight:700, color:"white", textTransform:"uppercase", letterSpacing:"1px" }}>Cotización</span>
                </div>
                <p style={{ fontSize:"32px", fontWeight:800, color:"white", letterSpacing:"-1px" }}>#{quote.quote_number}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:"12px", padding:"16px 20px" }}>
                  <div style={{ marginBottom:"12px" }}>
                    <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"2px" }}>Fecha</p>
                    <p style={{ fontSize:"13px", color:"white", fontWeight:500 }}>{today}</p>
                  </div>
                  {validUntil && (
                    <div style={{ marginBottom:"12px" }}>
                      <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"2px" }}>Válida hasta</p>
                      <p style={{ fontSize:"13px", color:"#fbbf24", fontWeight:500 }}>{validUntil}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"2px" }}>Total</p>
                    <p style={{ fontSize:"22px", color:"#f97316", fontWeight:800 }}>{formatUSD(quote.total)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLIENT */}
          {quote.client && (
            <div className="fade-up-2" style={{ padding:"24px 48px", borderBottom:"1px solid #f0f0f0" }}>
              <p style={{ fontSize:"10px", fontWeight:700, color:"#a3a3a3", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"6px" }}>Preparado para</p>
              <p style={{ fontSize:"18px", fontWeight:700, color:"#1a1a2e" }}>{quote.client.full_name}</p>
              {quote.client.phone && <p style={{ fontSize:"13px", color:"#737373", marginTop:"2px" }}>📞 {quote.client.phone}</p>}
              {quote.client.address && <p style={{ fontSize:"13px", color:"#737373", marginTop:"2px" }}>📍 {quote.client.address}</p>}
            </div>
          )}

          {/* ITEMS */}
          <div className="fade-up-3" style={{ padding:"32px 48px" }}>
            <p style={{ fontSize:"11px", fontWeight:700, color:"#a3a3a3", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"20px" }}>Detalle de Materiales y Servicios</p>

            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom:"24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ width:"3px", height:"16px", background:"#f97316", borderRadius:"2px" }} />
                  <span style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", color:"#f97316" }}>{CAT[cat] ?? cat}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 80px 60px 90px", gap:"8px", padding:"6px 12px", background:"#f8f8f8", borderRadius:"8px", marginBottom:"4px" }}>
                  {["Imagen","Descripción","Precio/u.","Cant.","Total"].map((h,i) => (
                    <span key={h} style={{ fontSize:"10px", fontWeight:700, color:"#a3a3a3", textTransform:"uppercase", letterSpacing:"0.5px", textAlign:i>0?"right":"left" }}>{h}</span>
                  ))}
                </div>
                {items.map((item: any, idx: number) => {
                  const details: string[] = [];
                  if (item.width_inches && item.height_inches) details.push(`${item.width_inches}" × ${item.height_inches}"`);
                  if (item.metadata?.color) details.push(item.metadata.color);
                  if (item.metadata?.tipo_vidrio) details.push(item.metadata.tipo_vidrio);
                  return (
                    <div key={item.id} style={{ display:"grid", gridTemplateColumns:"60px 1fr 80px 60px 90px", gap:"8px", padding:"10px 12px", borderBottom:idx<items.length-1?"1px solid #f5f5f5":"none", alignItems:"center" }}>
                      {/* Imagen del Producto */}
                      <div style={{ width:"50px", height:"50px", borderRadius:"8px", overflow:"hidden", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {item.product_snapshot?.imagen_url ? (
                          <img src={item.product_snapshot.imagen_url} alt={item.name_snapshot} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        ) : (
                          <span style={{ fontSize:"24px" }}>📦</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize:"13px", fontWeight:500, color:"#1a1a2e" }}>{item.name_snapshot}</p>
                        {details.length > 0 && <p style={{ fontSize:"11px", color:"#a3a3a3", marginTop:"2px" }}>{details.join(" · ")}</p>}
                      </div>
                      <p style={{ fontSize:"13px", color:"#737373", textAlign:"right" }}>{formatUSD(item.unit_price_snapshot)}</p>
                      <p style={{ fontSize:"13px", color:"#737373", textAlign:"right" }}>{item.quantity}</p>
                      <p style={{ fontSize:"13px", fontWeight:600, color:"#1a1a2e", textAlign:"right" }}>{formatUSD(item.line_total)}</p>
                    </div>
                  );
                })
              </div>
            ))}

            {/* TOTALS */}
            <div style={{ marginTop:"24px", borderTop:"2px solid #f0f0f0", paddingTop:"20px", display:"flex", justifyContent:"flex-end" }}>
              <div style={{ width:"280px" }}>
                {[
                  ["Subtotal materiales", formatUSD(quote.subtotal_materials)],
                  Number(quote.subtotal_labor) > 0 ? ["Mano de obra", formatUSD(quote.subtotal_labor)] : null,
                  [`IVU (${(Number(quote.ivu_rate)*100).toFixed(1)}%)`, formatUSD(quote.ivu_amount)],
                ].filter(Boolean).map(([l,v]: any) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                    <span style={{ fontSize:"13px", color:"#737373" }}>{l}</span>
                    <span style={{ fontSize:"13px", color:"#404040" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", background:"#1a1a2e", borderRadius:"10px", padding:"14px 16px", marginTop:"10px" }}>
                  <span style={{ fontSize:"15px", fontWeight:700, color:"white" }}>TOTAL</span>
                  <span style={{ fontSize:"18px", fontWeight:800, color:"#f97316" }}>{formatUSD(quote.total)}</span>
                </div>
                <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"10px", padding:"14px 16px", marginTop:"10px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                    <span style={{ fontSize:"12px", fontWeight:600, color:"#c2410c" }}>Depósito ({(Number(quote.deposit_rate)*100).toFixed(0)}%)</span>
                    <span style={{ fontSize:"16px", fontWeight:800, color:"#f97316" }}>{formatUSD(quote.deposit_amount)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"11px", color:"#ea580c" }}>Balance al completar</span>
                    <span style={{ fontSize:"12px", fontWeight:600, color:"#ea580c" }}>{formatUSD(Number(quote.total)-Number(quote.deposit_amount))}</span>
                  </div>
                </div>
              </div>
            </div>

            {quote.notes && (
              <div style={{ marginTop:"24px", background:"#fafafa", borderRadius:"10px", padding:"16px", borderLeft:"3px solid #f97316" }}>
                <p style={{ fontSize:"10px", fontWeight:700, color:"#a3a3a3", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"6px" }}>Notas</p>
                <p style={{ fontSize:"13px", color:"#525252", lineHeight:1.6, whiteSpace:"pre-line" }}>{quote.notes}</p>
              </div>
            )}
          </div>

          {/* TERMS */}
          <div style={{ padding:"20px 48px", background:"#fafafa", borderTop:"1px solid #f0f0f0" }}>
            <p style={{ fontSize:"11px", color:"#a3a3a3", lineHeight:1.6 }}>
              Esta cotización es válida por 30 días desde la fecha de emisión. El depósito indicado es requerido para iniciar el trabajo. El balance restante se pagará al completar la instalación satisfactoriamente. Los precios están sujetos a cambios sin previo aviso después de la fecha de vencimiento.
            </p>
          </div>

          {/* FOOTER */}
          <div style={{ padding:"16px 48px", background:"#1a1a2e", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>Generado con <span style={{ color:"#f97316", fontWeight:600 }}>CotizaYa PR</span></p>
            <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>cotizayapr.com</p>
          </div>
        </div>

        {/* ACCEPTANCE */}
        <div className="fade-up-4 no-print" style={{ maxWidth:"760px", margin:"20px auto 0" }}>
          {["draft","sent","viewed"].includes(quote.status) && <QuoteAcceptance token={token} />}
          {quote.status === "accepted" && (
            <div style={{ background:"white", borderRadius:"16px", padding:"24px", textAlign:"center", border:"2px solid #86efac" }}>
              <p style={{ fontSize:"20px", marginBottom:"6px" }}>🎉</p>
              <p style={{ fontSize:"16px", fontWeight:700, color:"#15803d" }}>Cotización Aprobada</p>
              <p style={{ fontSize:"13px", color:"#166534", marginTop:"4px" }}>El contratista estará en contacto pronto para coordinar el trabajo.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
