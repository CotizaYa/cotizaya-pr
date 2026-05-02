"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateProjectEstimate } from "@/lib/projectCalculations";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const squareFeet = Number(formData.get("squareFeet"));
  const quality = String(formData.get("quality") || "standard");
  const projectName = String(formData.get("projectName") || "");
  const floors = Number(formData.get("floors") || 1);

  if (squareFeet <= 0) throw new Error("Pies cuadrados debe ser mayor a 0");
  if (!["basic", "standard", "premium"].includes(quality)) throw new Error("Calidad inválida");

  const { data: template, error: templateError } = await supabase
    .from("project_templates")
    .select("*")
    .eq("quality_level", quality);

  if (templateError || !template || template.length === 0)
    throw new Error("Error cargando plantilla de precios");

  const estimate = calculateProjectEstimate(squareFeet, template);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: projectName || `Proyecto ${squareFeet} pie²`,
      square_feet: squareFeet,
      floors,
      quality_level: quality,
      estimated_total: estimate.total,
      status: "draft",
    })
    .select()
    .single();

  if (projectError || !project) throw new Error("Error creando proyecto: " + projectError?.message);

  for (let i = 0; i < estimate.phases.length; i++) {
    const phase = estimate.phases[i];
    const { data: phaseRow, error: phaseError } = await supabase
      .from("project_phases")
      .insert({ project_id: project.id, name: phase.name, order_index: i, subtotal: phase.subtotal })
      .select()
      .single();

    if (phaseError || !phaseRow) continue;

    await supabase.from("project_items").insert(
      phase.items.map((item) => ({
        phase_id: phaseRow.id,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total: item.total,
      }))
    );
  }

  revalidatePath("/dashboard/projects");
  return { success: true, projectId: project.id };
}

export async function updateProjectMargin(projectId: string, marginPercentage: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: proj } = await supabase
    .from("projects")
    .select("estimated_total")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (!proj) throw new Error("Proyecto no encontrado");

  const finalPrice = Number(proj.estimated_total) * (1 + marginPercentage / 100);

  const { error } = await supabase
    .from("projects")
    .update({ margin_percentage: marginPercentage, final_price: finalPrice, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) throw new Error("Error actualizando margen");

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, finalPrice, profit: finalPrice - Number(proj.estimated_total) };
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  await supabase.from("projects").update({ status, updated_at: new Date().toISOString() })
    .eq("id", projectId).eq("owner_id", user.id);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  await supabase.from("projects").delete().eq("id", projectId).eq("owner_id", user.id);
  revalidatePath("/dashboard/projects");
  return { success: true };
}
