"use client";
import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function QuoteAcceptance({ token }: { token: string }) {
  const [step, setStep] = useState<"idle"|"accept"|"reject"|"done">("idle");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [result, setResult] = useState<"accepted"|"rejected"|null>(null);
  const [pending, start] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function startDraw(e: React.PointerEvent) {
    drawing.current = true;
    const c = canvasRef.current; if(!c) return;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    ctx.beginPath(); ctx.moveTo(e.clientX-r.left, e.clientY-r.top);
  }
  function draw(e: React.PointerEvent) {
    if(!drawing.current) return;
    const c = canvasRef.current; if(!c) return;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    ctx.lineWidth=2; ctx.strokeStyle="#111"; ctx.lineCap="round";
    ctx.lineTo(e.clientX-r.left, e.clientY-r.top); ctx.stroke();
  }
  function stopDraw() { drawing.current = false; }
  function clearCanvas() { const c = canvasRef.current; if(c) c.getContext("2d")!.clearRect(0,0,c.width,c.height); }

  function accept() {
    start(async () => {
      const sig = canvasRef.current?.toDataURL() ?? "";
      await createClient().rpc("log_quote_event", { p_token:token, p_event:"accepted", p_payload:{name,signature:sig} });
      setResult("accepted"); setStep("done");
    });
  }
  function reject() {
    start(async () => {
      await createClient().rpc("log_quote_event", { p_token:token, p_event:"rejected", p_payload:{comment} });
      setResult("rejected"); setStep("done");
    });
  }

  if (step === "done") return (
    <div style={{ background:result==="accepted"?"#dcfce7":"#fee2e2", border:`1px solid ${result==="accepted"?"#86efac":"#fca5a5"}`, borderRadius:"12px", padding:"20px", textAlign:"center" }}>
      <p style={{ margin:0, fontSize:"16px", fontWeight:700, color:result==="accepted"?"#15803d":"#dc2626" }}>
        {result==="accepted" ? "✓ Cotización aprobada" : "Cotización rechazada"}
      </p>
      <p style={{ margin:"6px 0 0", fontSize:"13px", color:result==="accepted"?"#166534":"#b91c1c" }}>
        {result==="accepted" ? "El contratista recibirá una notificación." : "El contratista fue notificado."}
      </p>
    </div>
  );

  if (step === "idle") return (
    <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
      <button onClick={()=>setStep("accept")} style={{ background:"#f97316", color:"white", border:"none", borderRadius:"12px", padding:"14px", fontSize:"14px", fontWeight:700, cursor:"pointer" }}>
        ✓ Aprobar cotización
      </button>
      <button onClick={()=>setStep("reject")} style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"12px", fontSize:"13px", color:"#525252", cursor:"pointer" }}>
        Rechazar
      </button>
    </div>
  );

  if (step === "accept") return (
    <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"16px" }}>
      <p style={{ margin:"0 0 12px", fontSize:"14px", fontWeight:700, color:"#171717" }}>Aprobar cotización</p>
      <label style={{ display:"flex", flexDirection:"column", gap:"3px", marginBottom:"10px" }}>
        <span style={{ fontSize:"12px", color:"#737373" }}>Nombre completo *</span>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Juan Pérez"
          style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"8px 10px", fontSize:"13px" }} />
      </label>
      <div style={{ marginBottom:"10px" }}>
        <span style={{ fontSize:"12px", color:"#737373" }}>Firma (opcional)</span>
        <canvas ref={canvasRef} width={500} height={100}
          style={{ display:"block", width:"100%", border:"1px solid #e5e5e5", borderRadius:"8px", background:"#fafafa", marginTop:"4px", touchAction:"none" }}
          onPointerDown={startDraw} onPointerMove={draw} onPointerUp={stopDraw} onPointerLeave={stopDraw} />
        <button onClick={clearCanvas} style={{ background:"none", border:"none", fontSize:"11px", color:"#a3a3a3", cursor:"pointer", marginTop:"2px" }}>Borrar firma</button>
      </div>
      <div style={{ display:"flex", gap:"8px" }}>
        <button onClick={accept} disabled={!name.trim()||pending}
          style={{ flex:1, background:"#f97316", color:"white", border:"none", borderRadius:"10px", padding:"10px", fontSize:"13px", fontWeight:700, cursor:"pointer", opacity:(!name.trim()||pending)?0.5:1 }}>
          {pending ? "Confirmando…" : "Confirmar aprobación"}
        </button>
        <button onClick={()=>setStep("idle")} style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"10px", padding:"10px 14px", fontSize:"13px", cursor:"pointer" }}>Atrás</button>
      </div>
    </div>
  );

  return (
    <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"16px" }}>
      <p style={{ margin:"0 0 10px", fontSize:"14px", fontWeight:700, color:"#171717" }}>¿Por qué rechaza?</p>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Comentario opcional…"
        style={{ width:"100%", border:"1px solid #e5e5e5", borderRadius:"8px", padding:"8px 10px", fontSize:"13px", resize:"vertical", boxSizing:"border-box" }} />
      <div style={{ display:"flex", gap:"8px", marginTop:"10px" }}>
        <button onClick={reject} disabled={pending}
          style={{ flex:1, background:"#dc2626", color:"white", border:"none", borderRadius:"10px", padding:"10px", fontSize:"13px", fontWeight:700, cursor:"pointer", opacity:pending?0.5:1 }}>
          {pending ? "…" : "Rechazar"}
        </button>
        <button onClick={()=>setStep("idle")} style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"10px", padding:"10px 14px", fontSize:"13px", cursor:"pointer" }}>Atrás</button>
      </div>
    </div>
  );
}
