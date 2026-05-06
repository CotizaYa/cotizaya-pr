import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generar un mensaje personalizado usando OpenAI
 */
export async function generatePersonalizedMessage(
  clientName: string,
  productCategory: string,
  businessName: string,
  lastQuoteDate?: string
): Promise<string> {
  try {
    const prompt = `
    Genera un mensaje corto y amigable en español para un cliente de WhatsApp.
    
    El cliente es: ${clientName}
    Categoría de productos: ${productCategory}
    Negocio: ${businessName}
    ${lastQuoteDate ? `Última cotización: ${lastQuoteDate}` : ""}
    
    El mensaje debe:
    - Ser profesional pero amigable
    - Preguntar si necesita una cotización actualizada
    - Ser breve (máximo 2 líneas)
    - Incluir un llamado a la acción claro
    
    Responde SOLO con el mensaje, sin explicaciones adicionales.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating message with OpenAI:", error);
    throw error;
  }
}

/**
 * Enviar mensaje por WhatsApp (usando Twilio o WhatsApp Business API)
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  apiKey: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Placeholder para integración real con WhatsApp Business API
    // En producción, usar Twilio o WhatsApp Business API directamente

    console.log(`Sending WhatsApp to ${phoneNumber}: ${message}`);

    // Simular envío exitoso
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Crear una cotización automática basada en la respuesta del cliente
 */
export async function createAutoQuote(
  ownerId: string,
  clientId: string,
  productCategory: string,
  dimensions?: { width?: number; height?: number }
): Promise<{ quoteId: string; quoteNumber: string }> {
  try {
    const supabase = await createClient();

    // Obtener los productos de la categoría
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("category", productCategory)
      .limit(3);

    if (!products || products.length === 0) {
      throw new Error(`No products found for category: ${productCategory}`);
    }

    // Crear la cotización
    const { data: quote, error } = await supabase
      .from("quotes")
      .insert({
        owner_id: ownerId,
        client_id: clientId,
        status: "draft",
        quote_number: `AUTO-${Date.now()}`,
        subtotal_materials: 0,
        subtotal_labor: 0,
        ivu_rate: 0.115,
        ivu_amount: 0,
        deposit_rate: 0.5,
        deposit_amount: 0,
        total: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Agregar items a la cotización
    const items = products.map((product: any) => ({
      quote_id: quote.id,
      product_id: product.id,
      quantity: 1,
      unit_price_snapshot: product.price || 0,
      width_inches: dimensions?.width,
      height_inches: dimensions?.height,
      line_total: product.price || 0,
    }));

    await supabase.from("quote_items").insert(items);

    return {
      quoteId: quote.id,
      quoteNumber: quote.quote_number,
    };
  } catch (error) {
    console.error("Error creating auto quote:", error);
    throw error;
  }
}

/**
 * Procesar respuesta del cliente desde WhatsApp
 */
export async function processClientResponse(
  ownerId: string,
  clientId: string,
  responseText: string,
  phoneNumber: string
): Promise<{ action: string; quoteId?: string }> {
  try {
    // Analizar la respuesta con OpenAI
    const prompt = `
    Analiza esta respuesta del cliente y determina qué acción tomar.
    
    Respuesta: "${responseText}"
    
    Responde SOLO con una de estas opciones:
    - "yes": El cliente quiere una cotización
    - "no": El cliente no está interesado
    - "dimensions": El cliente proporciona medidas (extrae ancho x alto)
    - "other": Otra respuesta
    
    Si es "dimensions", incluye las medidas en formato: dimensions:100x200
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 50,
    });

    const analysis = response.choices[0].message.content || "";

    // Procesar según la respuesta
    if (analysis.includes("yes")) {
      // Crear cotización automática
      const quote = await createAutoQuote(ownerId, clientId, "puerta");
      return { action: "quote_created", quoteId: quote.quoteId };
    } else if (analysis.includes("no")) {
      return { action: "client_not_interested" };
    } else if (analysis.includes("dimensions")) {
      // Extraer dimensiones y crear cotización
      const dimensionsMatch = analysis.match(/dimensions:(\d+)x(\d+)/);
      if (dimensionsMatch) {
        const quote = await createAutoQuote(ownerId, clientId, "puerta", {
          width: parseInt(dimensionsMatch[1]),
          height: parseInt(dimensionsMatch[2]),
        });
        return { action: "quote_created_with_dimensions", quoteId: quote.quoteId };
      }
    }

    return { action: "awaiting_clarification" };
  } catch (error) {
    console.error("Error processing client response:", error);
    return { action: "error" };
  }
}

/**
 * Ejecutar el ciclo mensual del chatbot
 * (Debe ser ejecutado por un cron job el 1º de cada mes)
 */
export async function runMonthlyChatbotCycle() {
  try {
    const supabase = await createClient();

    // Obtener todos los usuarios con suscripción Pro o Enterprise
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("owner_id, plan")
      .in("plan", ["pro", "enterprise"])
      .eq("status", "active");

    if (!subscriptions) return { processed: 0, sent: 0 };

    let sent = 0;

    for (const subscription of subscriptions) {
      // Obtener configuración del chatbot
      const { data: settings } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("owner_id", subscription.owner_id)
        .eq("enabled", true)
        .single();

      if (!settings) continue;

      // Obtener clientes del usuario
      const { data: clients } = await supabase
        .from("clients")
        .select("*")
        .eq("owner_id", subscription.owner_id);

      if (!clients) continue;

      // Para cada cliente, enviar mensaje
      for (const client of clients) {
        // Generar mensaje personalizado
        const message = await generatePersonalizedMessage(
          client.full_name,
          "puerta", // TODO: Obtener categoría del cliente
          "Mi Empresa" // TODO: Obtener nombre del negocio
        );

        // Enviar por WhatsApp
        const result = await sendWhatsAppMessage(
          client.phone,
          message,
          settings.whatsapp_api_key
        );

        if (result.success) {
          // Registrar el mensaje en la BD
          await supabase.from("chatbot_messages").insert({
            owner_id: subscription.owner_id,
            client_id: client.id,
            message_type: "initial",
            message_text: message,
            sent_at: new Date().toISOString(),
            status: "sent",
          });

          sent++;
        }
      }
    }

    return { processed: subscriptions.length, sent };
  } catch (error) {
    console.error("Error running monthly chatbot cycle:", error);
    throw error;
  }
}
