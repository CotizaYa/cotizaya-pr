"use client";
import { useState, useTransition } from "react";
import { createClientAction } from "./actions";

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string|null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    start(async () => {
      const res = await createClientAction({
        full_name: String(fd.get("full_name")),
        phone: String(fd.get("phone")||""),
        email: String(fd.get("email")||""),
        address: String(fd.get("address")||""),
      });
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      form.reset();
    });
  }

  if (!open) return (
    <button onClick={()=>setOpen(true)}
      style={{ background:"#f97316", color:"white", border:"none", borderRadius:"12px", padding:"8px 16px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
       Nuevo Cliente
    </button>
  );

  return (
    <form onSubmit={handleSubmit} style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"12px", padding:"16px" }}>
      <p style={{ margin:"0 0 12px", fontSize:"13px", fontWeight:700, color:"#171717" }}>Nuevo Cliente</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
        {[
          { name:"full_name", label:"Nombre completo *", placeholder:"Juan Pérez", required:true },
          { name:"phone",     label:"Teléfono",          placeholder:"787-555-0000" },
          { name:"email",     label:"Email",             placeholder:"juan@email.com" },
          { name:"address",   label:"Ciudad / Dirección",placeholder:"Arecibo, PR" },
        ].map(f => (
          <label key={f.name} style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
            <span style={{ fontSize:"11px", fontWeight:600, color:"#525252" }}>{f.label}</span>
            <input name={f.name} required={f.required} placeholder={f.placeholder}
              style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px", background:"white" }} />
          </label>
        ))}
      </div>
      {error && <p style={{ color:"#dc2626", fontSize:"12px", margin:"8px 0 0" }}>{error}</p>}
      <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
        <button type="submit" disabled={pending}
          style={{ background:"#f97316", color:"white", border:"none", borderRadius:"8px", padding:"8px 16px", fontSize:"13px", fontWeight:700, cursor:"pointer", opacity:pending?0.6:1 }}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={()=>setOpen(false)}
          style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"8px", padding:"8px 16px", fontSize:"13px", cursor:"pointer" }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
