"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClientAction(input: { full_name:string; phone?:string; email?:string; address?:string }) {
  if (!input.full_name?.trim()) return { ok:false as const, error:"El nombre es requerido" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok:false as const, error:"No autorizado" };
  const { error } = await supabase.from("clients").insert({
    owner_id: user.id,
    full_name: input.full_name.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    address: input.address?.trim() || null,
  });
  if (error) return { ok:false as const, error:error.message };
  revalidatePath("/dashboard/clientes");
  return { ok:true as const };
}
