import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApiKeyForm } from "./ApiKeyForm";
import { Settings, AlertCircle, LogOut, Zap } from "lucide-react";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name, phone, email, anthropic_api_key")
    .eq("id", user.id)
    .single();

  const hasKey = !!(profile?.anthropic_api_key);
  const maskedKey = hasKey
    ? `sk-ant-...${profile.anthropic_api_key.slice(-6)}`
    : null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-8 h-8 text-orange-600" />
          Configuración
        </h1>
        <p className="text-gray-500 font-medium mt-1">Perfil y ajustes de tu cuenta</p>
      </div>

      {/* Business Info */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Información del Negocio</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-sm text-gray-600">Empresa</span>
            <span className="text-sm font-bold text-gray-900">{profile?.business_name ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-bold text-gray-900">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Anthropic API Key */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-sm font-bold text-gray-900">Asistente IA — API Key de Anthropic</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasKey ? "Asistente activado" : "Sin API Key — Asistente desactivado"}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-xs font-bold text-blue-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            ¿Cómo obtener tu API Key?
          </p>
          <ol className="text-xs text-blue-800 space-y-1 ml-6 list-decimal">
            <li>Ve a <strong>console.anthropic.com</strong></li>
            <li>Crea una cuenta gratuita</li>
            <li>Agrega $5 de crédito (dura meses con uso normal)</li>
            <li>Ve a <strong>API Keys → Create Key</strong></li>
            <li>Copia la key y pégala aquí abajo</li>
          </ol>
          <p className="text-[10px] text-blue-700 mt-2">
            Costo aproximado: $0.02–$0.04 por conversación · $5 dura ~150–200 consultas
          </p>
        </div>

        <ApiKeyForm currentKey={maskedKey} />
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm space-y-4">
        <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Zona de Peligro</p>
        <p className="text-sm text-gray-600">Para cerrar sesión en este dispositivo:</p>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-red-700 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
