"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertPrice(productId: string, price: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_prices").upsert({ user_id:user.id, product_id:productId, price }, { onConflict:"user_id,product_id" });
  revalidatePath("/dashboard/precios");
}
