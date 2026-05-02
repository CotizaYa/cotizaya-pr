"use client";
import { useState, useTransition } from "react";
import { parseFraction, calcLineTotal, calcQuoteTotals, formatUSD } from "@/lib/calculations";

const CATS: Record<string,string> = {
  puerta:"Puertas", ventana:"Ventanas", closet:"Closets", screen:"Screen",
  aluminio:"Aluminio", cristal:"Cristales", tornilleria:"Tornillería", miscelanea:"Miscelánea"
};

interface Product { id:string; code:string|null; name:string; category:string; price_type:string; base_price:number; unit_label:string|null; }
interface UserPrice { product_id:string; price:number; }
interface Client { id:string; full_name:string; }

interface QuoteItem {
  tempId: string;
  product: Product;
  unitPrice: number;
  widthStr: string;
  heightStr: string;
  quantity: number;
  lineTotal: number;
  color: string;
  tipoVidrio: string;
}

export function QuoteBuilder({
  products, userPrices, clients, suggestedQuoteNumber
}: {
  products: Product[];
  userPrices: UserPrice[];
  clients: Client[];
  suggestedQuoteNumber: string;
}) {
  const priceMap = new Map(userPrices.map(p => [p.product_id, Number(p.price)]));
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [clientId, setClientId] = useState("");
  const [quoteNumber, setQuoteNumber] = useState(suggestedQuoteNumber);
  const [notes, setNotes] = useState("");
  const [ivuRate, setIvuRate] = useState(0.115);
  const [depositRate, setDepositRate] = useState(0.50);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const filteredProducts = products.filter(p => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.code ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function addProduct(p: Product) {
    const unitPrice = priceMap.get(p.id) ?? p.base_price;
    const newItem: QuoteItem = {
      tempId: crypto.randomUUID(),
      product: p,
      unitPrice,
      widthStr: "",
      heightStr: "",
      quantity: 1,
      lineTotal: calcLineTotal({ priceType: p.price_type as any, unitPrice, quantity: 1 }),
      color: "",
      tipoVidrio: "",
    };
    setItems(prev => [...prev, newItem]);
  }

  function updateItem(tempId: string, changes: Partial<QuoteItem>) {
    setItems(prev => prev.map(item => {
      if (item.tempId !== tempId) return item;
      const updated = { ...item, ...changes };
      const lineTotal = calcLineTotal({
        priceType: updated.product.price_type as any,
        unitPrice: updated.unitPrice,
        widthInches: parseFraction(updated.widthStr),
        heightInches: parseFraction(updated.heightStr),
        quantity: updated.quantity,
      });
      return { ...updated, lineTotal };
    }));
  }

  function removeItem(tempId: string) {
    setItems(prev => prev.filter(i => i.tempId !== tempId));
  }

  const totals = calcQuoteTotals({
    items: items.map(i => ({ line_total: i.lineTotal, category_snapshot: i.product.category })),
    ivuRate,
    depositRate,
  });

  function handleSave() {
    setError(null);
    if (items.length === 0) { setError("Agrega al menos un producto"); return; }
    start(async () => {
      const { createAndRedirect } = await import("@/app/api/quotes/actions");
      try {
        await createAndRedirect({
          quoteNumber,
          clientId: clientId || null,
          notes,
          ivuRate,
          depositRate,
          items: items.map((item, i) => ({
            productId: item.product.id,
            position: i,
            nameSnapshot: item.product.name,
            categorySnapshot: item.product.category,
            priceTypeSnapshot: item.product.price_type,
            unitPriceSnapshot: item.unitPrice,
            widthInches: parseFraction(item.widthStr) || null,
            heightInches: parseFraction(item.heightStr) || null,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            metadata: { color: item.color, tipo_vidrio: item.tipoVidrio },
          })),
        });
      } catch (e: any) {
        setError(e.message ?? "Error al guardar");
      }
    });
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"16px", maxWidth:"1100px" }}>
      {/* Left: catalog + items */}
      <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
        {/* Catalog */}
        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #f5f5f5" }}>
            <p style={{ margin:"0 0 8px", fontSize:"12px", fontWeight:700, color:"#525252", textTransform:"uppercase", letterSpacing:"0.05em" }}>Catálogo de Productos</p>
            <div style={{ display:"flex", gap:"8px" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto…"
                style={{ flex:1, border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px", outline:"none" }} />
              <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
                style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"12px", outline:"none" }}>
                <option value="all">Todas</option>
                {Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ maxHeight:"280px", overflowY:"auto" }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", borderBottom:"1px solid #fafafa", cursor:"pointer" }}
                onClick={() => addProduct(p)}>
                <div>
                  <span style={{ fontSize:"12px", fontFamily:"monospace", color:"#f97316", marginRight:"6px" }}>{p.code}</span>
                  <span style={{ fontSize:"13px", color:"#171717" }}>{p.name}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"12px", color:"#737373" }}>${(priceMap.get(p.id) ?? p.base_price).toFixed(2)}</span>
                  <button style={{ background:"#f97316", color:"white", border:"none", borderRadius:"6px", padding:"3px 8px", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>+</button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p style={{ padding:"20px", textAlign:"center", fontSize:"13px", color:"#a3a3a3" }}>No hay productos</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", borderBottom:"1px solid #f5f5f5" }}>
            <p style={{ margin:0, fontSize:"12px", fontWeight:700, color:"#525252", textTransform:"uppercase", letterSpacing:"0.05em" }}>Ítems ({items.length})</p>
          </div>
          {items.length === 0 ? (
            <p style={{ padding:"24px", textAlign:"center", fontSize:"13px", color:"#a3a3a3" }}>Toca un producto del catálogo para agregarlo</p>
          ) : (
            <ul style={{ margin:0, padding:0, listStyle:"none" }}>
              {items.map(item => (
                <li key={item.tempId} style={{ padding:"10px 16px", borderBottom:"1px solid #fafafa" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"#171717" }}>{item.product.name}</span>
                    <button onClick={()=>removeItem(item.tempId)}
                      style={{ background:"none", border:"none", color:"#a3a3a3", cursor:"pointer", fontSize:"16px", lineHeight:1 }}>✕</button>
                  </div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {item.product.price_type === "por_pie_cuadrado" && (
                      <>
                        <label style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                          <span style={{ fontSize:"10px", color:"#737373" }}>Ancho (ej: 24 3/4)</span>
                          <input value={item.widthStr} onChange={e=>updateItem(item.tempId,{widthStr:e.target.value})}
                            placeholder='ej: 36 1/2' style={{ width:"90px", border:"1px solid #e5e5e5", borderRadius:"6px", padding:"4px 6px", fontSize:"12px" }} />
                        </label>
                        <label style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                          <span style={{ fontSize:"10px", color:"#737373" }}>Alto</span>
                          <input value={item.heightStr} onChange={e=>updateItem(item.tempId,{heightStr:e.target.value})}
                            placeholder='ej: 80' style={{ width:"80px", border:"1px solid #e5e5e5", borderRadius:"6px", padding:"4px 6px", fontSize:"12px" }} />
                        </label>
                      </>
                    )}
                    {item.product.price_type === "por_pie_lineal" && (
                      <label style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                        <span style={{ fontSize:"10px", color:"#737373" }}>Longitud (pulgadas)</span>
                        <input value={item.widthStr} onChange={e=>updateItem(item.tempId,{widthStr:e.target.value})}
                          placeholder='ej: 96' style={{ width:"90px", border:"1px solid #e5e5e5", borderRadius:"6px", padding:"4px 6px", fontSize:"12px" }} />
                      </label>
                    )}
                    <label style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                      <span style={{ fontSize:"10px", color:"#737373" }}>Cant.</span>
                      <input type="number" min="1" value={item.quantity} onChange={e=>updateItem(item.tempId,{quantity:Math.max(1,parseInt(e.target.value)||1)})}
                        style={{ width:"55px", border:"1px solid #e5e5e5", borderRadius:"6px", padding:"4px 6px", fontSize:"12px" }} />
                    </label>
                    <label style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                      <span style={{ fontSize:"10px", color:"#737373" }}>Color</span>
                      <input value={item.color} onChange={e=>updateItem(item.tempId,{color:e.target.value})}
                        placeholder="Blanco" style={{ width:"70px", border:"1px solid #e5e5e5", borderRadius:"6px", padding:"4px 6px", fontSize:"12px" }} />
                    </label>
                    <div style={{ marginLeft:"auto", textAlign:"right" }}>
                      <span style={{ fontSize:"10px", color:"#737373", display:"block" }}>Total línea</span>
                      <span style={{ fontSize:"14px", fontWeight:700, color:"#171717" }}>{formatUSD(item.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right: summary + save */}
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"16px" }}>
          <p style={{ margin:"0 0 12px", fontSize:"12px", fontWeight:700, color:"#525252", textTransform:"uppercase", letterSpacing:"0.05em" }}>Cotización</p>
          <label style={{ display:"flex", flexDirection:"column", gap:"3px", marginBottom:"8px" }}>
            <span style={{ fontSize:"11px", color:"#737373" }}>Número</span>
            <input value={quoteNumber} onChange={e=>setQuoteNumber(e.target.value)}
              style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px" }} />
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:"3px", marginBottom:"8px" }}>
            <span style={{ fontSize:"11px", color:"#737373" }}>Cliente</span>
            <select value={clientId} onChange={e=>setClientId(e.target.value)}
              style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px" }}>
              <option value="">Sin cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:"3px", marginBottom:"8px" }}>
            <span style={{ fontSize:"11px", color:"#737373" }}>Notas</span>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
              style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px", resize:"vertical" }} />
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            <label style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
              <span style={{ fontSize:"11px", color:"#737373" }}>IVU %</span>
              <input type="number" step="0.1" value={(ivuRate*100).toFixed(1)}
                onChange={e=>setIvuRate(parseFloat(e.target.value)/100||0.115)}
                style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px" }} />
            </label>
            <label style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
              <span style={{ fontSize:"11px", color:"#737373" }}>Depósito %</span>
              <input type="number" step="5" value={(depositRate*100).toFixed(0)}
                onChange={e=>setDepositRate(parseFloat(e.target.value)/100||0.5)}
                style={{ border:"1px solid #e5e5e5", borderRadius:"8px", padding:"7px 10px", fontSize:"13px" }} />
            </label>
          </div>
        </div>

        {/* Totals */}
        <div style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:"12px", padding:"16px" }}>
          <p style={{ margin:"0 0 10px", fontSize:"12px", fontWeight:700, color:"#525252", textTransform:"uppercase", letterSpacing:"0.05em" }}>Totales</p>
          {[
            ["Materiales", totals.subtotalMaterials],
            ["Mano de obra", totals.subtotalLabor],
            [`IVU (${(ivuRate*100).toFixed(1)}%)`, totals.ivuAmount],
          ].map(([label, val]) => (
            <div key={String(label)} style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span style={{ fontSize:"13px", color:"#525252" }}>{label}</span>
              <span style={{ fontSize:"13px" }}>{formatUSD(Number(val))}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e5e5e5", paddingTop:"8px", marginTop:"6px" }}>
            <span style={{ fontSize:"15px", fontWeight:700 }}>TOTAL</span>
            <span style={{ fontSize:"15px", fontWeight:700, color:"#f97316" }}>{formatUSD(totals.total)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
            <span style={{ fontSize:"12px", color:"#737373" }}>Depósito ({(depositRate*100).toFixed(0)}%)</span>
            <span style={{ fontSize:"13px", fontWeight:600, color:"#f97316" }}>{formatUSD(totals.depositAmount)}</span>
          </div>
        </div>

        {error && <p style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", padding:"8px 12px", fontSize:"13px", color:"#dc2626", margin:0 }}>{error}</p>}

        <button onClick={handleSave} disabled={pending||items.length===0}
          style={{ background:items.length===0?"#d4d4d4":"#f97316", color:"white", border:"none", borderRadius:"12px", padding:"14px", fontSize:"14px", fontWeight:700, cursor:items.length===0?"not-allowed":"pointer", opacity:pending?0.7:1 }}>
          {pending ? "Guardando…" : "💾 Guardar Cotización"}
        </button>
      </div>
    </div>
  );
}
