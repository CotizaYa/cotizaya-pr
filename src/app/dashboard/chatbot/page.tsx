"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChatbotPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener suscripción
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      setSubscription(sub);

      // Obtener configuración del chatbot
      const { data: chatbotSettings } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      setSettings(chatbotSettings || {
        whatsapp_phone: "",
        auto_create_quote: true,
        enabled: false,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("chatbot_settings")
        .upsert({
          owner_id: user.id,
          ...settings,
        });

      if (error) throw error;

      alert("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar si tiene suscripción Pro o Enterprise
  const hasAccess = subscription?.plan && ["pro", "enterprise"].includes(subscription.plan);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-slate-900">
            🤖 Chatbot de <span className="text-[#f97316]">Seguimiento</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Configura tu asistente automático de cotizaciones
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!hasAccess ? (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-12 border-2 border-[#f97316] text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Función Exclusiva Pro
            </h2>
            <p className="text-slate-700 font-medium mb-8 max-w-md mx-auto">
              El Chatbot de Seguimiento está disponible en los planes Pro y Enterprise.
            </p>
            <a
              href="/dashboard/planes"
              className="inline-block px-8 py-3 bg-[#f97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Ver Planes
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Estado del Chatbot</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, enabled: e.target.checked })
                    }
                    className="w-6 h-6 rounded-lg cursor-pointer"
                  />
                  <span className={`font-bold ${settings.enabled ? "text-green-600" : "text-slate-600"}`}>
                    {settings.enabled ? "Activado" : "Desactivado"}
                  </span>
                </label>
              </div>

              {settings.enabled && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Tu chatbot enviará mensajes automáticos el 1º de cada mes a tus clientes.
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp Configuration */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6">Configuración de WhatsApp</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                    Número de WhatsApp Business
                  </label>
                  <input
                    type="tel"
                    value={settings.whatsapp_phone || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsapp_phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#f97316] outline-none font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Incluye el código de país (ej: +1 para USA, +1 para Puerto Rico)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                    API Key de WhatsApp
                  </label>
                  <input
                    type="password"
                    value={settings.whatsapp_api_key || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsapp_api_key: e.target.value })
                    }
                    placeholder="Pega tu API Key aquí"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#f97316] outline-none font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Obtén tu API Key desde{" "}
                    <a
                      href="https://developers.facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f97316] font-bold hover:underline"
                    >
                      Meta Developers
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Automation Settings */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6">Automatización</h2>

              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_create_quote}
                  onChange={(e) =>
                    setSettings({ ...settings, auto_create_quote: e.target.checked })
                  }
                  className="w-6 h-6 rounded-lg cursor-pointer mt-1"
                />
                <div>
                  <p className="font-bold text-slate-900">Crear cotizaciones automáticamente</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Cuando un cliente responda "SÍ", se creará una cotización automáticamente con tus últimos precios.
                  </p>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#f97316] to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 active:scale-95"
              >
                {isSaving ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-3xl p-8 border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">💡 Cómo funciona</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ El 1º de cada mes, tu chatbot envía un mensaje a cada cliente</li>
                <li>✓ El cliente puede responder "SÍ", "NO" o proporcionar medidas</li>
                <li>✓ Si responde "SÍ", se crea una cotización automáticamente</li>
                <li>✓ Recibes una notificación de cada interacción</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
