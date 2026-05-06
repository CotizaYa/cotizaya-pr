'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface ProductGridItem {
  code: string;
  name: string;
  category: string;
  imagen_url?: string;
  price?: number;
  description?: string;
  isPopular?: boolean;
}

interface PremiumProductGridProps {
  products: ProductGridItem[];
  selectedCode?: string;
  onSelect: (product: ProductGridItem) => void;
  groupByCategory?: boolean;
}

export function PremiumProductGrid({
  products,
  selectedCode,
  onSelect,
  groupByCategory = true,
}: PremiumProductGridProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar por categoría si es necesario
  const groupedProducts = groupByCategory
    ? products.reduce(
        (acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = [];
          }
          acc[product.category].push(product);
          return acc;
        },
        {} as Record<string, ProductGridItem[]>
      )
    : { Todos: products };

  // Filtrar por búsqueda
  const filteredGroups = Object.entries(groupedProducts).reduce(
    (acc, [category, items]) => {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, ProductGridItem[]>
  );

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      puerta: '🚪',
      ventana: '🪟',
      screen: '🔲',
      closet: '🗄️',
      aluminio: '⬜',
      cristal: '💎',
      tornilleria: '🔩',
      miscelanea: '🔧',
    };
    return icons[category.toLowerCase()] || '📦';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      puerta: 'from-blue-500 to-blue-600',
      ventana: 'from-cyan-500 to-cyan-600',
      screen: 'from-teal-500 to-teal-600',
      closet: 'from-purple-500 to-purple-600',
      aluminio: 'from-gray-500 to-gray-600',
      cristal: 'from-indigo-500 to-indigo-600',
      tornilleria: 'from-orange-500 to-orange-600',
      miscelanea: 'from-slate-500 to-slate-600',
    };
    return colors[category.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition"
        />
      </div>

      {/* Grupos de categorías */}
      {Object.entries(filteredGroups).map(([category, items]) => (
        <div key={category}>
          {/* Header de categoría */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <h3 className="text-lg font-bold text-gray-900 capitalize">{category}</h3>
            <span className="ml-auto text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {items.length} productos
            </span>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {items.map((product) => {
              const isSelected = selectedCode === product.code;
              const isHovered = hoveredCode === product.code;

              return (
                <button
                  key={product.code}
                  onClick={() => onSelect(product)}
                  onMouseEnter={() => setHoveredCode(product.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  className={`relative group rounded-xl overflow-hidden transition-all duration-300 transform ${
                    isSelected
                      ? 'ring-2 ring-blue-500 scale-105 shadow-xl'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                >
                  {/* Card */}
                  <div
                    className={`aspect-square bg-gradient-to-br ${getCategoryColor(
                      category
                    )} p-3 flex flex-col items-center justify-center relative overflow-hidden`}
                  >
                    {/* Fondo decorativo */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 text-6xl opacity-30">
                        {getCategoryIcon(category)}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="relative z-10 text-center">
                      {/* Imagen si existe */}
                      {product.imagen_url ? (
                        <div className="relative w-12 h-12 mb-2 mx-auto">
                          <Image
                            src={product.imagen_url}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
                      )}

                      {/* Código */}
                      <p className="font-bold text-white text-sm">{product.code}</p>

                      {/* Nombre */}
                      <p className="text-xs text-white/90 line-clamp-2 mt-1">{product.name}</p>

                      {/* Badge popular */}
                      {product.isPopular && (
                        <div className="mt-2 inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                          ⭐ Popular
                        </div>
                      )}
                    </div>

                    {/* Overlay en hover */}
                    {isHovered && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Seleccionar</span>
                      </div>
                    )}

                    {/* Checkmark si está seleccionado */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Descripción debajo */}
                  {product.description && (
                    <div className="bg-white px-3 py-2 border border-gray-200">
                      <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sin resultados */}
      {Object.keys(filteredGroups).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400 text-sm mt-2">Intenta con otro término de búsqueda</p>
        </div>
      )}
    </div>
  );
}
