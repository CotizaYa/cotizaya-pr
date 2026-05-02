"use client";
import { useState } from "react";
import { upsertPrice } from "./actions";

interface Product { id:string; code:string|null; name:string; category:string; price_type:string; base_price:number; unit_label:string|null; }
const TYPE_LABEL: Record<string,string> = { por_unidad:"/ unidad", por_pie_cuadrado:"/ pie²", por_pie_lineal:"/ pie" };

export function PriceTable({ label, products, priceMap }: { label:string; products:Product[]; priceMap:Map<string,number>; }) {
  const [values, setValues] = useState<Record<string,string>>(() => {
    const m: Record<string,string> = {};
    for (const p of products) { const c = priceMap.get(p.id); m[p.id] = c != null ? String(c) : ""; }
    return m;
  });
  const [saving, setSaving] = useState<Record<string,boolean>>({});
  const [saved,  setSaved]  = useState<Record<string,boolean>>({});

  async function save(id: string) {
    const n = parseFloat(values[id]);
    if (isNaN(n) || n < 0) return;
    setSaving(s=>({...s,[id]:true}));
    await upsertPrice(id, n);
    setSaving(s=>({...s,[id]:false}));
    setSaved(s=>({...s,[id]:true}));
    setTimeout(()=>setSaved(s=>({...s,[id]:false})), 2000);
  }

  return (
    <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden", marginBottom:"12px" }}>
      <div style={{ background:"#fafafa", borderBottom:"1px solid #e5e5e5", padding:"8px 16px" }}>
        <span style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"#737373" }}>■ {label}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 130px 140px 50px", gap:"8px", padding:"6px 16px", borderBottom:"1px solid #f5f5f5" }}>
        {["Código","Producto","Precio base","Mi precio",""].map(h=>(
          <span key={h} style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:"#a3a3a3" }}>{h}</span>
        ))}
      </div>
      {products.map((p, i) => (
        <div key={p.id} style={{ display:"grid", gridTemplateColumns:"60px 1fr 130px 140px 50px", gap:"8px", alignItems:"center", padding:"8px 16px", background:i%2===0?"white":"#fafafa", borderBottom:"1px solid #f5f5f5" }}>
          <span style={{ fontFamily:"monospace", fontSize:"11px", color:"#f97316" }}>{p.code}</span>
          <span style={{ fontSize:"13px", color:"#171717" }}>{p.name}</span>
          <span style={{ fontSize:"12px", color:"#737373" }}>${p.base_price.toFixed(2)} <span style={{ fontSize:"10px" }}>{TYPE_LABEL[p.price_type]}</span></span>
          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
            <span style={{ fontSize:"12px", color:"#737373" }}>$</span>
            <input type="number" min="0" step="0.01" value={values[p.id]} placeholder={String(p.base_price.toFixed(2))}
              onChange={e=>setValues(v=>({...v,[p.id]:e.target.value}))}
              onBlur={()=>save(p.id)}
              style={{ width:"90px", border:"1px solid #e5e5e5", borderRadius:"6px", padding:"4px 8px", fontSize:"13px" }} />
          </div>
          <span style={{ fontSize:"12px", fontWeight:600 }}>
            {saving[p.id] ? <span style={{ color:"#a3a3a3" }}>…</span> : saved[p.id] ? <span style={{ color:"#16a34a" }}>✓</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
