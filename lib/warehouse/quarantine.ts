import type { QuarantineStatus } from "@/types/quarantine";

/**
 * Respaldo cuando el ajuste de la empresa aún no cargó. El valor real vive en
 * company_settings.quarantine_legal_days y llega por useCompanySettings; antes
 * este número estaba escrito a mano en dos vistas distintas.
 */
export const DEFAULT_QUARANTINE_LEGAL_DAYS = 40;

/** Umbral a partir del cual el plazo se muestra como "por vencer". */
const WARNING_RATIO = 0.75;

export type QuarantineRiskState = "ok" | "warning" | "expired" | "unknown";

export type QuarantineRisk = {
  days: number | null;
  remaining: number | null;
  state: QuarantineRiskState;
};

/**
 * Las fechas del ciclo llegan como ISO 8601 ("2026-02-11T00:00:00.000000Z"),
 * porque Eloquent castea las columnas a date/datetime. Se toma solo la parte de
 * fecha y se construye en hora local: interpretar el ISO completo correría el
 * día según la zona horaria del navegador, y aquí el día es lo que cuenta para
 * el plazo legal.
 */
const parseQuarantineDate = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);

  if (!y || !m || !d) return null;

  return new Date(y, m - 1, d);
};

export const daysSinceYMD = (value: string) => {
  const start = parseQuarantineDate(value);

  if (!start) return 0;

  const diff = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const formatQuarantineDate = (value?: string | null) => {
  if (!value) return "-";

  const date = parseQuarantineDate(value);

  if (!date) return "-";

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Riesgo respecto al plazo legal. Acepta los días ya calculados por el backend
 * (`days_in_quarantine`) para no recalcular contra la fecha cuando el registro
 * ya salió de cuarentena, caso en que el conteo se detiene en la salida.
 */
export const quarantineRisk = (
  entryDate: string | null | undefined,
  legalDays: number,
  elapsedFromServer?: number | null,
): QuarantineRisk => {
  const days = elapsedFromServer ?? (entryDate ? daysSinceYMD(entryDate) : null);

  if (days === null) {
    return { days: null, remaining: null, state: "unknown" };
  }

  const remaining = legalDays - days;

  if (days >= legalDays) return { days, remaining, state: "expired" };
  if (days >= Math.floor(legalDays * WARNING_RATIO)) return { days, remaining, state: "warning" };

  return { days, remaining, state: "ok" };
};

export const QUARANTINE_STATUS_ES: Record<QuarantineStatus, string> = {
  OPEN: "En cuarentena",
  PENDING_REINSPECTION: "Pendiente de re-inspección",
  RESOLVED: "Resuelto",
};

export const quarantineStatusLabel = (status?: string | null) => {
  const key = String(status ?? "").trim().toUpperCase() as QuarantineStatus;
  return QUARANTINE_STATUS_ES[key] ?? "—";
};
