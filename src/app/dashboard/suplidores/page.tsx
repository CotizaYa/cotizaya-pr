'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Search, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  Loader2,
  MoreVertical,
  Trash2,
  Edit2,
  MessageCircle,
  Info
} from 'lucide-react'

interface Suplidor {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  category: string | null
  whatsapp?: string | null
}

const CAT_LABEL: Record<string, string> = {
  aluminio: "Aluminio / Perfiles",
  vidrio: "Cristales / Vidrio",
  screen: "Screen / Malla",
  herrajes: "Herrajes y Goznes",
  tornilleria: "Tornillería",
  pintura: "Pintura / Selladores",
  construccion: "Materiales de Construcción",
  miscelanea: "Miscelánea",
}

const CAT_COLOR: Record<string, string> = {
  aluminio: "bg-blue-50 text-blue-700",
  vidrio: "bg-sky-50 text-sky-700",
  screen: "bg-green-50 text-green-700",
  herrajes: "bg-yellow-50 text-yellow-700",
  tornilleria: "bg-purple-50 text-purple-700",
  pintura: "bg-pink-50 text-pink-700",
  construccion: "bg-orange-50 text-orange-700",
  miscelanea: "bg-gray-50 text-gray-700",
}

export default function SuplidoresPage() {
  const supabase = createClient()
  const [suplidores, setSuplidores] = useState<Suplidor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSuplidor, setEditingSuplidor] = useState<Suplidor | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    category: 'aluminio',
    whatsapp: ''
  })

  useEffect(() => {
    loadSuplidores()
  }, [])

  const loadSuplidores = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('category').order('name')

      if (error) throw error
      setSuplidores(data || [])
    } catch (err: any) {
      console.error('Error cargando suplidores:', err)
      const message = err?.message || ''
      if (message.includes('suppliers') || message.includes('does not exist') || message.includes('schema cache')) {
        setErrorMessage('El directorio de suplidores necesita que se aplique la migración de Supabase para activar el guardado de proveedores.')
      } else {
        setErrorMessage('No se pudieron cargar los suplidores. Intenta nuevamente en unos segundos.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const data = { ...formData, owner_id: user.id }

      if (editingSuplidor) {
        const { error } = await supabase
          .from('suppliers')
          .update(data)
          .eq('id', editingSuplidor.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([data])
        if (error) throw error
      }

      setIsModalOpen(false)
      setEditingSuplidor(null)
      setFormData({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        category: 'aluminio',
        whatsapp: ''
      })
      loadSuplidores()
    } catch (err: any) {
      console.error('Error guardando suplidor:', err)
      const message = err?.message || 'Error al guardar el suplidor'
      alert(message.includes('schema cache') || message.includes('does not exist') ? 'El módulo de suplidores requiere aplicar la migración de Supabase antes de guardar proveedores.' : message)
    }
  }

  const filtered = suplidores.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Mis Suplidores</h1>
          <p className="text-gray-600 font-medium mt-1">Directorio de proveedores para tu taller</p>
        </div>
        <button 
          onClick={() => {
            setEditingSuplidor(null)
            setIsModalOpen(true)
          }}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
        >
          <Plus className="w-5 h-5" />
          Nuevo Suplidor
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <MessageCircle className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-black text-orange-900">Próximamente: Consulta automática de precios</p>
          <p className="text-xs text-orange-800 mt-1">El Asistente IA podrá enviar WhatsApps automáticos a tus suplidores para traerte precios actualizados en segundos.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar suplidor por nombre o categoría..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        </div>
      ) : suplidores.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{errorMessage ? 'Suplidores pendiente de configuración' : 'No hay suplidores aún'}</h3>
          <p className="text-gray-500 mt-1">{errorMessage || 'Agrega tus proveedores frecuentes para facilitar tus pedidos.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center font-black text-orange-600 text-lg">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {
                    setEditingSuplidor(s)
                    setFormData({
                      name: s.name,
                      contact_person: s.contact_person || '',
                      phone: s.phone || '',
                      email: s.email || '',
                      address: s.address || '',
                      category: s.category || 'aluminio',
                      whatsapp: s.whatsapp || ''
                    })
                    setIsModalOpen(true)
                  }} className="p-2 text-gray-400 hover:text-orange-600 bg-gray-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${CAT_COLOR[s.category || 'miscelanea']}`}>
                    {CAT_LABEL[s.category || 'miscelanea']}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-1 truncate">{s.name}</h3>
                  <p className="text-xs text-gray-500 font-bold">{s.contact_person || 'Sin contacto asignado'}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50">
                  {s.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {s.phone}
                    </div>
                  )}
                  {s.whatsapp && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-bold">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      WhatsApp Listo
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">
                {editingSuplidor ? 'Editar Suplidor' : 'Nuevo Suplidor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre de la Empresa</label>
                <input 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Persona de Contacto</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.contact_person}
                    onChange={e => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {Object.entries(CAT_LABEL).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input 
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Dirección</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all mt-4"
              >
                {editingSuplidor ? 'Guardar Cambios' : 'Agregar Suplidor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
