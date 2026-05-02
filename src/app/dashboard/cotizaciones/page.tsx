import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatUSD } from "@/lib/calculations";

const LABEL: Record<string,string> = { draft:"Borrador", sent:"Enviada", viewed:"Vista", accepted:"Aprobada", rejected:"Rechazada", expired:"Expirada" };
const BG: Record<string,string>    = { draft:"#e5e5e5", sent:"#dbeafe", viewed:"#fef9c3", accepted:"#dcfce7", rejected:"#fee2e2", expired:"#e5e5e5" };
const TX: Record<string,string>    = { draft:"#525252", sent:"#1d4ed8", viewed:"#854d0e", accepted:"#15803d", rejected:"#dc2626", expired:"#737373" };

export default async function CotizacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: quotes } = await supabase
    .from("quotes").select("id, quote_number, status, total, created_at, clients(full_name)")
    .eq("owner_id", user.id).order("created_at", { ascending: false });
  const all = quotes ?? [];
  return (
    <div style={{ padding:"24px", maxWidth:"800px", margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"20px", fontWeight:700, color:"#171717" }}>Cotizaciones</h1>
          <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#737373" }}>{all.length} en total</p>
        </div>
        <Link href="/dashboard/cotizaciones/nueva" style={{ background:"#f97316", color:"white", textDecoration:"none", borderRadius:"12px", padding:"8px 16px", fontSize:"13px", fontWeight:700 }}>
          ✚ Nueva
        </Link>
      </div>
      <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden" }}>
        {all.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center" }}>
            <p style={{ fontSize:"32px", margin:"0 0 8px" }}>📋</p>
            <p style={{ fontSize:"13px", color:"#737373" }}>No hay cotizaciones aún</p>
          </div>
        ) : (
          <ul style={{ margin:0, padding:0, listStyle:"none" }}>
            {all.map((q:any) => (
              <li key={q.id} style={{ borderBottom:"1px solid #fafafa" }}>
                <Link href={`/dashboard/cotizaciones/${q.id}`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", textDecoration:"none" }}>
                  <div>
                    <p style={{ margin:0, fontSize:"13px", fontWeight:500, color:"#171717" }}>{q.clients?.full_name ?? "Sin cliente"}</p>
                    <p style={{ margin:0, fontSize:"11px", color:"#a3a3a3" }}>#{q.quote_number} · {new Date(q.created_at).toLocaleDateString("es-PR")}</p>
                  </div>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                    <span style={{ background:BG[q.status], color:TX[q.status], borderRadius:"999px", padding:"2px 8px", fontSize:"10px", fontWeight:700 }}>{LABEL[q.status]}</span>
                    <span style={{ fontSize:"13px", fontWeight:700, color:"#171717" }}>{formatUSD(q.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
