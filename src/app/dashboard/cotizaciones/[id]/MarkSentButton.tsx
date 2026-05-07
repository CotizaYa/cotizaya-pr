"use client";
import { useTransition } from "react";
import { markQuoteSent } from "@/app/api/quotes/actions";
export function MarkSentButton({ quoteId }: { quoteId: string }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(() => markQuoteSent(quoteId))}
      style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"10px", padding:"8px 14px", fontSize:"13px", fontWeight:600, color:"#1d4ed8", cursor:"pointer", opacity:pending?0.6:1 }}>
      {pending ? "Guardando…" : " Marcar Enviada"}
    </button>
  );
}
