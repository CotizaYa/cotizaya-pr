'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Grid3x3, Layers, Home, Maximize2, FolderOpen } from 'lucide-react'

interface ProductModel {
  code: string
  name: string
  description: string
  image: React.ReactNode
}

interface Category {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  models: ProductModel[]
}

const CATEGORIES: Category[] = [
  {
    id: 'screens',
    name: 'Screens',
    description: 'Puertas y ventanas con screen para Puerto Rico',
    icon: <Grid3x3 className="w-6 h-6" />,
    color: 'from-teal-500 to-teal-600',
    models: [
      {
        code: 'S001',
        name: 'Screen Puerta Sencilla',
        description: 'Puerta con screen de una hoja',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="20" width="160" height="260" fill="#e8f4f8" stroke="#666" strokeWidth="2" />
            <line x1="100" y1="20" x2="100" y2="280" stroke="#999" strokeWidth="1" strokeDasharray="3,3" />
            <rect x="30" y="80" width="70" height="120" fill="#b3d9e8" stroke="#666" strokeWidth="1.5" />
            <line x1="30" y1="140" x2="100" y2="140" stroke="#999" strokeWidth="0.5" />
            <circle cx="95" cy="140" r="3" fill="#ff6b6b" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">S001</text>
          </svg>
        ),
      },
      {
        code: 'S002',
        name: 'Screen Puerta Doble',
        description: 'Puerta con screen de dos hojas',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="20" width="160" height="260" fill="#e8f4f8" stroke="#666" strokeWidth="2" />
            <line x="100" y="20" x2="100" y2="280" stroke="#666" strokeWidth="2" />
            <rect x="30" y="80" width="65" height="120" fill="#b3d9e8" stroke="#666" strokeWidth="1.5" />
            <rect x="105" y="80" width="65" height="120" fill="#b3d9e8" stroke="#666" strokeWidth="1.5" />
            <circle cx="95" cy="140" r="3" fill="#ff6b6b" />
            <circle cx="175" cy="140" r="3" fill="#ff6b6b" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">S002</text>
          </svg>
        ),
      },
      {
        code: 'S009',
        name: 'Screen Ventana Corredera',
        description: 'Ventana corredera con screen',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="80" width="160" height="140" fill="#e8f4f8" stroke="#666" strokeWidth="2" />
            <line x="100" y="80" x2="100" y2="220" stroke="#999" strokeWidth="1" strokeDasharray="3,3" />
            <rect x="30" y="100" width="70" height="100" fill="#b3d9e8" stroke="#666" strokeWidth="1.5" />
            <rect x="105" y="100" width="70" height="100" fill="#b3d9e8" stroke="#666" strokeWidth="1.5" opacity="0.6" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">S009</text>
          </svg>
        ),
      },
      {
        code: 'S015',
        name: 'Screen Ventana Proyectante',
        description: 'Ventana proyectante con screen',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="100" width="160" height="120" fill="#e8f4f8" stroke="#666" strokeWidth="2" />
            <rect x="40" y="120" width="120" height="80" fill="#b3d9e8" stroke="#666" strokeWidth="1.5" />
            <path d="M 40 120 L 35 110 L 155 110 L 160 120" fill="none" stroke="#666" strokeWidth="1.5" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">S015</text>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'puertas',
    name: 'Puertas de Aluminio',
    description: 'Puertas de aluminio para interiores y exteriores',
    icon: <Home className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    models: [
      {
        code: 'M001',
        name: 'Puerta Sencilla Vidrio',
        description: 'Puerta sencilla con vidrio',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="20" width="160" height="260" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="35" y="40" width="130" height="220" fill="#c7e9f5" stroke="#999" strokeWidth="1" />
            <circle cx="150" cy="150" r="4" fill="#ff6b6b" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">M001</text>
          </svg>
        ),
      },
      {
        code: 'G001',
        name: 'Puerta Vidrio Completo',
        description: 'Puerta con vidrio templado completo',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="20" width="160" height="260" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="30" y="30" width="140" height="240" fill="#a8d8f0" stroke="#666" strokeWidth="1.5" />
            <circle cx="155" cy="150" r="5" fill="#ff6b6b" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">G001</text>
          </svg>
        ),
      },
      {
        code: 'C0321',
        name: 'Puerta Closet Corrediza',
        description: 'Puerta de closet corrediza de aluminio',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="100" width="160" height="140" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <line x="100" y="100" x2="100" y2="240" stroke="#666" strokeWidth="2" />
            <rect x="30" y="115" width="65" height="110" fill="#c7e9f5" stroke="#999" strokeWidth="1" />
            <rect x="105" y="115" width="65" height="110" fill="#c7e9f5" stroke="#999" strokeWidth="1" opacity="0.5" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">C0321</text>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'ventanas',
    name: 'Ventanas',
    description: 'Ventanas de aluminio en diferentes estilos',
    icon: <Maximize2 className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-600',
    models: [
      {
        code: 'C001',
        name: 'Ventana Corredera',
        description: 'Ventana corredera de dos hojas',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="80" width="160" height="140" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <line x="100" y="80" x2="100" y2="220" stroke="#666" strokeWidth="2" />
            <rect x="30" y="100" width="65" height="100" fill="#a8d8f0" stroke="#999" strokeWidth="1" />
            <rect x="105" y="100" width="65" height="100" fill="#a8d8f0" stroke="#999" strokeWidth="1" opacity="0.6" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">C001</text>
          </svg>
        ),
      },
      {
        code: 'C010',
        name: 'Ventana Proyectante',
        description: 'Ventana proyectante de aluminio',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="100" width="160" height="120" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="40" y="120" width="120" height="80" fill="#a8d8f0" stroke="#999" strokeWidth="1" />
            <path d="M 40 120 L 35 110 L 155 110 L 160 120" fill="none" stroke="#666" strokeWidth="1.5" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">C010</text>
          </svg>
        ),
      },
      {
        code: 'C013',
        name: 'Ventana Fija',
        description: 'Ventana fija de aluminio',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="80" width="160" height="140" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="35" y="100" width="130" height="100" fill="#a8d8f0" stroke="#999" strokeWidth="1" />
            <line x="100" y="100" x2="100" y2="200" stroke="#999" strokeWidth="0.5" />
            <line x="35" y="150" x2="165" y2="150" stroke="#999" strokeWidth="0.5" />
            <text x="100" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">C013</text>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'garaje',
    name: 'Puertas de Garaje',
    description: 'Puertas de garaje automáticas y manuales',
    icon: <Layers className="w-6 h-6" />,
    color: 'from-slate-500 to-slate-600',
    models: [
      {
        code: 'GD001',
        name: 'Puerta Garaje Seccional',
        description: 'Puerta de garaje seccional',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="60" width="160" height="180" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="30" y="75" width="140" height="150" fill="#e0e0e0" stroke="#999" strokeWidth="1" />
            <line x="30" y="105" x2="170" y2="105" stroke="#999" strokeWidth="1" />
            <line x="30" y="135" x2="170" y2="135" stroke="#999" strokeWidth="1" />
            <line x="30" y="165" x2="170" y2="165" stroke="#999" strokeWidth="1" />
            <line x="30" y="195" x2="170" y2="195" stroke="#999" strokeWidth="1" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">GD001</text>
          </svg>
        ),
      },
      {
        code: 'GD006',
        name: 'Puerta Garaje Paneles',
        description: 'Puerta de garaje con paneles',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="60" width="160" height="180" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="30" y="75" width="65" height="150" fill="#d0d0d0" stroke="#999" strokeWidth="1" />
            <rect x="105" y="75" width="65" height="150" fill="#d0d0d0" stroke="#999" strokeWidth="1" />
            <line x="30" y="105" x2="170" y2="105" stroke="#999" strokeWidth="0.5" />
            <line x="30" y="135" x2="170" y2="135" stroke="#999" strokeWidth="0.5" />
            <line x="30" y="165" x2="170" y2="165" stroke="#999" strokeWidth="0.5" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">GD006</text>
          </svg>
        ),
      },
    ],
  },
  {
    id: 'closets',
    name: 'Puertas de Closet',
    description: 'Puertas de closet corredizas y abatibles',
    icon: <FolderOpen className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    models: [
      {
        code: 'CD001',
        name: 'Closet Espejo Sencillo',
        description: 'Puerta de closet con espejo',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="60" width="160" height="200" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="35" y="80" width="130" height="160" fill="#e6d5ff" stroke="#999" strokeWidth="1" />
            <circle cx="100" cy="160" r="3" fill="#ff6b6b" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">CD001</text>
          </svg>
        ),
      },
      {
        code: 'CD006',
        name: 'Closet Espejo Doble',
        description: 'Puerta de closet doble con espejo',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="60" width="160" height="200" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <line x="100" y="60" x2="100" y2="260" stroke="#666" strokeWidth="2" />
            <rect x="30" y="80" width="65" height="160" fill="#e6d5ff" stroke="#999" strokeWidth="1" />
            <rect x="105" y="80" width="65" height="160" fill="#e6d5ff" stroke="#999" strokeWidth="1" />
            <circle cx="62" cy="160" r="3" fill="#ff6b6b" />
            <circle cx="137" cy="160" r="3" fill="#ff6b6b" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">CD006</text>
          </svg>
        ),
      },
      {
        code: 'CD007',
        name: 'Closet Cristal Templado',
        description: 'Puerta de closet con cristal templado',
        image: (
          <svg viewBox="0 0 200 300" className="w-full h-full">
            <rect x="20" y="60" width="160" height="200" fill="#f0f0f0" stroke="#666" strokeWidth="2" />
            <rect x="35" y="80" width="130" height="160" fill="#b3d9ff" stroke="#999" strokeWidth="1" />
            <line x="35" y="120" x2="165" y2="120" stroke="#999" strokeWidth="0.5" />
            <line x="35" y="160" x2="165" y2="160" stroke="#999" strokeWidth="0.5" />
            <circle cx="150" cy="160" r="3" fill="#ff6b6b" />
            <text x="100" y="280" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">CD007</text>
          </svg>
        ),
      },
    ],
  },
]

export default function CatalogoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const category = selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-600 mt-2">Explora nuestros modelos para Puerto Rico</p>
        </div>
      </div>

      {!selectedCategory ? (
        // Vista de Categorías
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group relative bg-gradient-to-br ${cat.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all active:scale-95 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      {cat.icon}
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{cat.name}</h2>
                  <p className="text-white/80 text-sm">{cat.description}</p>
                  <div className="mt-4 text-xs font-bold text-white/60">
                    {cat.models.length} modelos
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : category ? (
        // Vista de Modelos
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-orange-600 font-bold mb-8 hover:text-orange-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver al Catálogo
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
            <p className="text-gray-600">{category.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.models.map((model) => (
              <Link
                key={model.code}
                href={`/dashboard/cotizaciones/nueva?modelo=${model.code}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all active:scale-95"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 group-hover:from-gray-100 group-hover:to-gray-200 transition-all">
                  <div className="w-full h-full">
                    {model.image}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{model.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      {model.code}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
