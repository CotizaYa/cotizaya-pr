// ── Fracciones a pulgadas decimales ──────────────────────────────────────
export function parseFraction(input: string): number {
  const s = input.trim();
  if (!s) return 0;
  const wholeAndFrac = s.split(" ");
  if (wholeAndFrac.length === 2) {
    const whole = parseFloat(wholeAndFrac[0]);
    const [num, den] = wholeAndFrac[1].split("/").map(Number);
    return whole + num / den;
  }
  if (s.includes("/")) {
    const [num, den] = s.split("/").map(Number);
    return num / den;
  }
  return parseFloat(s) || 0;
}

// ── Pulgadas decimales a fracción legible ────────────────────────────────
export function inchesToFraction(inches: number): string {
  const whole = Math.floor(inches);
  const frac = inches - whole;
  if (frac === 0) return `${whole}"`;
  
  const denominators = [2, 4, 8, 16];
  for (const d of denominators) {
    const num = Math.round(frac * d);
    if (num === 0) continue;
    if (num === d) return `${whole + 1}"`;
    const g = gcd(num, d);
    const simpleFrac = `${num / g}/${d / g}`;
    return whole > 0 ? `${whole}" ${simpleFrac}` : `${simpleFrac}"`;
  }
  return `${inches.toFixed(3)}"`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ── Cálculo de línea (Fórmula Crítica Sprint 1) ──────────────────────────
export function calcLineTotal(params: {
  priceType: "por_unidad" | "por_pie_cuadrado" | "por_pie_lineal";
  unitPrice: number;
  widthInches?: number;
  heightInches?: number;
  quantity: number;
}): number {
  const { priceType, unitPrice, widthInches = 0, heightInches = 0, quantity } = params;
  let base = 0;

  if (priceType === "por_pie_cuadrado") {
    // FÓRMULA EXACTA: (W * H / 144) * Precio * Cantidad
    base = (widthInches * heightInches / 144) * unitPrice;
  } else if (priceType === "por_pie_lineal") {
    const linealFt = widthInches / 12;
    base = linealFt * unitPrice;
  } else {
    base = unitPrice;
  }

  return Math.round(base * quantity * 10000) / 10000;
}

// ── Totales de cotización ────────────────────────────────────────────────
export function calcQuoteTotals(params: {
  items: Array<{ line_total: number; category_snapshot: string }>;
  ivuRate: number;
  depositRate: number;
}) {
  const { items, ivuRate, depositRate } = params;
  
  const laborCategories = ["miscelanea"];
  let subtotalMaterials = 0;
  let subtotalLabor = 0;

  for (const item of items) {
    if (laborCategories.includes(item.category_snapshot)) {
      subtotalLabor += Number(item.line_total);
    } else {
      subtotalMaterials += Number(item.line_total);
    }
  }

  const subtotalBeforeIvu = subtotalMaterials + subtotalLabor;
  const ivuAmount = 0;
  const total = Math.round((subtotalBeforeIvu + ivuAmount) * 100) / 100;
  const depositAmount = Math.round(total * depositRate * 100) / 100;
  const balanceAmount = total - depositAmount;

  return { 
    subtotalMaterials, 
    subtotalLabor, 
    ivuAmount, 
    total, 
    depositAmount,
    balanceAmount 
  };
}

// ── Formato de moneda ─────────────────────────────────────────────────────
export function formatUSD(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(n);
}
