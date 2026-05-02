import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Get user's own API key
  const { data: profile } = await supabase
    .from("profiles")
    .select("anthropic_api_key")
    .eq("id", user.id)
    .single();

  const apiKey = profile?.anthropic_api_key;
  if (!apiKey) {
    return NextResponse.json({
      error: "NO_API_KEY",
      message: "Necesitas configurar tu API Key de Anthropic en Configuración para usar el Asistente IA."
    }, { status: 402 });
  }

  const body = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      ...body,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
