import { formatCalendarDate } from "@/lib/date";
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

export const formatQuarantineDate = (value?: string | null) =>
  formatCalendarDate(value, "short", "-");

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

/**
 * Tramo de consumo del plazo legal, en pasos de 20%. El 5 es el vencido: no es
 * "el último tramo" sino un estado distinto — ahí la exposición ante el ente ya
 * ocurrió y la alerta deja de anticiparla.
 */
export type QuarantineHazardTier = 0 | 1 | 2 | 3 | 4 | 5;

export type QuarantineHazard = QuarantineRisk & {
  tier: QuarantineHazardTier;
  /** Fracción del plazo consumida, recortada a 1 para dibujar la barra. */
  progress: number;
  isExpired: boolean;
};

export const quarantineHazard = (
  entryDate: string | null | undefined,
  legalDays: number,
  elapsedFromServer?: number | null,
): QuarantineHazard => {
  const risk = quarantineRisk(entryDate, legalDays, elapsedFromServer);

  if (risk.days === null || legalDays <= 0) {
    return { ...risk, tier: 0, progress: 0, isExpired: false };
  }

  const ratio = risk.days / legalDays;
  const isExpired = ratio >= 1;

  return {
    ...risk,
    tier: isExpired ? 5 : (Math.min(4, Math.floor(ratio * 5)) as QuarantineHazardTier),
    progress: Math.min(1, ratio),
    isExpired,
  };
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
