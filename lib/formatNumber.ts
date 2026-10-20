export interface FormatNumberOptions {
  /** Decimales que siempre se muestran (rellena con ceros). Por defecto 0. */
  minDecimals?: number;
  /** Máximo de decimales; los ceros sobrantes se recortan hasta `minDecimals`. Por defecto 2. */
  maxDecimals?: number;
  /** Lo que se imprime si el valor no es un número. Por defecto "—". */
  fallback?: string;
}

/**
 * El valor como número, o null si no lo es. Acepta number y texto: el backend
 * manda los decimales como "17970.81", y un texto con coma ("17970,81") se lee
 * con la coma como decimal y los puntos como miles.
 */
export function parseNumeric(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const text = value.trim();
  if (!text) return null;

  const parsed = Number(
    text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text,
  );

  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Formato numérico único del sistema: punto para los miles y coma para los
 * decimales (17.970,81). Se arma a mano, no con `toLocaleString`: el locale
 * "es-ES" no agrupa los de cuatro cifras (1234) y "es-VE" depende del
 * navegador, así que un mismo valor se veía distinto según la pantalla.
 */
export function formatNumber(
  value: unknown,
  {
    minDecimals = 0,
    maxDecimals = 2,
    fallback = "—",
  }: FormatNumberOptions = {},
): string {
  const number = parseNumeric(value);
  if (number === null) return fallback;

  const fixed = Math.abs(number).toFixed(maxDecimals);
  const [integer, decimals = ""] = fixed.split(".");

  const trimmed = decimals.replace(/0+$/, "").padEnd(minDecimals, "0");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Un valor que redondea a cero no lleva signo: "-0,00" no es un número.
  const sign = number < 0 && Number(fixed) !== 0 ? "-" : "";

  return `${sign}${grouped}${trimmed ? `,${trimmed}` : ""}`;
}
