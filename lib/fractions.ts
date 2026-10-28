/**
 * Cantidades fraccionarias (1/2, 1/4… de galón). Solo denominadores potencia
 * de 2, que son exactos en binario: el stock en float no acumula error con
 * ellos. El backend solo recibe el decimal; la fracción vive en la captura.
 */

const FRACTION_DENOMINATORS = [2, 4, 8, 16, 32] as const;

/** Atajos de las salidas: la fracción y el decimal exacto que escriben. */
export const FRACTION_SHORTCUTS = [
  { label: "1/2", value: 0.5 },
  { label: "1/4", value: 0.25 },
  { label: "1/8", value: 0.125 },
  { label: "1/16", value: 0.0625 },
  { label: "1/32", value: 0.03125 },
] as const;

const TOLERANCE = 1e-9;

/** Qué tan lejos de una fracción puede quedar una cantidad para sugerirla. */
const NEAR_RATIO = 0.08;

/**
 * Lo que el usuario escribió como número: `0.5`, `0,5`, `1/2`, `1 1/2`.
 * `null` si no se entiende o no es mayor que 0 (denominador 0 incluido).
 */
export function parseQuantity(text: string): number | null {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return null;

  const mixed = clean.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);
  if (mixed) {
    const denominator = Number(mixed[3]);
    if (denominator === 0) return null;
    const value = Number(mixed[1] ?? 0) + Number(mixed[2]) / denominator;
    return value > 0 ? value : null;
  }

  if (!/^\d*[.,]?\d*$/.test(clean)) return null;

  const value = Number(clean.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Si el texto es una fracción escrita (`1/2`, `1 1/2`) y no un decimal. */
export function isFractionText(text: string): boolean {
  return text.includes("/");
}

/** Deja pasar solo lo que puede formar un decimal o una fracción. */
export function sanitizeQuantityText(raw: string): string {
  return raw.replace(/[^\d.,/ ]/g, "").replace(/ {2,}/g, " ");
}

/**
 * Lo que se guarda en el campo: las fracciones (`1/2`) y los decimales con coma
 * (`0,5`) pasan a decimal con punto (`0.5`), que es lo que leen `parseFloat` y
 * el backend. Un decimal ya normal se deja tal cual lo tecleó el usuario.
 */
export function resolveQuantityText(raw: string): string {
  if (/^\d*\.?\d*$/.test(raw)) return raw;

  const value = parseQuantity(raw);
  return value === null ? raw : String(value);
}

/** `"1/2"`, `"3/4"`, `"1 1/2"`; `null` si es entera o no es una fracción exacta. */
export function fractionLabel(quantity: number): string | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const whole = Math.floor(quantity + TOLERANCE);
  const rest = quantity - whole;
  if (rest < TOLERANCE) return null;

  for (const denominator of FRACTION_DENOMINATORS) {
    let numerator = Math.round(rest * denominator);
    if (numerator < 1 || numerator >= denominator) continue;
    if (Math.abs(rest - numerator / denominator) > TOLERANCE) continue;

    let reduced = denominator as number;
    while (numerator % 2 === 0) {
      numerator /= 2;
      reduced /= 2;
    }

    const fraction = `${numerator}/${reduced}`;
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  return null;
}

/**
 * La fracción nominal a la que una cantidad se parece sin serlo: 0.528 galones
 * (2 litros) no es 1/2, pero se le parece. Sirve para avisar, nunca para
 * corregir en silencio. `null` si ya es una fracción exacta o no se parece a
 * ninguna.
 */
export function nearFraction(
  quantity: number,
): { label: string; value: number } | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (fractionLabel(quantity) !== null) return null;

  for (const denominator of FRACTION_DENOMINATORS) {
    const candidate = Math.round(quantity * denominator) / denominator;
    if (candidate <= 0) continue;

    if (Math.abs(quantity - candidate) / candidate > NEAR_RATIO) continue;

    const label = fractionLabel(candidate);
    if (label !== null) return { label, value: candidate };
    // Entero cercano (1.97 → 2): no es una fracción que sugerir.
    return null;
  }

  return null;
}
