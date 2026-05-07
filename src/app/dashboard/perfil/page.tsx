import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApiKeyForm } from "./ApiKeyForm";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, phone, email, anthropic_api_key")
    .eq("id", user.id)
    .single();

  const hasKey = !!(profile?.anthropic_api_key);
  const maskedKey = hasKey
    ? `sk-ant-...${profile.anthropic_api_key.slice(-6)}`
    : null;

  return (
    <div style={{ padding: "24px", maxWidth: "640px", margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "#171717" }}> Configuración</h1>
      <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#737373" }}>Perfil y ajustes de tu cuenta</p>

      {/* Business info */}
      <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
        <p style={{ margin: "0 0 14px", fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.05em" }}>Información del Negocio</p>
        <div style={{ display: "grid", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #fafafa" }}>
            <span style={{ fontSize: "13px", color: "#737373" }}>Empresa</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#171717" }}>{profile?.business_name ?? "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #fafafa" }}>
            <span style={{ fontSize: "13px", color: "#737373" }}>Email</span>
            <span style={{ fontSize: "13px", color: "#171717" }}>{user.email}</span>
          </div>
        </div>
      </div>

      {/* Anthropic API Key */}
      <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "24px" }}></span>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#171717" }}>Asistente IA — API Key de Anthropic</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#737373" }}>
              {hasKey ? " Asistente activado" : " Sin API Key — Asistente desactivado"}
            </p>
          </div>
        </div>

        {/* Info box */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>¿Cómo obtener tu API Key?</p>
          <ol style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#1e40af", lineHeight: 1.7 }}>
            <li>Ve a <strong>console.anthropic.com</strong></li>
            <li>Crea una cuenta gratuita</li>
            <li>Agrega $5 de crédito (dura meses con uso normal)</li>
            <li>Ve a <strong>API Keys → Create Key</strong></li>
            <li>Copia la key y pégala aquí abajo</li>
          </ol>
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#3b82f6" }}>
             Costo aproximado: $0.02–$0.04 por conversación · $5 dura ~150–200 consultas
          </p>
        </div>

        <ApiKeyForm currentKey={maskedKey} />
      </div>

      {/* Danger zone */}
      <div style={{ background: "white", border: "1px solid #fecaca", borderRadius: "14px", padding: "20px" }}>
        <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em" }}>Zona de peligro</p>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#737373" }}>Para cerrar sesión en este dispositivo:</p>
        <form action="/api/auth/signout" method="POST">
          <a href="/login" style={{ display: "inline-block", background: "white", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
            Cerrar sesión
          </a>
        </form>
      </div>
    </div>
  );
}
