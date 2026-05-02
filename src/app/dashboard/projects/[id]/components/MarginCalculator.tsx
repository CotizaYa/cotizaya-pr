"use client";
import { useState, useTransition } from "react";
import { updateProjectMargin, updateProjectStatus, deleteProject } from "@/app/dashboard/projects/actions";
import { useRouter } from "next/navigation";

export function MarginCalculator({
  projectId, estimatedTotal, currentMargin
}: {
  projectId: string;
  estimatedTotal: number;
  currentMargin: number;
}) {
  const router = useRouter();
  const [margin, setMargin] = useState(currentMargin);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const finalPrice = estimatedTotal * (1 + margin / 100);
  const profit = finalPrice - estimatedTotal;

  function saveMargin() {
    start(async () => {
      await updateProjectMargin(projectId, margin);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function changeStatus(status: string) {
    start(async () => {
      await updateProjectStatus(projectId, status);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    start(async () => {
      await deleteProject(projectId);
      router.push("/dashboard/projects");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Margin calculator */}
      <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "18px" }}>
        <p style={{ margin: "0 0 14px", fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          💰 Calculadora de Margen
        </p>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", color: "#737373" }}>Margen de ganancia: <strong>{margin}%</strong></span>
          <input type="range" min="0" max="50" step="1" value={margin}
            onChange={e => setMargin(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#f97316" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#a3a3a3" }}>
            <span>0%</span><span>25%</span><span>50%</span>
          </div>
        </label>

        <div style={{ background: "#fafafa", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
          {[
            ["Costo base", `$${estimatedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
            ["Ganancia", `+$${profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "#737373" }}>{l}</span>
              <span style={{ fontSize: "12px", color: "#171717" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e5e5", paddingTop: "8px", marginTop: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700 }}>Precio Final</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#f97316" }}>
              ${finalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button onClick={saveMargin} disabled={pending}
          style={{ width: "100%", background: saved ? "#16a34a" : "#f97316", color: "white", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
          {saved ? "✓ Guardado" : pending ? "Guardando…" : "Guardar Margen"}
        </button>
      </div>

      {/* Status */}
      <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "18px" }}>
        <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            { status: "quoted",   label: "Cotizado",  bg: "#dbeafe", tx: "#1d4ed8" },
            { status: "approved", label: "Aprobado",  bg: "#dcfce7", tx: "#15803d" },
            { status: "rejected", label: "Rechazado", bg: "#fee2e2", tx: "#dc2626" },
            { status: "draft",    label: "Borrador",  bg: "#e5e5e5", tx: "#525252" },
          ].map(s => (
            <button key={s.status} onClick={() => changeStatus(s.status)} disabled={pending}
              style={{ background: s.bg, color: s.tx, border: "none", borderRadius: "8px", padding: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <button onClick={handleDelete} disabled={pending}
        style={{ background: "white", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
        🗑 Eliminar Proyecto
      </button>
    </div>
  );
}
