"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function calcTotals(items: any[], ivuRate: number, depositRate: number) {
  let subtotalMaterials = 0;
  let subtotalLabor = 0;
  for (const item of items) {
    const lt = Number(item.lineTotal) || 0;
    if (item.categorySnapshot === "miscelanea") {
      subtotalLabor += lt;
    } else {
      subtotalMaterials += lt;
    }
  }
  const subtotalBeforeIvu = subtotalMaterials + subtotalLabor;
  const ivuAmount = Math.round(subtotalBeforeIvu * ivuRate * 100) / 100;
  const total = Math.round((subtotalBeforeIvu + ivuAmount) * 100) / 100;
  const depositAmount = Math.round(total * depositRate * 100) / 100;
  return { subtotalMaterials, subtotalLabor, ivuAmount, total, depositAmount };
}

export async function createQuote(rawInput: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autorizado" };

  const input = rawInput as any;
  const ivuRate = Number(input.ivuRate) || 0;
  const depositRate = Number(input.depositRate) || 0.50;
  const items = input.items || [];

  const totals = calcTotals(items, ivuRate, depositRate);

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .insert({
      owner_id: user.id,
      client_id: input.clientId || null,
      quote_number: input.quoteNumber || `COT-${Date.now()}`,
      notes: input.notes || null,
      ivu_rate: ivuRate,
      ivu_amount: totals.ivuAmount,
      deposit_rate: depositRate,
      deposit_amount: totals.depositAmount,
      subtotal_materials: totals.subtotalMaterials,
      subtotal_labor: totals.subtotalLabor,
      total: totals.total,
    })
    .select()
    .single();

  if (qErr || !quote) {
    console.error("Quote error:", qErr);
    return { ok: false as const, error: qErr?.message ?? "Error al crear cotización" };
  }

  if (items.length > 0) {
    const itemsToInsert = items.map((item: any, i: number) => ({
      quote_id: quote.id,
      product_id: item.productId || null,
      position: i,
      name_snapshot: item.nameSnapshot || "Producto",
      category_snapshot: item.categorySnapshot || "miscelanea",
      price_type_snapshot: item.priceTypeSnapshot || "por_unidad",
      unit_price_snapshot: Number(item.unitPriceSnapshot) || 0,
      width_inches: item.widthInches ? Number(item.widthInches) : null,
      height_inches: item.heightInches ? Number(item.heightInches) : null,
      quantity: Number(item.quantity) || 1,
      line_total: Number(item.lineTotal) || 0,
      metadata: item.metadata || {},
    }));

    const { error: itemsErr } = await supabase.from("quote_items").insert(itemsToInsert);
    if (itemsErr) console.error("Items error:", itemsErr);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cotizaciones");
  return { ok: true as const, quoteId: quote.id, publicToken: quote.public_token };
}

export async function createAndRedirect(rawInput: unknown): Promise<void> {
  const res = await createQuote(rawInput);
  if (!res.ok) throw new Error(res.error);
  redirect(`/dashboard/cotizaciones/${res.quoteId}`);
}

export async function markQuoteSent(quoteId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  await supabase
    .from("quotes")
    .update({ status: "sent" })
    .eq("id", quoteId)
    .eq("owner_id", user.id);
  revalidatePath(`/dashboard/cotizaciones/${quoteId}`);
  revalidatePath("/dashboard/cotizaciones");
}
