import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatUSD } from "@/lib/calculations";

const STATUS_LABEL: Record<string,string> = { draft:"Borrador", sent:"Enviada", viewed:"Vista", accepted:"Aprobada", rejected:"Rechazada", expired:"Expirada" };
const STATUS_COLOR: Record<string,string> = { draft:"#e5e5e5", sent:"#dbeafe", viewed:"#fef9c3", accepted:"#dcfce7", rejected:"#fee2e2", expired:"#e5e5e5" };
const STATUS_TEXT: Record<string,string>  = { draft:"#525252", sent:"#1d4ed8", viewed:"#854d0e", accepted:"#15803d", rejected:"#dc2626", expired:"#737373" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quotes } = await supabase
    .from("quotes").select("id, quote_number, status, total, created_at, clients(full_name)")
    .eq("owner_id", user.id).order("created_at", { ascending: false }).limit(10);

  const all = quotes ?? [];
  const now = new Date();
  const som = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = all.filter((q:any) => q.created_at >= som);
  const aprobadas = all.filter((q:any) => q.status === "accepted");
  const pendientes = all.filter((q:any) => ["draft","sent","viewed"].includes(q.status));

  const stats = [
    { label:"Facturado este mes", value:formatUSD(thisMonth.reduce((s:number,q:any)=>s+Number(q.total),0)), sub:`${thisMonth.length} cotizaciones`, color:"#f97316" },
    { label:"Cobrado (aprobadas)", value:formatUSD(aprobadas.reduce((s:number,q:any)=>s+Number(q.total),0)), sub:`${aprobadas.length} aprobadas`, color:"#16a34a" },
    { label:"Pendiente de cobro", value:formatUSD(pendientes.reduce((s:number,q:any)=>s+Number(q.total),0)), sub:`${pendientes.length} activas`, color:"#2563eb" },
    { label:"IVU recolectado", value:formatUSD(thisMonth.reduce((s:number,q:any)=>s+(Number(q.total)*0.115/1.115),0)), sub:"11.5% este mes", color:"#7c3aed" },
  ];

  return (
    <div style={{ padding:"24px", maxWidth:"900px", margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"20px", fontWeight:700, color:"#171717" }}>Inicio</h1>
          <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#737373" }}>
            {now.toLocaleDateString("es-PR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </p>
        </div>
        <Link href="/dashboard/cotizaciones/nueva" style={{ background:"#f97316", color:"white", textDecoration:"none", borderRadius:"12px", padding:"8px 16px", fontSize:"13px", fontWeight:700 }}>
          ✚ Nueva Cotización
        </Link>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"20px" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"14px" }}>
            <p style={{ margin:0, fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", color:"#737373" }}>{s.label}</p>
            <p style={{ margin:"4px 0 2px", fontSize:"22px", fontWeight:700, color:s.color }}>{s.value}</p>
            <p style={{ margin:0, fontSize:"11px", color:"#a3a3a3" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", borderBottom:"1px solid #f5f5f5" }}>
          <span style={{ fontSize:"13px", fontWeight:600, color:"#404040" }}>Cotizaciones Recientes</span>
          <Link href="/dashboard/cotizaciones" style={{ fontSize:"12px", color:"#f97316", textDecoration:"none", fontWeight:600 }}>Ver todas →</Link>
        </div>
        {all.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center" }}>
            <p style={{ margin:"0 0 8px", fontSize:"13px", color:"#737373" }}>Aún no tienes cotizaciones.</p>
            <Link href="/dashboard/cotizaciones/nueva" style={{ fontSize:"13px", color:"#f97316", fontWeight:700 }}>Crear la primera →</Link>
          </div>
        ) : (
          <ul style={{ margin:0, padding:0, listStyle:"none" }}>
            {all.map((q:any) => (
              <li key={q.id} style={{ borderBottom:"1px solid #fafafa" }}>
                <Link href={`/dashboard/cotizaciones/${q.id}`} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", textDecoration:"none", transition:"background 0.1s" }}>
                  <div>
                    <span style={{ fontSize:"13px", fontWeight:500, color:"#171717" }}>{(q as any).clients?.full_name ?? "Sin cliente"}</span>
                    <span style={{ marginLeft:"8px", fontSize:"11px", color:"#a3a3a3" }}>#{q.quote_number} · {new Date(q.created_at).toLocaleDateString("es-PR")}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <span style={{ background:STATUS_COLOR[q.status], color:STATUS_TEXT[q.status], borderRadius:"999px", padding:"2px 8px", fontSize:"10px", fontWeight:700 }}>
                      {STATUS_LABEL[q.status]}
                    </span>
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
