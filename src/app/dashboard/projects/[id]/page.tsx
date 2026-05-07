import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/projectCalculations";
import { MarginCalculator } from "./components/MarginCalculator";

const STATUS_BG: Record<string,string> = { draft:"#e5e5e5", quoted:"#dbeafe", approved:"#dcfce7", rejected:"#fee2e2" };
const STATUS_TX: Record<string,string> = { draft:"#525252", quoted:"#1d4ed8", approved:"#15803d", rejected:"#dc2626" };
const STATUS_LABEL: Record<string,string> = { draft:"Borrador", quoted:"Cotizado", approved:"Aprobado", rejected:"Rechazado" };
const QUALITY_LABEL: Record<string,string> = { basic:"Básico", standard:"Standard", premium:"Premium" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: project }, { data: phases }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).eq("owner_id", user.id).single(),
    supabase.from("project_phases").select("*, project_items(*)").eq("project_id", id).order("order_index"),
  ]);

  if (!project) notFound();

  const margin = Number(project.margin_percentage) || 0;
  const finalPrice = Number(project.final_price) || Number(project.estimated_total);
  const profit = finalPrice - Number(project.estimated_total);

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
        <div>
          <Link href="/dashboard/projects" style={{ fontSize: "12px", color: "#a3a3a3", textDecoration: "none" }}>← Proyectos</Link>
          <h1 style={{ margin: "4px 0 4px", fontSize: "22px", fontWeight: 800, color: "#171717" }}>{project.name}</h1>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ background: STATUS_BG[project.status], color: STATUS_TX[project.status], borderRadius: "999px", padding: "2px 10px", fontSize: "10px", fontWeight: 700 }}>
              {STATUS_LABEL[project.status]}
            </span>
            <span style={{ fontSize: "12px", color: "#a3a3a3" }}>
               {Number(project.square_feet).toLocaleString()} pie² ·  {QUALITY_LABEL[project.quality_level]}
            </span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Costo Base", value: formatCurrency(project.estimated_total), color: "#171717" },
          { label: `Margen (${margin}%)`, value: formatCurrency(profit), color: "#16a34a" },
          { label: "Precio Final", value: formatCurrency(finalPrice), color: "#f97316" },
        ].map(c => (
          <div key={c.label} style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "16px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#737373", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px", alignItems: "start" }}>
        {/* Phases breakdown */}
        <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f5f5f5" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#525252" }}>Desglose por Fases</p>
          </div>
          {(phases ?? []).map((phase: any) => (
            <div key={phase.id}>
              <div style={{ background: "#fafafa", padding: "8px 18px", borderBottom: "1px solid #f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#f97316" }}>
                   {phase.name}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#171717" }}>{formatCurrency(phase.subtotal)}</span>
              </div>
              {(phase.project_items ?? []).map((item: any) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 100px", gap: "8px", alignItems: "center", padding: "8px 18px", borderBottom: "1px solid #fafafa" }}>
                  <span style={{ fontSize: "13px", color: "#404040" }}>{item.name}</span>
                  <span style={{ fontSize: "12px", color: "#737373" }}>{Number(item.quantity).toLocaleString()} {item.unit}</span>
                  <span style={{ fontSize: "12px", color: "#737373" }}>${Number(item.unit_cost).toFixed(2)}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, textAlign: "right" }}>{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          ))}
          {/* Timeline */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid #f5f5f5", background: "#f0fdf4" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#15803d" }}>
              ⏱ Tiempo estimado: {Math.max(1, Math.floor((Number(project.square_feet)/250)*0.8))}–{Math.ceil((Number(project.square_feet)/250)*1.2)} meses
            </p>
          </div>
        </div>

        {/* Margin calculator */}
        <MarginCalculator
          projectId={id}
          estimatedTotal={Number(project.estimated_total)}
          currentMargin={margin}
        />
      </div>
    </div>
  );
}
