import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { formatUSD } from "@/lib/calculations";
import { CopyLinkButton } from "./CopyLinkButton";
import { MarkSentButton } from "./MarkSentButton";
import { VisualShoppingSheet } from "@/components/quote/VisualShoppingSheet";
import { calculateProfilesNeeded, optimizeProfiles, ProfileItem } from "@/lib/shopping-sheet";

const LABEL: Record<string,string> = { draft:"Borrador", sent:"Enviada", viewed:"Vista", accepted:"Aprobada", rejected:"Rechazada", expired:"Expirada" };
const BG:    Record<string,string> = { draft:"#e5e5e5", sent:"#dbeafe", viewed:"#fef9c3", accepted:"#dcfce7", rejected:"#fee2e2", expired:"#e5e5e5" };
const TX:    Record<string,string> = { draft:"#525252", sent:"#1d4ed8", viewed:"#854d0e", accepted:"#15803d", rejected:"#dc2626", expired:"#737373" };
const CAT:   Record<string,string> = { puerta:"Puertas / Portones", ventana:"Ventanas", closet:"Closets", screen:"Screen", aluminio:"Perfiles de Aluminio", cristal:"Cristales", tornilleria:"Tornillería", miscelanea:"Miscelánea" };

export default async function CotizacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: quote }, { data: items }, { data: profile }] = await Promise.all([
    supabase.from("quotes").select("*, clients(full_name, phone, address)").eq("id", id).eq("owner_id", user.id).single(),
    supabase.from("quote_items").select("*").eq("quote_id", id).order("position"),
    supabase.from("profiles").select("business_name").eq("id", user.id).single(),
  ]);

  if (!quote) notFound();

  const headersList = await headers()
  const host = headersList.get('host') || 'cotizaya-pr.vercel.app'
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const appUrl = `${proto}://${host}`
  const shareLink = `${appUrl}/share/${quote.public_token}`;
  const client = (quote as any).clients;

  const grouped: Record<string, any[]> = {};
  for (const item of items ?? []) {
    const cat = item.category_snapshot ?? "miscelanea";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const waMsg = encodeURIComponent(`Hola ${client?.full_name ?? ""},\n\nLe comparto su estimado.\n\nTotal: ${formatUSD(quote.total)}\nDepósito: ${formatUSD(quote.deposit_amount)}\n\nVer y aprobar: ${shareLink}\n\nGracias `);
  const waPhone = client?.phone?.replace(/\D/g,"");
  const waUrl = waPhone ? `https://wa.me/1${waPhone}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`;

  // Generar Hoja de Compra para todos los productos de la cotización
  let shoppingSheet = null;
  if (items && items.length > 0) {
    let allProfiles: ProfileItem[] = [];
    for (const item of items) {
      if (item.width_inches && item.height_inches && item.category_snapshot) {
        const itemProfiles = calculateProfilesNeeded(
          item.width_inches,
          item.height_inches,
          item.category_snapshot as any
        );
        allProfiles = allProfiles.concat(itemProfiles);
      }
    }

    if (allProfiles.length > 0) {
      const { optimized, totalWasteInches, wastePercentage, notes } = optimizeProfiles(allProfiles);
      shoppingSheet = {
        quoteId: id,
        date: new Date(quote.created_at),
        totalLinearFeet: optimized.reduce((acc, p) => acc + (p.lengthInches / 12), 0),
        totalCost: optimized.reduce((acc, p) => acc + p.totalPrice, 0),
        profileItems: optimized,
        totalWasteInches,
        wastePercentage,
        optimizationNotes: notes,
      };
    }
  }

  return (
    <div style={{ padding:"24px", maxWidth:"800px", margin:"0 auto" }}>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"20px" }}>
        <div>
          <Link href="/dashboard/cotizaciones" style={{ fontSize:"12px", color:"#a3a3a3", textDecoration:"none" }}>← Volver</Link>
          <h1 style={{ margin:"4px 0 4px", fontSize:"20px", fontWeight:700, color:"#171717" }}>Cotización #{quote.quote_number}</h1>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <span style={{ background:BG[quote.status], color:TX[quote.status], borderRadius:"999px", padding:"2px 8px", fontSize:"10px", fontWeight:700 }}>{LABEL[quote.status]}</span>
            <span style={{ fontSize:"12px", color:"#a3a3a3" }}>{new Date(quote.created_at).toLocaleDateString("es-PR",{year:"numeric",month:"long",day:"numeric"})}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {quote.status === "draft" && <MarkSentButton quoteId={id} />}
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ background:"#25D366", color:"white", textDecoration:"none", borderRadius:"10px", padding:"8px 14px", fontSize:"13px", fontWeight:700 }}>
             WhatsApp
          </a>
          <CopyLinkButton link={shareLink} />
        </div>
      </div>

      {client && (
        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"14px", marginBottom:"14px" }}>
          <p style={{ margin:"0 0 4px", fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:"#a3a3a3" }}>Cliente</p>
          <p style={{ margin:0, fontSize:"14px", fontWeight:600, color:"#171717" }}>{client.full_name}</p>
          {client.phone && <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#737373" }}>{client.phone}</p>}
          {client.address && <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#737373" }}>{client.address}</p>}
        </div>
      )}

      {/* Hoja de Compra Visual (Premium Tool) */}
      {shoppingSheet && (
        <div style={{ marginBottom: "24px" }}>
          <VisualShoppingSheet sheet={shoppingSheet} />
        </div>
      )}

      <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden", marginBottom:"14px" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5" }}>
          <p style={{ margin:0, fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:"#525252" }}>Resumen de Cotización</p>
        </div>
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <div style={{ background:"#fafafa", padding:"6px 16px", borderBottom:"1px solid #f5f5f5" }}>
              <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#737373" }}> {CAT[cat] ?? cat}</span>
            </div>
            {catItems.map((item:any) => (
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 16px", borderBottom:"1px solid #fafafa" }}>
                <div>
                  <p style={{ margin:0, fontSize:"13px", color:"#171717" }}>{item.name_snapshot}</p>
                  <p style={{ margin:0, fontSize:"11px", color:"#a3a3a3" }}>
                    {item.width_inches && item.height_inches ? `${item.width_inches}" × ${item.height_inches}" · ` : ""}
                    {item.metadata?.color ? `${item.metadata.color} · ` : ""}
                    Cant: {item.quantity}
                  </p>
                </div>
                <span style={{ fontSize:"13px", fontWeight:700, color:"#171717" }}>{formatUSD(item.line_total)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"16px", maxWidth:"300px", marginLeft:"auto", marginBottom:"14px" }}>
        {[
          ["Subtotal materiales", quote.subtotal_materials],
          ["Mano de obra", quote.subtotal_labor],
          [`IVU (0%)`, 0],
        ].map(([l,v]) => (
          <div key={String(l)} style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
            <span style={{ fontSize:"13px", color:"#737373" }}>{l}</span>
            <span style={{ fontSize:"13px" }}>{formatUSD(Number(v))}</span>
          </div>
        ))}
        <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e5e5e5", paddingTop:"8px", marginTop:"6px" }}>
          <span style={{ fontSize:"16px", fontWeight:700 }}>TOTAL</span>
          <span style={{ fontSize:"16px", fontWeight:700, color:"#f97316" }}>{formatUSD(quote.total)}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
          <span style={{ fontSize:"12px", color:"#737373" }}>Depósito ({(Number(quote.deposit_rate)*100).toFixed(0)}%)</span>
          <span style={{ fontSize:"13px", fontWeight:600, color:"#f97316" }}>{formatUSD(quote.deposit_amount)}</span>
        </div>
      </div>

      <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"12px", padding:"12px 16px" }}>
        <p style={{ margin:"0 0 4px", fontSize:"12px", fontWeight:700, color:"#c2410c" }}>Link para el cliente</p>
        <p style={{ margin:0, fontFamily:"monospace", fontSize:"11px", color:"#ea580c", wordBreak:"break-all" }}>{shareLink}</p>
      </div>
    </div>
  );
}
