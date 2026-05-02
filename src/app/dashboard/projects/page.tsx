import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/projectCalculations";

const STATUS_LABEL: Record<string, string> = { draft: "Borrador", quoted: "Cotizado", approved: "Aprobado", rejected: "Rechazado" };
const STATUS_BG: Record<string, string>    = { draft: "#e5e5e5", quoted: "#dbeafe", approved: "#dcfce7", rejected: "#fee2e2" };
const STATUS_TX: Record<string, string>    = { draft: "#525252", quoted: "#1d4ed8", approved: "#15803d", rejected: "#dc2626" };
const QUALITY_LABEL: Record<string, string> = { basic: "Básico", standard: "Standard", premium: "Premium" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const all = projects ?? [];
  const totalValue = all.reduce((s, p) => s + Number(p.estimated_total), 0);

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#171717" }}>🏗️ Proyectos de Construcción</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#737373" }}>{all.length} proyectos · {formatCurrency(totalValue)} en estimados</p>
        </div>
        <Link href="/dashboard/projects/new"
          style={{ background: "#f97316", color: "white", textDecoration: "none", borderRadius: "12px", padding: "10px 18px", fontSize: "13px", fontWeight: 700 }}>
          ✚ Nuevo Proyecto
        </Link>
      </div>

      {all.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>🏗️</p>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#171717", margin: "0 0 8px" }}>Sin proyectos aún</p>
          <p style={{ fontSize: "13px", color: "#737373", margin: "0 0 20px" }}>Crea tu primer estimado de construcción</p>
          <Link href="/dashboard/projects/new"
            style={{ background: "#f97316", color: "white", textDecoration: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13px", fontWeight: 700 }}>
            Crear Proyecto
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {all.map((p: any) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "18px", transition: "box-shadow 0.15s", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#171717", flex: 1, paddingRight: "8px" }}>{p.name}</p>
                  <span style={{ background: STATUS_BG[p.status], color: STATUS_TX[p.status], borderRadius: "999px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#737373", marginBottom: "12px", lineHeight: 1.6 }}>
                  <span>📐 {Number(p.square_feet).toLocaleString()} pie²</span>
                  <span style={{ margin: "0 6px" }}>·</span>
                  <span>⭐ {QUALITY_LABEL[p.quality_level]}</span>
                </div>
                <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "10px" }}>
                  <p style={{ margin: 0, fontSize: "11px", color: "#a3a3a3" }}>Total Estimado</p>
                  <p style={{ margin: "2px 0 0", fontSize: "22px", fontWeight: 800, color: "#f97316" }}>
                    {formatCurrency(p.estimated_total)}
                  </p>
                  {p.margin_percentage > 0 && (
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#16a34a" }}>
                      +{p.margin_percentage}% margen → {formatCurrency(p.final_price)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
