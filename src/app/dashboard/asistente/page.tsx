"use client";

import { useState, useRef, useEffect, useTransition } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: "", label: "Calcular pie²", prompt: "Tengo una ventana de 36 pulgadas de ancho por 48 pulgadas de alto. ¿Cuántos pies cuadrados son y cuánto costaría aproximadamente?" },
  { icon: "", label: "Precios de aluminio", prompt: "¿Cuáles son los precios actuales aproximados del perfil de aluminio para ventanas en Puerto Rico?" },
  { icon: "", label: "Tipos de vidrio", prompt: "¿Qué tipo de vidrio me recomiendas para una ventana proyectante en Puerto Rico? Explícame las diferencias entre sencillo, templado y laminado." },
  { icon: "", label: "Materiales screen", prompt: "¿Qué materiales necesito para instalar una puerta de screen estándar de 36x80 pulgadas?" },
  { icon: "", label: "Estimado de casa", prompt: "Necesito un estimado rápido para una casa de 1,200 pies cuadrados en Puerto Rico. ¿Por dónde empiezo?" },
  { icon: "", label: "Plantilla de cotización", prompt: "¿Cómo debo estructurar una cotización profesional para un cliente de puertas y ventanas en Puerto Rico?" },
];

const SYSTEM_PROMPT = `Eres el Asistente de CotizaYa PR, una herramienta de IA especializada en ayudar a contratistas de puertas, ventanas y construcción en Puerto Rico.

IMPORTANTE: Tienes acceso a búsqueda web en tiempo real. SIEMPRE que el usuario pregunte sobre precios de materiales, aluminio, vidrio, herrajes, o cualquier insumo de construcción, DEBES usar web_search para buscar los precios más actuales antes de responder. Los precios en Puerto Rico cambian mensualmente por la demanda y el alza del aluminio internacional.

Tu función principal es:

1. PRECIOS EN TIEMPO REAL: Cuando te pregunten sobre precios, busca en internet primero. Consulta sitios como:
   - Suplidores locales de PR (Proserv, Caribbean Glass, Kmart Industrial)
   - Precios de aluminio en mercados internacionales (LME London Metal Exchange)
   - Home Depot PR, Lowe's PR para herrajes y miscelánea
   Siempre indica la fecha de la información encontrada.

2. COTIZACIONES: Ayuda a calcular precios, medidas y materiales para puertas, ventanas, screens, closets y proyectos de construcción. Trabaja en pulgadas y pies cuadrados.

3. GUÍA DE SUPLIDORES: Cuando el contratista no tiene precios exactos, busca en internet los rangos actuales del mercado en Puerto Rico. Menciona suplidores específicos y sus precios cuando los encuentres.

4. ASISTENTE TÉCNICO: Responde preguntas sobre tipos de materiales, recomendaciones técnicas, mejores prácticas de instalación en clima tropical de PR.

Siempre responde en español. Sé conciso, práctico y directo. Cuando calcules, muestra los pasos. Si encontraste precios en línea, cita la fuente y la fecha. Si los precios varían, da un rango claro.`;

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente de CotizaYa PR. \n\nPuedo ayudarte con:\n• **Cálculos de cotizaciones** — medidas, precios, materiales\n• **Guía de precios** — rangos actuales del mercado en PR\n• **Recomendaciones técnicas** — vidrios, perfiles, instalación\n• **Estrategias de negocio** — cómo estructurar tus cotizaciones\n\n¿En qué te ayudo hoy?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: history }),
      });

      const data = await response.json();

      if (data.error === "NO_API_KEY") {
        setMessages(prev => [...prev, {
          role: "assistant" as const,
          content: "Para usar el Asistente IA necesitas configurar tu API Key de Anthropic. Ve a Configuracion (abajo a la izquierda) y sigue las instrucciones.",
          timestamp: new Date(),
        }]);
        setLoading(false);
        return;
      }

      const assistantContent = data.content
        ?.filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n") || "Lo siento, hubo un error. Intenta de nuevo.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: " Error de conexión. Verifica tu internet e intenta de nuevo.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function formatContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  }

  function clearChat() {
    setMessages([{
      role: "assistant",
      content: "Chat reiniciado. ¿En qué te puedo ayudar?",
      timestamp: new Date(),
    }]);
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 0px)",
      background: "#fafafa",
    }}>
      {/* Header */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #e5e5e5",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px",
            boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
          }}></div>
          <div>
            <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#171717" }}>
              Asistente CotizaYa PR
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", background: "#16a34a", borderRadius: "50%" }} />
              <span style={{ fontSize: "11px", color: "#737373" }}>Activo · Especialista en puertas, ventanas y construcción PR</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat}
          style={{ background: "none", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "#737373", cursor: "pointer" }}>
           Limpiar
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: "12px 24px",
        background: "white",
        borderBottom: "1px solid #f5f5f5",
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        flexShrink: 0,
      }}>
        {QUICK_PROMPTS.map(q => (
          <button key={q.label} onClick={() => sendMessage(q.prompt)}
            style={{
              background: "#fff7ed", border: "1px solid #fed7aa",
              borderRadius: "20px", padding: "6px 14px",
              fontSize: "12px", fontWeight: 600, color: "#c2410c",
              cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: "6px",
              flexShrink: 0,
            }}>
            {q.icon} {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            gap: "10px",
            alignItems: "flex-start",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: "32px", height: "32px", flexShrink: 0,
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px",
              }}></div>
            )}
            <div style={{
              maxWidth: "72%",
              background: msg.role === "user" ? "#f97316" : "white",
              color: msg.role === "user" ? "white" : "#171717",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px",
              fontSize: "13px",
              lineHeight: 1.6,
              border: msg.role === "assistant" ? "1px solid #e5e5e5" : "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
              <div style={{
                marginTop: "6px",
                fontSize: "10px",
                opacity: 0.6,
                textAlign: "right",
              }}>
                {msg.timestamp.toLocaleTimeString("es-PR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {msg.role === "user" && (
              <div style={{
                width: "32px", height: "32px", flexShrink: 0,
                background: "#171717",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px",
              }}></div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "32px", height: "32px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px",
            }}></div>
            <div style={{
              background: "white", border: "1px solid #e5e5e5",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px",
              display: "flex", gap: "4px", alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "6px", height: "6px",
                  background: "#f97316", borderRadius: "50%",
                  animation: "bounce 1s infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        background: "white",
        borderTop: "1px solid #e5e5e5",
        padding: "16px 24px",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
          background: "#fafafa",
          border: "2px solid #e5e5e5",
          borderRadius: "16px",
          padding: "10px 14px",
          transition: "border-color 0.15s",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre precios, materiales, medidas... (Enter para enviar)"
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: "13px",
              color: "#171717",
              lineHeight: 1.5,
              fontFamily: "inherit",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              width: "36px", height: "36px", flexShrink: 0,
              background: input.trim() && !loading ? "#f97316" : "#e5e5e5",
              border: "none", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              transition: "background 0.15s",
              fontSize: "16px",
            }}>
            {loading ? "⏳" : ""}
          </button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "10px", color: "#a3a3a3", textAlign: "center" }}>
          Potenciado por Claude AI · Especializado en el mercado de Puerto Rico
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
