"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "../actions";

const QUALITY = [
  { id: "basic",    name: "Básico",    range: "$120–160/pie²", desc: "Construcción económica. Estructura básica y materiales estándar.", color: "#737373", pricePerSqft: 141 },
  { id: "standard", name: "Standard",  range: "$160–200/pie²", desc: "El más popular. Calidad equilibrada y durabilidad garantizada.", color: "#f97316", pricePerSqft: 194 },
  { id: "premium",  name: "Premium",   range: "$200–300+/pie²", desc: "Lujo. Materiales de alta calidad, acabados premium.", color: "#7c3aed", pricePerSqft: 285 },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [quality, setQuality] = useState("standard");
  const [sqft, setSqft] = useState(0);

  const selected = QUALITY.find(q => q.id === quality)!;
  const preview = sqft > 0 ? sqft * selected.pricePerSqft : 0;
  const months = sqft > 0 ? { min: Math.max(1, Math.floor((sqft/250)*0.8)), max: Math.ceil((sqft/250)*1.2) } : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        const res = await createProject(fd);
        if (res.success) router.push(`/dashboard/projects/${res.projectId}`);
      } catch (err: any) {
        setError(err.message || "Error creando proyecto");
      }
    });
  }

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#171717" }}>🏗️ Nuevo Proyecto</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#737373" }}>Genera un estimado completo de construcción en segundos</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#dc2626" }}>{error}</div>
          )}

          <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "20px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nombre del Proyecto</span>
              <input name="projectName" placeholder="Ej: Casa en Arecibo, PR"
                style={{ border: "1px solid #e5e5e5", borderRadius: "10px", padding: "10px 14px", fontSize: "14px" }} />
            </label>
          </div>

          <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>📐 Pies Cuadrados *</span>
                <input name="squareFeet" type="number" min="100" required placeholder="Ej: 1200"
                  onChange={e => setSqft(Number(e.target.value))}
                  style={{ border: "1px solid #e5e5e5", borderRadius: "10px", padding: "10px 14px", fontSize: "14px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>Plantas / Pisos</span>
                <select name="floors"
                  style={{ border: "1px solid #e5e5e5", borderRadius: "10px", padding: "10px 14px", fontSize: "14px" }}>
                  <option value="1">1 Planta</option>
                  <option value="2">2 Plantas</option>
                  <option value="3">3 Plantas</option>
                </select>
              </label>
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "20px" }}>
            <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>⭐ Nivel de Calidad *</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {QUALITY.map(q => (
                <label key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", border: `2px solid ${quality === q.id ? q.color : "#e5e5e5"}`, borderRadius: "12px", padding: "14px", cursor: "pointer", background: quality === q.id ? "#fff7ed" : "white", transition: "all 0.15s" }}>
                  <input type="radio" name="quality" value={q.id} checked={quality === q.id} onChange={() => setQuality(q.id)} style={{ marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: q.color }}>{q.name}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#737373" }}>{q.range}</span>
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#737373" }}>{q.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={pending || sqft <= 0}
            style={{ background: sqft <= 0 ? "#d4d4d4" : "#f97316", color: "white", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: sqft <= 0 ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1 }}>
            {pending ? "Generando estimado…" : "🚀 Generar Estimado Completo"}
          </button>
        </form>

        {/* Preview */}
        <div style={{ background: "#fff7ed", border: "2px solid #fed7aa", borderRadius: "16px", padding: "20px", position: "sticky", top: "20px" }}>
          <p style={{ margin: "0 0 16px", fontSize: "13px", fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.05em" }}>📊 Vista Previa</p>
          {sqft > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: "#92400e" }}>Pies Cuadrados</p>
                <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#f97316" }}>{sqft.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: "#92400e" }}>Calidad</p>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#171717" }}>{selected.name}</p>
              </div>
              <div style={{ borderTop: "1px solid #fed7aa", paddingTop: "12px" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#92400e" }}>Estimado Aproximado</p>
                <p style={{ margin: "4px 0 0", fontSize: "30px", fontWeight: 800, color: "#f97316" }}>
                  ${preview.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#92400e" }}>${selected.pricePerSqft}/pie²</p>
              </div>
              {months && (
                <div style={{ background: "white", borderRadius: "10px", padding: "12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#737373" }}>⏱ Tiempo Estimado</p>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#171717" }}>{months.min}–{months.max} meses</p>
                </div>
              )}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px", fontSize: "11px", color: "#1d4ed8" }}>
                💡 Estimado aproximado basado en precios de mercado en Puerto Rico. El valor final puede variar.
              </div>
            </div>
          ) : (
            <p style={{ color: "#a3a3a3", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
              Ingresa los pies cuadrados para ver el estimado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
