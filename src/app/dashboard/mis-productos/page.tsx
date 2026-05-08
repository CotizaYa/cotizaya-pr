'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Search, 
  Package, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react'
import { formatUSD } from '@/lib/calculations'

interface Product {
  id: string
  code: string | null
  name: string
  category: string
  price_type: string
  base_price: number
  unit_label: string | null
  is_active: boolean
}

export default function MisProductosPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'puerta',
    price_type: 'por_unidad',
    base_price: '',
    unit_label: 'u',
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error cargando productos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const productData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        owner_id: user.id,
        is_active: true
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])
        if (error) throw error
      }

      setIsModalOpen(false)
      setEditingProduct(null)
      setFormData({
        code: '',
        name: '',
        category: 'puerta',
        price_type: 'por_unidad',
        base_price: '',
        unit_label: 'u',
      })
      loadProducts()
    } catch (err) {
      console.error('Error guardando producto:', err)
      alert('Error al guardar el producto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadProducts()
    } catch (err) {
      console.error('Error eliminando producto:', err)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Mis Productos</h1>
          <p className="text-gray-600 font-medium mt-1">Gestiona el catálogo de tu taller</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              code: '',
              name: '',
              category: 'puerta',
              price_type: 'por_unidad',
              base_price: '',
              unit_label: 'u',
            })
            setIsModalOpen(true)
          }}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
        >
          <Plus className="w-5 h-5" />
          Nuevo Modelo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre o código (ej: G001)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
          <p className="text-gray-500 font-medium">Cargando tus productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-orange-600" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-xl font-black text-gray-900">Tu catálogo está vacío</h3>
            <p className="text-gray-500 mt-2">Agrega tus modelos de puertas, ventanas y screens para que aparezcan en tu catálogo y perfil público.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-orange-600 font-bold hover:underline"
          >
            Crear mi primer producto →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingProduct(product)
                      setFormData({
                        code: product.code || '',
                        name: product.name,
                        category: product.category,
                        price_type: product.price_type,
                        base_price: product.base_price.toString(),
                        unit_label: product.unit_label || 'u',
                      })
                      setIsModalOpen(true)
                    }}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase mb-1">
                  {product.category}
                </span>
                <h3 className="font-black text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 font-bold">{product.code}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-lg font-black text-orange-600">{formatUSD(product.base_price)}</span>
                  <span className="text-xs text-gray-400 font-medium">
                    {product.price_type === 'por_unidad' ? 'Unidad' : `Pie² (${product.unit_label})`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Código del Modelo</label>
                  <input 
                    required
                    placeholder="Ej: G001"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="puerta">Puerta de Aluminio</option>
                    <option value="ventana">Ventana</option>
                    <option value="screen">Screen</option>
                    <option value="closet">Puerta de Closet</option>
                    <option value="garaje">Puerta de Garaje</option>
                    <option value="screen_ac">Screen A/C</option>
                    <option value="miscelanea">Servicio/Misceláneo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Producto</label>
                <input 
                  required
                  placeholder="Ej: Puerta Full Glass Vidrio"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Precio Base ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.base_price}
                    onChange={e => setFormData({...formData, base_price: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Precio</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500"
                    value={formData.price_type}
                    onChange={e => setFormData({...formData, price_type: e.target.value})}
                  >
                    <option value="por_unidad">Por Unidad</option>
                    <option value="por_pie_cuadrado">Por Pie Cuadrado</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all mt-4"
              >
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
