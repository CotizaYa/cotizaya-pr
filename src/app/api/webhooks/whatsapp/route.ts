import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processClientResponse } from "@/lib/chatbot";

/**
 * Webhook para recibir mensajes de WhatsApp
 * POST /api/webhooks/whatsapp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar que sea un mensaje de WhatsApp
    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json({ success: true });
    }

    const message = body.messages[0];
    const phoneNumber = message.from;
    const messageText = message.text?.body || "";

    if (!messageText) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();

    // Encontrar el cliente por teléfono
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", phoneNumber)
      .single();

    if (!client) {
      console.warn(`Client not found for phone: ${phoneNumber}`);
      return NextResponse.json({ success: true });
    }

    // Procesar la respuesta
    const result = await processClientResponse(
      client.owner_id,
      client.id,
      messageText,
      phoneNumber
    );

    // Registrar el evento
    await supabase.from("chatbot_events").insert({
      owner_id: client.owner_id,
      client_id: client.id,
      event_type: "message_received",
      event_data: {
        message: messageText,
        action: result.action,
        quoteId: result.quoteId,
      },
    });

    return NextResponse.json({
      success: true,
      action: result.action,
      quoteId: result.quoteId,
    });
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Webhook para verificación de WhatsApp
 * GET /api/webhooks/whatsapp
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
