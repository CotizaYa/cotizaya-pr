import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatUSD } from "@/lib/calculations";

const STATUS_LABEL: Record<string,string> = { draft:"Borrador", sent:"Enviada", viewed:"Vista", accepted:"Aprobada", rejected:"Rechazada", expired:"Expirada" };
const STATUS_COLOR: Record<string,string> = { draft:"#f3f4f6", sent:"#dbeafe", viewed:"#fef9c3", accepted:"#dcfce7", rejected:"#fee2e2", expired:"#f3f4f6" };
const STATUS_TEXT: Record<string,string>  = { draft:"#6b7280", sent:"#1d4ed8", viewed:"#854d0e", accepted:"#15803d", rejected:"#dc2626", expired:"#6b7280" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: quotes } = await supabase
    .from("quotes").select("id, quote_number, status, total, created_at, clients(full_name)")
    .eq("owner_id", user.id).order("created_at", { ascending: false }).limit(10);

  const all = quotes ?? [];
  const now = new Date();
  const som = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = all.filter((q:any) => q.created_at >= som);
  const aprobadas = all.filter((q:any) => q.status === "accepted");
  const pendientes = all.filter((q:any) => ["draft","sent","viewed"].includes(q.status));

  // Ventas este mes = cotizaciones con status 'accepted' creadas este mes
  const ventasMes = all.filter((q:any) => q.status === 'accepted' && q.created_at >= som);
  const totalVentasMes = ventasMes.reduce((s:number, q:any) => s + Number(q.total), 0);

  const stats = [
    { label:"Pendiente de cobro", value:formatUSD(pendientes.reduce((s:number,q:any)=>s+Number(q.total),0)), sub:`${pendientes.length} activas`, color:"#2563eb", icon:"⏳" },
    { label:"IVU recolectado", value:formatUSD(ventasMes.reduce((s:number,q:any)=>s+(Number(q.total)*0.115/1.115),0)), sub:"11.5% este mes", color:"#7c3aed", icon:"💰" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-24">
      {/* Header Premium */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {now.toLocaleDateString("es-PR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>
          <Link href="/dashboard/cotizaciones/nueva" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f97316] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95">
            <span className="text-xl">✚</span> Nueva Cotización
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ══ WIDGET VENTAS ESTE MES ══ */}
        <div className="relative bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 mb-8 overflow-hidden shadow-xl shadow-green-200/30">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <p className="text-green-100 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              Trabajos confirmados
            </p>
            <p className="text-white font-black text-5xl md:text-6xl tabular-nums mb-3">
              {formatUSD(totalVentasMes)}
            </p>
            <p className="text-green-200 text-sm font-medium">
              {ventasMes.length} cotizaci{ventasMes.length === 1 ? 'ón' : 'ones'} cerrada{ventasMes.length === 1 ? '' : 's'} en {now.toLocaleDateString('es-PR', { month: 'long' })}
            </p>
          </div>
        </div>

        {/* Stats Grid - Secondary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map(s => (
            <div 
              key={s.label} 
              className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                style={{ background: s.color }}
              />
              
              {/* Icon */}
              <div className="text-3xl mb-4">{s.icon}</div>
              
              {/* Content */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent Quotes Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-bold text-slate-900">Cotizaciones Recientes</h2>
            <Link href="/dashboard/cotizaciones" className="text-sm font-bold text-[#f97316] hover:text-orange-600 transition-colors">
              Ver todas →
            </Link>
          </div>

          {/* Content */}
          {all.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-slate-600 font-medium mb-4">Aún no tienes cotizaciones</p>
              <Link href="/dashboard/cotizaciones/nueva" className="inline-block text-sm font-bold text-[#f97316] hover:text-orange-600">
                Crear la primera →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {all.map((q:any) => (
                <Link 
                  key={q.id}
                  href={`/dashboard/cotizaciones/${q.id}`} 
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-[#f97316] transition-colors">
                      {(q as any).clients?.full_name ?? "Sin cliente"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      #{q.quote_number} · {new Date(q.created_at).toLocaleDateString("es-PR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ 
                        background: STATUS_COLOR[q.status], 
                        color: STATUS_TEXT[q.status]
                      }}
                    >
                      {STATUS_LABEL[q.status]}
                    </span>
                    <span className="text-sm font-black text-slate-900 min-w-fit">{formatUSD(q.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
