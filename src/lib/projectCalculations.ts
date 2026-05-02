export type TemplateItem = {
  id?: string;
  quality_level: string;
  phase_name: string;
  item_name: string;
  base_cost_per_sqft: number;
};

export type ProjectItem = {
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total: number;
};

export type Phase = {
  name: string;
  items: ProjectItem[];
  subtotal: number;
};

export type EstimateResult = {
  phases: Phase[];
  total: number;
  costPerSqft: number;
  timelineMonths: { min: number; max: number };
};

export function calculateProjectEstimate(squareFeet: number, template: TemplateItem[]): EstimateResult {
  if (squareFeet <= 0) throw new Error("Pies cuadrados debe ser mayor a 0");
  if (!template || template.length === 0) throw new Error("Plantilla vacía");

  const phases: Record<string, Phase> = {};

  template.forEach((item) => {
    const total = squareFeet * item.base_cost_per_sqft;
    if (!phases[item.phase_name]) {
      phases[item.phase_name] = { name: item.phase_name, items: [], subtotal: 0 };
    }
    phases[item.phase_name].items.push({
      name: item.item_name,
      quantity: squareFeet,
      unit: "pie²",
      unit_cost: item.base_cost_per_sqft,
      total,
    });
    phases[item.phase_name].subtotal += total;
  });

  const phaseArray = Object.values(phases);
  const totalProject = phaseArray.reduce((s, p) => s + p.subtotal, 0);
  const costPerSqft = totalProject / squareFeet;
  const baselineMonths = Math.ceil(squareFeet / 250);

  return {
    phases: phaseArray,
    total: Math.round(totalProject * 100) / 100,
    costPerSqft: Math.round(costPerSqft * 100) / 100,
    timelineMonths: {
      min: Math.max(1, Math.floor(baselineMonths * 0.8)),
      max: Math.ceil(baselineMonths * 1.2),
    },
  };
}

export function applyMargin(baseTotal: number, marginPercentage: number) {
  if (marginPercentage < 0 || marginPercentage > 100) throw new Error("Margen debe estar entre 0 y 100");
  const finalPrice = baseTotal * (1 + marginPercentage / 100);
  const profit = finalPrice - baseTotal;
  return {
    finalPrice: Math.round(finalPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
