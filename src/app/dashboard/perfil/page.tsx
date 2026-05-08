'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Shield, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Camera,
  Zap,
  LogOut
} from 'lucide-react'
import { ApiKeyForm } from './ApiKeyForm'

export default function PerfilPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    phone: '',
    city: '',
    username: '',
    description: '',
    is_public: false,
    avatar_url: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          business_name: data.business_name || '',
          phone: data.phone || '',
          city: data.city || '',
          username: data.username || '',
          description: data.description || '',
          is_public: data.is_public || false,
          avatar_url: data.avatar_url || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Configuración</h1>
        <p className="text-gray-600 font-medium mt-1">Gestiona tu cuenta y perfil público</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Perfil Público Section */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-600" />
              Perfil Público del Taller
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Esta información será visible en tu página pública /p/[username]</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Avatar and Username */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative group">
                <div className="w-24 h-24 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 text-3xl font-black overflow-hidden border-2 border-white shadow-md">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    formData.business_name?.charAt(0) || <User className="w-10 h-10" />
                  )}
                </div>
                <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100 text-gray-400 hover:text-orange-600 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Username Único</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                      <input 
                        required
                        placeholder="nombre-de-tu-taller"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-medium"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Estado del Perfil</label>
                    <div className="flex items-center gap-3 h-[50px]">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, is_public: !formData.is_public})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          formData.is_public ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.is_public ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm font-bold text-gray-700">
                        {formData.is_public ? 'Público' : 'Privado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Negocio</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.business_name}
                    onChange={e => setFormData({...formData, business_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Ciudad (Puerto Rico)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    placeholder="Ej: Bayamón, San Juan..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Teléfono de Contacto</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email de Contacto</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.full_name} // Usamos full_name como backup si no hay email en profile
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Sobre Nosotros / Descripción</label>
              <textarea 
                rows={4}
                placeholder="Cuéntale a tus clientes sobre tu experiencia y especialidad..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-8 py-3 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Actualizar Perfil Público'}
              </button>
            </div>
          </div>
        </form>

        {/* API Key Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Inteligencia Artificial
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Configura tu API Key para el Asistente IA</p>
          </div>
          <div className="p-6">
            <ApiKeyForm currentKey={null} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm space-y-4">
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Zona de Peligro</p>
          <p className="text-sm text-gray-600">Para cerrar sesión en este dispositivo:</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
