"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface SupplierInput {
  name: string;
  category: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
}

export async function createSupplier(input: SupplierInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.name?.trim()) return { ok: false, error: "El nombre es requerido" };
  if (!input.category?.trim()) return { ok: false, error: "La categoría es requerida" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autorizado" };

  const { error } = await supabase.from("suppliers").insert({
    owner_id: user.id,
    name:     input.name.trim(),
    category: input.category.trim(),
    phone:    input.phone?.trim()    || null,
    whatsapp: input.whatsapp?.trim() || null,
    email:    input.email?.trim()    || null,
    notes:    input.notes?.trim()    || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/suplidores");
  return { ok: true };
}

export async function deleteSupplier(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autorizado" };

  const { error } = await supabase.from("suppliers").delete().eq("id", id).eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/suplidores");
  return { ok: true };
}
