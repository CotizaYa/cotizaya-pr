"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login"|"register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState("");
  const [error, setError] = useState<string|null>(null);
  const [pending, start] = useTransition();

  function handle() {
    setError(null);
    const supabase = createClient();
    start(async () => {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
      } else {
        if (!business.trim()) { setError("Ingresa el nombre de tu empresa"); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { business_name: business.trim() } },
        });
        if (error) { setError(error.message); return; }
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fafafa", padding:"16px" }}>
      <div style={{ width:"100%", maxWidth:"380px", background:"white", borderRadius:"16px", border:"1px solid #e5e5e5", padding:"32px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ textAlign:"center", marginBottom:"24px" }}>
          <h1 style={{ margin:0, fontSize:"32px", fontWeight:800 }}>
            <span style={{ color:"#f97316" }}>Cotiza</span>
            <span style={{ color:"#171717" }}>Ya</span>
            <span style={{ color:"#171717", fontSize:"20px" }}>PR</span>
          </h1>
          <p style={{ margin:"6px 0 0", color:"#737373", fontSize:"14px" }}>
            {mode === "login" ? "Inicia sesión en tu cuenta" : "Crea tu cuenta — 14 días gratis"}
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {mode === "register" && (
            <label style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
              <span style={{ fontSize:"12px", fontWeight:600, color:"#525252" }}>Nombre de tu empresa</span>
              <input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Screen Pro PR"
                style={{ border:"1px solid #e5e5e5", borderRadius:"10px", padding:"10px 12px", fontSize:"14px", outline:"none" }} />
            </label>
          )}
          <label style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
            <span style={{ fontSize:"12px", fontWeight:600, color:"#525252" }}>Correo electrónico</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"
              style={{ border:"1px solid #e5e5e5", borderRadius:"10px", padding:"10px 12px", fontSize:"14px", outline:"none" }} />
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
            <span style={{ fontSize:"12px", fontWeight:600, color:"#525252" }}>Contraseña</span>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
              style={{ border:"1px solid #e5e5e5", borderRadius:"10px", padding:"10px 12px", fontSize:"14px", outline:"none" }} />
          </label>

          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", padding:"8px 12px", fontSize:"13px", color:"#dc2626" }}>
              {error}
            </div>
          )}

          <button onClick={handle} disabled={pending}
            style={{ background:"#f97316", color:"white", border:"none", borderRadius:"12px", padding:"12px", fontSize:"14px", fontWeight:700, cursor:"pointer", opacity:pending?0.6:1, marginTop:"4px" }}>
            {pending ? "Cargando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta gratis"}
          </button>
        </div>

        <p style={{ textAlign:"center", fontSize:"13px", color:"#737373", marginTop:"16px" }}>
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button onClick={()=>{ setMode(m=>m==="login"?"register":"login"); setError(null); }}
            style={{ background:"none", border:"none", color:"#f97316", fontWeight:700, cursor:"pointer", fontSize:"13px" }}>
            {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
