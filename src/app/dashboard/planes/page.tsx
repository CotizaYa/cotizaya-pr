import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PLAN_WHATSAPP: Record<string, string> = {
  starter: encodeURIComponent('Hola, quiero suscribirme al plan CotizaYa Starter por $15/mes. ¿Cómo procedo?'),
  pro:     encodeURIComponent('Hola, quiero suscribirme al plan CotizaYa Pro por $25/mes. ¿Cómo procedo?'),
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 15,
    description: "Para contratistas independientes",
    features: [
      "Cotizador ilimitado",
      "Catálogo de 63+ modelos",
      "Share link profesional",
      "Dashboard con estadísticas",
      "Calendario de instalaciones",
      "Soporte por email",
    ],
    cta: "Suscribirse",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 25,
    description: "Para talleres en crecimiento",
    features: [
      "Todo lo de Starter +",
      "Asistente IA incluido",
      "Factura con logo del negocio",
      "Mis Precios personalizados",
      "Hojas de corte automáticas",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    cta: "Suscribirse",
    highlighted: true,
  },
];

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  const currentPlan = subscription?.plan || "basic";

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-slate-900">
            Planes y <span className="text-[#f97316]">Precios</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Elige el plan perfecto para tu negocio
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-[#f97316] to-orange-600 text-white shadow-2xl scale-105 md:scale-110"
                    : "bg-white border-2 border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Badge */}
                {isCurrentPlan && (
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                    plan.highlighted ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                  }`}>
                     Plan Actual
                  </div>
                )}

                {/* Plan Name */}
                <h2 className={`text-2xl font-black mb-2 ${
                  plan.highlighted ? "text-white" : "text-slate-900"
                }`}>
                  {plan.name}
                </h2>
                <p className={`text-sm font-medium mb-6 ${
                  plan.highlighted ? "text-white/80" : "text-slate-500"
                }`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className={`text-5xl font-black ${
                    plan.highlighted ? "text-white" : "text-slate-900"
                  }`}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm font-medium ml-2 ${
                    plan.highlighted ? "text-white/80" : "text-slate-500"
                  }`}>
                    /mes
                  </span>
                </div>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <button
                    className={`w-full py-3 px-4 rounded-xl font-bold mb-8 cursor-default ${
                      plan.highlighted ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                    disabled
                  >
                    Plan Actual
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/17879444914?text=${PLAN_WHATSAPP[plan.id]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl font-bold mb-8 transition-all flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? 'bg-white text-[#f97316] hover:bg-slate-50'
                        : 'bg-[#f97316] text-white hover:bg-orange-600'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {plan.cta}
                  </a>
                )}

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className={`text-lg mt-0.5 ${
                        plan.highlighted ? "text-white" : "text-[#f97316]"
                      }`}>
                        
                      </span>
                      <span className={`text-sm font-medium ${
                        plan.highlighted ? "text-white/90" : "text-slate-700"
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-3xl p-12 border-2 border-slate-200">
          <h3 className="text-2xl font-black text-slate-900 mb-8">
            Preguntas Frecuentes
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h4>
              <p className="text-slate-600 text-sm">
                Sí, puedes cambiar de plan o cancelar tu suscripción en cualquier momento. Los cambios se aplican al próximo ciclo de facturación.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                ¿Qué métodos de pago aceptan?
              </h4>
              <p className="text-slate-600 text-sm">
                Aceptamos todas las tarjetas de crédito (Visa, Mastercard, American Express) a través de Stripe. También disponible transferencia bancaria para planes Enterprise.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">
                ¿Hay período de prueba?
              </h4>
              <p className="text-slate-600 text-sm">
                Sí, todos los planes Pro y Enterprise incluyen 14 días de prueba gratuita. Sin necesidad de tarjeta de crédito.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
