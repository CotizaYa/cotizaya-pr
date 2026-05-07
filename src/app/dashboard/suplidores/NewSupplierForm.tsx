"use client";
import { useState, useTransition } from "react";
import { createSupplier } from "./actions";

const CATEGORIES = [
  { value: "aluminio",      label: " Aluminio / Perfiles" },
  { value: "vidrio",        label: " Cristales / Vidrio" },
  { value: "screen",        label: " Screen / Malla" },
  { value: "herrajes",      label: " Herrajes y Goznes" },
  { value: "tornilleria",   label: " Tornillería" },
  { value: "pintura",       label: " Pintura / Selladores" },
  { value: "construccion",  label: " Materiales de Construcción" },
  { value: "miscelanea",    label: " Miscelánea" },
];

export function NewSupplierForm() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    start(async () => {
      const res = await createSupplier({
        name:     String(fd.get("name")),
        category: String(fd.get("category")),
        phone:    String(fd.get("phone") || ""),
        whatsapp: String(fd.get("whatsapp") || ""),
        email:    String(fd.get("email") || ""),
        notes:    String(fd.get("notes") || ""),
      });
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      form.reset();
    });
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ background: "#f97316", color: "white", border: "none", borderRadius: "12px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
       Agregar Suplidor
    </button>
  );

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "14px", padding: "20px", marginBottom: "4px" }}>
      <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#171717" }}>Nuevo Suplidor</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "1/-1" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase" }}>Nombre del suplidor *</span>
          <input name="name" required placeholder="Ej: Proserv PR, Caribbean Glass..."
            style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", background: "white" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "1/-1" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase" }}>Categoría *</span>
          <select name="category" required
            style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", background: "white" }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase" }}>Teléfono</span>
          <input name="phone" type="tel" placeholder="787-555-0000"
            style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", background: "white" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase" }}>
            WhatsApp <span style={{ color: "#16a34a" }}>← Para consultas automáticas</span>
          </span>
          <input name="whatsapp" type="tel" placeholder="787-555-0000"
            style={{ border: "1px solid #fed7aa", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", background: "white" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase" }}>Email</span>
          <input name="email" type="email" placeholder="ventas@suplidor.com"
            style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", background: "white" }} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase" }}>Notas</span>
          <input name="notes" placeholder="Ej: Mejor precio en perfiles 6005"
            style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", background: "white" }} />
        </label>
      </div>

      {error && <p style={{ margin: "10px 0 0", color: "#dc2626", fontSize: "12px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button type="submit" disabled={pending}
          style={{ background: "#f97316", color: "white", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: pending ? 0.6 : 1 }}>
          {pending ? "Guardando…" : "Guardar Suplidor"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", cursor: "pointer" }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
