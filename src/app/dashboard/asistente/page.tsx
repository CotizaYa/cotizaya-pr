'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, Zap, AlertCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { label: 'Calcular pie²', prompt: 'Tengo una ventana de 36 pulgadas de ancho por 48 pulgadas de alto. ¿Cuántos pies cuadrados son y cuánto costaría aproximadamente?' },
  { label: 'Precios de aluminio', prompt: '¿Cuáles son los precios actuales aproximados del perfil de aluminio para ventanas en Puerto Rico?' },
  { label: 'Tipos de vidrio', prompt: '¿Qué tipo de vidrio me recomiendas para una ventana proyectante en Puerto Rico? Explícame las diferencias entre sencillo, templado y laminado.' },
  { label: 'Materiales screen', prompt: '¿Qué materiales necesito para instalar una puerta de screen estándar de 36x80 pulgadas?' },
  { label: 'Estimado de casa', prompt: 'Necesito un estimado rápido para una casa de 1,200 pies cuadrados en Puerto Rico. ¿Por dónde empiezo?' },
  { label: 'Plantilla de cotización', prompt: '¿Cómo debo estructurar una cotización profesional para un cliente de puertas y ventanas en Puerto Rico?' },
]

const SYSTEM_PROMPT = `Eres el Asistente de CotizaYa PR, una herramienta de IA especializada en ayudar a contratistas de puertas, ventanas y construcción en Puerto Rico.

Tu función principal es:

1. PRECIOS EN TIEMPO REAL: Cuando te pregunten sobre precios, busca en internet primero. Consulta sitios como:
   - Suplidores locales de PR (Proserv, Caribbean Glass, Kmart Industrial)
   - Precios de aluminio en mercados internacionales (LME London Metal Exchange)
   - Home Depot PR, Lowe's PR para herrajes y miscelánea
   Siempre indica la fecha de la información encontrada.

2. COTIZACIONES: Ayuda a calcular precios, medidas y materiales para puertas, ventanas, screens, closets y proyectos de construcción. Trabaja en pulgadas y pies cuadrados.

3. GUÍA DE SUPLIDORES: Cuando el contratista no tiene precios exactos, busca en internet los rangos actuales del mercado en Puerto Rico.

4. ASISTENTE TÉCNICO: Responde preguntas sobre tipos de materiales, recomendaciones técnicas, mejores prácticas de instalación en clima tropical de PR.

Siempre responde en español. Sé conciso, práctico y directo.`

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de CotizaYa PR.\n\nPuedo ayudarte con:\n• **Cálculos de cotizaciones** — medidas, precios, materiales\n• **Guía de precios** — rangos actuales del mercado en PR\n• **Recomendaciones técnicas** — vidrios, perfiles, instalación\n• **Estrategias de negocio** — cómo estructurar tus cotizaciones\n\n¿En qué te ayudo hoy?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return

    const userMsg: Message = { role: 'user', content, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: history }),
      })

      const data = await response.json()

      if (data.error === 'NO_API_KEY' || data.error === 'SERVICE_UNAVAILABLE') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message || 'Para activar el Asistente IA ve a **Configuración** y agrega tu API Key de Anthropic.',
            timestamp: new Date(),
          },
        ])
        setLoading(false)
        return
      }

      const assistantContent =
        data.content
          ?.filter((block: any) => block.type === 'text')
          .map((block: any) => block.text)
          .join('\n') || 'Lo siento, hubo un error. Intenta de nuevo.'

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function formatContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  function clearChat() {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat reiniciado. ¿En qué te puedo ayudar?',
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Asistente CotizaYa PR</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-500">Activo · Especialista en puertas y ventanas PR</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
          title="Limpiar chat"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 overflow-x-auto flex-shrink-0">
        <div className="flex gap-2">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q.label}
              onClick={() => sendMessage(q.prompt)}
              className="flex-shrink-0 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
              <div
                className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-orange-100' : 'text-gray-400'
                }`}
              >
                {msg.timestamp.toLocaleTimeString('es-PR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0" />
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-lg rounded-bl-none flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex gap-2 items-end bg-gray-50 border border-gray-200 rounded-lg p-3 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre precios, materiales, medidas... (Enter para enviar)"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-900 placeholder-gray-400 font-medium max-h-24 overflow-y-auto"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Potenciado por Claude AI · Especializado en el mercado de Puerto Rico
        </p>
      </div>
    </div>
  )
}
