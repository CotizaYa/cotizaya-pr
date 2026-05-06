import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Obtener instalaciones programadas
  const { data: installations } = await supabase
    .from("installations")
    .select(`
      *,
      clients(full_name, phone),
      quotes(quote_number, total)
    `)
    .eq("owner_id", user.id)
    .order("scheduled_at", { ascending: true });

  const events = installations ?? [];
  const today = new Date();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-black text-slate-900">Calendario de <span className="text-[#f97316]">Instalaciones</span></h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Organiza tus entregas y trabajos de campo</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {events.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No tienes instalaciones programadas</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Las instalaciones aparecerán aquí cuando las programes desde una cotización aceptada.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Vista de Agenda */}
            <div className="space-y-4">
              {events.map((event: any) => {
                const date = new Date(event.scheduled_at);
                const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                return (
                  <div 
                    key={event.id}
                    className={`bg-white rounded-2xl p-6 border-l-8 shadow-sm flex flex-col md:flex-row md:items-center gap-6 transition-all hover:shadow-md ${
                      isToday ? 'border-[#f97316]' : 'border-slate-200'
                    }`}
                  >
                    {/* Fecha y Hora */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-slate-100 pr-6">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-widest">
                        {format(date, 'MMM', { locale: es })}
                      </span>
                      <span className="text-3xl font-black text-slate-900">
                        {format(date, 'dd')}
                      </span>
                      <span className="text-xs font-bold text-[#f97316] mt-1">
                        {format(date, 'HH:mm')}
                      </span>
                    </div>

                    {/* Detalles del Cliente y Trabajo */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          Cotización #{event.quotes?.quote_number}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-orange-100 text-[#f97316] text-[10px] font-bold rounded uppercase tracking-wider animate-pulse">
                            Hoy
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{event.clients?.full_name}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">📞 {event.clients?.phone}</p>
                      {event.notes && (
                        <p className="text-xs text-slate-400 mt-3 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          " {event.notes} "
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3">
                      <button className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                        Ver Detalles
                      </button>
                      <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors">
                        Mapa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
