import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatUSD } from "@/lib/calculations";
import { NewClientForm } from "./NewClientForm";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: clients } = await supabase.from("clients").select("*, quotes(total)").eq("owner_id", user.id).order("full_name");
  return (
    <div style={{ padding:"24px", maxWidth:"700px", margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div>
          <h1 style={{ margin:0, fontSize:"20px", fontWeight:700, color:"#171717" }}>Clientes</h1>
          <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#737373" }}>{clients?.length ?? 0} registrados</p>
        </div>
      </div>
      <NewClientForm />
      <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden", marginTop:"14px" }}>
        {(!clients || clients.length === 0) ? (
          <div style={{ padding:"40px", textAlign:"center" }}>
            <p style={{ fontSize:"28px", margin:"0 0 6px" }}>👥</p>
            <p style={{ fontSize:"13px", color:"#737373" }}>Aún no tienes clientes.</p>
          </div>
        ) : (
          <ul style={{ margin:0, padding:0, listStyle:"none" }}>
            {clients.map((c:any) => {
              const total = (c.quotes ?? []).reduce((s:number,q:any)=>s+Number(q.total),0);
              return (
                <li key={c.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid #fafafa" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"36px", height:"36px", background:"#fff7ed", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:700, color:"#f97316" }}>
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:"#171717" }}>{c.full_name}</p>
                      <p style={{ margin:0, fontSize:"11px", color:"#a3a3a3" }}>{c.phone ?? "Sin teléfono"}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ margin:0, fontSize:"13px", fontWeight:700, color:"#171717" }}>{formatUSD(total)}</p>
                    <p style={{ margin:0, fontSize:"11px", color:"#a3a3a3" }}>{(c.quotes??[]).length} cotizaciones</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
