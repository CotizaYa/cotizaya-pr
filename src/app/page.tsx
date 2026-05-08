'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, CheckCircle2, Zap, Calculator, Calendar, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [supabase])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-lg text-gray-900">CotizaYa</span>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/catalogo" className="hidden sm:inline text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              Catálogo
            </Link>
            <Link href="#features" className="hidden md:inline text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              Características
            </Link>
            <Link href="#pricing" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              Planes
            </Link>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
              >
                Iniciar Sesión
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6 inline-block px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
          <p className="text-sm font-bold text-orange-600">Hecho para contratistas de Puerto Rico</p>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-6 leading-tight">
          Deja los errores atrás
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          CotizaYa calcula todo por ti. Hoja de corte automática, cotizaciones profesionales y calendario de producción en tu iPhone. Precisión asegurada en cada proyecto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            Prueba Gratis 14 Días
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:border-gray-400 transition-all"
          >
            Ver Catálogo
          </Link>
        </div>
        <p className="text-sm text-gray-500 font-medium">Sin tarjeta de crédito requerida</p>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Reduce Errores y Aumenta Precisión</h2>
            <p className="text-lg text-gray-600">
              CotizaYa es la solución a los errores comunes en la fabricación de puertas y ventanas. Nuestras herramientas inteligentes minimizan los errores humanos, asegurando precisión y eficiencia en cada fase de tu producción.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Hojas de Corte Exactas</h3>
              <p className="text-gray-600 leading-relaxed">
                Los errores en el corte de materiales pueden ser costosos. Con las hojas de corte de CotizaYa, aseguras medidas precisas automáticamente, eliminando las equivocaciones manuales.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Hojas de Compra Inteligentes</h3>
              <p className="text-gray-600 leading-relaxed">
                El exceso de material es un desperdicio común. CotizaYa te proporciona listas detalladas de compra, calculando exactamente lo que necesitas, reduciendo el sobrecosto y el desperdicio.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Calendario de Producción</h3>
              <p className="text-gray-600 leading-relaxed">
                Gestiona tus proyectos con facilidad. Visualiza instalaciones, entregas y producciones en un calendario intuitivo diseñado para móvil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Cómo Funciona CotizaYa: 3 Sencillos Pasos</h2>
            <p className="text-lg text-gray-600">
              Con CotizaYa, generar hojas de corte es un proceso rápido y sencillo. En solo tres pasos: selecciona el estilo, introduce las medidas del espacio y obtén tu hoja de corte precisa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-orange-200">
                <span className="text-2xl font-black text-orange-600">1</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Elegir Modelo</h3>
              <p className="text-gray-600 leading-relaxed">
                Comienza seleccionando entre una amplia gama de estilos modernos y clásicos para puertas y ventanas, adaptándose a cualquier preferencia o necesidad.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-orange-200">
                <span className="text-2xl font-black text-orange-600">2</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Introducir Medidas</h3>
              <p className="text-gray-600 leading-relaxed">
                Ingresa las medidas del espacio en pulgadas. CotizaYa soporta fracciones (ej: 36 1/2") para máxima precisión.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-orange-200">
                <span className="text-2xl font-black text-orange-600">3</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Hoja de Corte Automática</h3>
              <p className="text-gray-600 leading-relaxed">
                Obtén tu hoja de corte precisa al instante, con todas las piezas, materiales y cálculos listos para fabricación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Planes y Precios</h2>
            <p className="text-lg text-gray-600">
              Elige el plan perfecto para tu negocio. Todos incluyen prueba gratis de 14 días.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Básico */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-orange-200 transition-all">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Básico</h3>
              <p className="text-gray-600 text-sm mb-6">Para empezar</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">$14.99</span>
                <span className="text-gray-600 font-bold">/mes</span>
              </div>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:border-gray-400 transition-all mb-8">
                Empezar Ahora
              </button>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Hojas de Corte</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Cotizaciones</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Calendario</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Gestión de Clientes</span>
                </div>
              </div>
            </div>

            {/* Pro (Destacado) */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 text-white relative ring-2 ring-orange-300 shadow-xl">
              <div className="absolute top-4 right-4 bg-white text-orange-600 px-4 py-1 rounded-full text-xs font-black">
                RECOMENDADO
              </div>
              <h3 className="text-2xl font-black mb-2">Pro</h3>
              <p className="text-orange-100 text-sm mb-6">Para profesionales</p>
              <div className="mb-6">
                <span className="text-4xl font-black">$24.99</span>
                <span className="text-orange-100 font-bold">/mes</span>
              </div>
              <button className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all mb-8">
                Empezar Ahora
              </button>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Todo del plan Básico</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">IA Ilimitada (sin límite de créditos)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Deducciones Personalizadas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Reportes Avanzados</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Pagos Directos</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Descarga en Excel</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Catálogo Personalizado</span>
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-orange-200 transition-all">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 text-sm mb-6">Solución personalizada</p>
              <div className="mb-6">
                <span className="text-2xl font-black text-gray-900">Contactar</span>
              </div>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:border-gray-400 transition-all mb-8">
                Solicitar Demo
              </button>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Todo del plan Pro</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Soporte prioritario</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Integraciones custom</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Capacitación incluida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-6">Comienza tu Prueba Gratis Hoy</h2>
          <p className="text-xl text-orange-100 mb-8">
            14 días completos sin tarjeta de crédito. Acceso a todas las características Pro.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg"
          >
            Comenzar Ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black">C</span>
                </div>
                <span className="font-black text-white">CotizaYa</span>
              </div>
              <p className="text-sm">Hecho para contratistas de Puerto Rico</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Precios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CotizaYa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
