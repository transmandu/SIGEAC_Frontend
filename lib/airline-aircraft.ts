import type { TagTone } from "@/components/misc/TagBadge";
import type { AirlineAircraft } from "@/types";

export const AIRCRAFT_STATUS_LABELS: Record<AirlineAircraft["status"], string> =
  {
    "EN POSESION": "En posesión",
    RENTADO: "Rentado",
    VENDIDO: "Vendido",
  };

export const AIRCRAFT_STATUS_TONES: Record<AirlineAircraft["status"], TagTone> =
  {
    "EN POSESION": "emerald",
    RENTADO: "sky",
    VENDIDO: "slate",
  };

/**
 * La API manda la fecha de fabricación como `YYYY-MM-DD`. Se arma en hora
 * local: `new Date("2018-05-01")` es medianoche UTC y en Venezuela caería un
 * día antes.
 */
export function parseApiDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}
