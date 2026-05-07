"use client";
import { useState, useTransition } from "react";
import { saveApiKey, removeApiKey } from "./actions";

export function ApiKeyForm({ currentKey }: { currentKey: string | null }) {
  const [key, setKey] = useState("");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  function handleSave() {
    if (!key.trim().startsWith("sk-ant-")) {
      setError("La key debe empezar con sk-ant-");
      return;
    }
    setError(null);
    start(async () => {
      const res = await saveApiKey(key.trim());
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      setKey("");
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleRemove() {
    if (!confirm("¿Eliminar la API Key? El Asistente IA quedará desactivado.")) return;
    start(async () => { await removeApiKey(); });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {currentKey && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#15803d" }}>{currentKey}</span>
          <button onClick={handleRemove} disabled={pending}
            style={{ background: "none", border: "none", color: "#dc2626", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
            Eliminar
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{ width: "100%", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "9px 40px 9px 12px", fontSize: "13px", fontFamily: "monospace", boxSizing: "border-box" }}
          />
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
            {show ? "" : ""}
          </button>
        </div>
        <button onClick={handleSave} disabled={!key.trim() || pending}
          style={{ background: key.trim() ? "#f97316" : "#e5e5e5", color: key.trim() ? "white" : "#a3a3a3", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: 700, cursor: key.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
          {pending ? "…" : saved ? " Guardado" : "Guardar"}
        </button>
      </div>

      {error && <p style={{ margin: 0, fontSize: "12px", color: "#dc2626" }}>{error}</p>}
      {saved && <p style={{ margin: 0, fontSize: "12px", color: "#16a34a" }}> API Key guardada. El Asistente IA ya está activo.</p>}
    </div>
  );
}
