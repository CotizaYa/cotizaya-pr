"use client";
import { useState } from "react";
export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
      style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"10px", padding:"8px 14px", fontSize:"13px", fontWeight:600, color:"#404040", cursor:"pointer" }}>
      {copied ? "✓ Copiado" : "🔗 Copiar link"}
    </button>
  );
}
