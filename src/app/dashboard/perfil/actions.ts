"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveApiKey(key: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!key.startsWith("sk-ant-")) return { ok: false, error: "API Key inválida" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autorizado" };

  const { error } = await supabase
    .from("profiles")
    .update({ anthropic_api_key: key })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/perfil");
  return { ok: true };
}

export async function removeApiKey(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ anthropic_api_key: null }).eq("id", user.id);
  revalidatePath("/dashboard/perfil");
}
