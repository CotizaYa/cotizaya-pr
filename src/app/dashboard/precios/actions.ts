"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Guarda o actualiza un precio personalizado para un producto específico.
 * @param productId ID del producto en la tabla 'products'
 * @param price Nuevo precio decimal
 */
export async function upsertPrice(productId: string, price: number) {
  const supabase = await createClient();

  // 1. Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("No autorizado: Debes iniciar sesión para cambiar precios.");
  }

  // 2. Ejecutar Upsert en la tabla user_prices
  const { error } = await supabase
    .from("user_prices")
    .upsert({
      user_id: user.id,
      product_id: productId,
      price: price,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,product_id"
    });

  if (error) {
    console.error("Error en upsertPrice:", error);
    throw new Error("No se pudo guardar el precio. Inténtalo de nuevo.");
  }

  // 3. Revalidar la ruta para refrescar los datos en el cliente
  revalidatePath("/dashboard/precios");
  
  return { success: true };
}
