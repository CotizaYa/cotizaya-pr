import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewSupplierForm } from "./NewSupplierForm";

const CAT_LABEL: Record<string, string> = {
  aluminio: "Aluminio / Perfiles",
  vidrio: "Cristales / Vidrio",
  screen: "Screen / Malla",
  herrajes: "Herrajes y Goznes",
  tornilleria: "Tornillería",
  pintura: "Pintura / Selladores",
  construccion: "Materiales de Construcción",
  miscelanea: "Miscelánea",
};

const CAT_ICON: Record<string, string> = {
  aluminio: "🔩", vidrio: "🪟", screen: "🕸️", herrajes: "🔧",
  tornilleria: "⚙️", pintura: "🎨", construccion: "🏗️", miscelanea: "📦",
};

const CAT_COLOR: Record<string, string> = {
  aluminio: "#dbeafe", vidrio: "#e0f2fe", screen: "#dcfce7",
  herrajes: "#fef9c3", tornilleria: "#f3e8ff", pintura: "#fce7f3",
  construccion: "#fff7ed", miscelanea: "#f5f5f5",
};

export default async function SuplidoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .eq("owner_id", user.id)
    .order("category")
    .order("name");

  const all = suppliers ?? [];

  // Group by category
  const grouped: Record<string, typeof all> = {};
  for (const s of all) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#171717" }}>📞 Mis Suplidores</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#737373" }}>
            {all.length} suplidores guardados · El Asistente IA los usará para consultar precios en tiempo real
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)", border: "1px solid #fed7aa", borderRadius: "14px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "24px" }}>🤖</span>
        <div>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#c2410c" }}>Próximamente: Consulta automática de precios</p>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#92400e" }}>
            Cuando el Asistente IA necesite precios actualizados, enviará un WhatsApp automático a tus suplidores y traerá la respuesta de vuelta en segundos.
          </p>
        </div>
      </div>

      <NewSupplierForm />

      {all.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "48px", textAlign: "center", marginTop: "16px" }}>
          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📞</p>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#171717", margin: "0 0 6px" }}>Sin suplidores aún</p>
          <p style={{ fontSize: "13px", color: "#737373" }}>Agrega tus suplidores de confianza para que el asistente pueda consultarles precios</p>
        </div>
      ) : (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ background: CAT_COLOR[cat] ?? "#fafafa", padding: "10px 18px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>{CAT_ICON[cat] ?? "📦"}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#404040" }}>
                  {CAT_LABEL[cat] ?? cat}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "#737373" }}>{items.length} suplidor{items.length !== 1 ? "es" : ""}</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {items.map((s: any) => (
                  <li key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #fafafa" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "38px", height: "38px", background: "#fff7ed", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#f97316" }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#171717" }}>{s.name}</p>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "2px" }}>
                          {s.phone && (
                            <a href={`tel:${s.phone}`} style={{ fontSize: "12px", color: "#737373", textDecoration: "none" }}>
                              📱 {s.phone}
                            </a>
                          )}
                          {s.whatsapp && (
                            <a href={`https://wa.me/1${s.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "12px", color: "#16a34a", textDecoration: "none", fontWeight: 600 }}>
                              💬 WhatsApp
                            </a>
                          )}
                          {s.email && <span style={{ fontSize: "12px", color: "#737373" }}>✉️ {s.email}</span>}
                        </div>
                        {s.notes && <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#a3a3a3" }}>{s.notes}</p>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {s.whatsapp && (
                        <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: "999px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>
                          WA Listo
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
