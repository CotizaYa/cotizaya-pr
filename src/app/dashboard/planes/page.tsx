import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PLANS = [
  {
    id: "basic",
    name: "Básico",
    price: 0,
    description: "Perfecto para comenzar",
    features: [
      "Cotizador ilimitado",
      "Dashboard con estadísticas",
      "Catálogo de productos",
      "Calendario de instalaciones",
      "Soporte por email",
    ],
    cta: "Actual",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Para negocios en crecimiento",
    features: [
      "Todo lo de Básico +",
      "🤖 Chatbot de seguimiento",
      "Cotizaciones mensuales automáticas",
      "Integración WhatsApp",
      "Hasta 50 clientes activos",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    cta: "Suscribirse",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "Solución completa para grandes equipos",
    features: [
      "Todo lo de Pro +",
      "Chatbot ilimitado",
      "Clientes ilimitados",
      "API REST completa",
      "Webhooks personalizados",
      "Integraciones avanzadas",
      "Soporte 24/7 dedicado",
      "Consultoría estratégica",
    ],
    cta: "Contactar",
    highlighted: false,
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
        <div className="grid md:grid-cols-3 gap-6">
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
                    ✓ Plan Actual
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
                <button
                  className={`w-full py-3 px-4 rounded-xl font-bold mb-8 transition-all ${
                    isCurrentPlan
                      ? plan.highlighted
                        ? "bg-white/20 text-white cursor-default"
                        : "bg-slate-100 text-slate-600 cursor-default"
                      : plan.highlighted
                      ? "bg-white text-[#f97316] hover:bg-slate-50 active:scale-95"
                      : "bg-[#f97316] text-white hover:bg-orange-600 active:scale-95"
                  }`}
                  disabled={isCurrentPlan}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className={`text-lg mt-0.5 ${
                        plan.highlighted ? "text-white" : "text-[#f97316]"
                      }`}>
                        ✓
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
