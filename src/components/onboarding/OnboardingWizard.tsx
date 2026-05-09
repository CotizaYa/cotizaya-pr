'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Grid3x3, DoorOpen, Wind, Layers, Sparkles, ArrowRight, Building2, MapPin, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'screen',  label: 'Screens',           icon: <Grid3x3 className="w-8 h-8" />,  desc: 'Puertas y ventanas de screen' },
  { value: 'puerta',  label: 'Puertas',            icon: <DoorOpen className="w-8 h-8" />, desc: 'Puertas de aluminio y vidrio' },
  { value: 'ventana', label: 'Ventanas',           icon: <Wind className="w-8 h-8" />,     desc: 'Ventanas corredizas y proyectantes' },
  { value: 'closet',  label: 'Closets',            icon: <Layers className="w-8 h-8" />,   desc: 'Puertas de closet con cristal' },
  { value: 'todo',    label: 'Todo',               icon: <Sparkles className="w-8 h-8" />, desc: 'Fabricamos de todo' },
]

const PR_CITIES = [
  'San Juan','Bayamón','Carolina','Caguas','Ponce','Mayagüez','Arecibo',
  'Guaynabo','Toa Baja','Humacao','Aguadilla','Yauco','Vega Baja','Fajardo',
  'Coamo','Salinas','Manati','Isabela','Cabo Rojo','Añasco',
]

interface OnboardingWizardProps {
  initialName: string
}

export default function OnboardingWizard({ initialName }: OnboardingWizardProps) {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [businessName, setBusinessName] = useState(initialName || '')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [mainCategory, setMainCategory] = useState('')

  async function handleFinish() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('profiles').update({
        business_name: businessName || initialName,
        phone: phone.trim() || null,
        city: city || 'Puerto Rico',
        main_category: mainCategory || 'screen',
        onboarding_completed: true,
      }).eq('id', user.id)

      router.push('/dashboard/cotizaciones/nueva')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1 — Nombre del negocio */}
        {step === 1 && (
          <div className="p-8">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-7 h-7 text-orange-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Bienvenido a CotizaYa</h2>
            <p className="text-gray-500 mb-8">Configura tu taller en 2 minutos y empieza a cotizar.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de tu negocio</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ej: Taller Aluminio Pérez"
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono del negocio</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(787) 000-0000"
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />Ciudad en Puerto Rico
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-500 outline-none bg-white appearance-none"
                >
                  <option value="">Selecciona tu municipio</option>
                  {PR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!businessName.trim()}
              className="mt-8 w-full h-12 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2 — ¿Qué fabricas? */}
        {step === 2 && (
          <div className="p-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">¿Qué fabricas principalmente?</h2>
            <p className="text-gray-500 mb-6">Personalizamos tu catálogo según tu especialidad.</p>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setMainCategory(cat.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    mainCategory === cat.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className={`mb-2 ${mainCategory === cat.value ? 'text-orange-600' : 'text-gray-400'}`}>
                    {cat.icon}
                  </div>
                  <p className={`font-black text-sm ${mainCategory === cat.value ? 'text-orange-700' : 'text-gray-900'}`}>
                    {cat.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!mainCategory}
              className="mt-6 w-full h-12 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3 — ¡Listo! */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">¡Tu taller está listo!</h2>
            <p className="text-gray-500 mb-2">
              <span className="font-bold text-gray-900">{businessName}</span> tiene acceso a:
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 my-6 text-left space-y-3">
              {[
                ['63 modelos de productos', 'Screens, puertas, ventanas y closets con precios de referencia PR'],
                ['Cotización en 3 minutos', 'Selecciona modelo, entra medidas, obtén precio'],
                ['Envío por WhatsApp', 'Manda el estimado profesional al cliente al instante'],
                ['Asistente IA incluido', 'Calcula, recomienda y responde dudas técnicas'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full h-14 bg-orange-600 text-white font-black text-lg rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
            >
              {saving ? 'Configurando...' : '🚀 Crear mi primera cotización'}
            </button>
            <p className="text-xs text-gray-400 mt-3">Puedes cambiar todo esto en Configuración</p>
          </div>
        )}
      </div>
    </div>
  )
}
