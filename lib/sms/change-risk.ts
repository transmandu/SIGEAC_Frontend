import type { RiskLevel, TolerabilityLevel } from "@/types";

/**
 * Matriz de riesgo de gestion de cambio.
 *
 * La severidad viaja como letra (A-E) pero se pondera numericamente:
 * A=5 (catastrofico) ... E=1 (insignificante). El indice de riesgo es
 * probabilidad (1-5) x severidad (1-5), por lo que va de 1 a 25.
 */
export const SEVERITY_MAP = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
} as const;

export type SeverityCode = keyof typeof SEVERITY_MAP;

export const SEVERITY_OPTIONS = [
  { value: "A", numeric: 5, label: "A (5) — Catastrófico" },
  { value: "B", numeric: 4, label: "B (4) — Peligroso" },
  { value: "C", numeric: 3, label: "C (3) — Mayor" },
  { value: "D", numeric: 2, label: "D (2) — Menor" },
  { value: "E", numeric: 1, label: "E (1) — Insignificante" },
] as const;

export const PROBABILITY_OPTIONS = [
  { value: "1", label: "1 — Extremadamente Improbable" },
  { value: "2", label: "2 — Improbable" },
  { value: "3", label: "3 — Remoto" },
  { value: "4", label: "4 — Ocasional" },
  { value: "5", label: "5 — Frecuente" },
] as const;

export const RISK_LEVEL_META: Record<
  RiskLevel,
  {
    label: string;
    range: string;
    tolerability: TolerabilityLevel;
    badgeClassName: string;
    dotClassName: string;
  }
> = {
  extremo: {
    label: "Extremo",
    range: "15 – 25",
    tolerability: "intolerable",
    badgeClassName:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
    dotClassName: "bg-red-600 dark:bg-red-500",
  },
  alto: {
    label: "Alto",
    range: "8 – 14",
    tolerability: "tolerable",
    badgeClassName:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    dotClassName: "bg-orange-500 dark:bg-orange-400",
  },
  moderado: {
    label: "Moderado",
    range: "4 – 7",
    tolerability: "tolerable",
    badgeClassName:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800",
    dotClassName: "bg-yellow-400 dark:bg-yellow-300",
  },
  bajo: {
    label: "Bajo",
    range: "1 – 3",
    tolerability: "aceptable",
    badgeClassName:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
    dotClassName: "bg-green-600 dark:bg-green-500",
  },
};

export const TOLERABILITY_LABELS: Record<TolerabilityLevel, string> = {
  aceptable: "Aceptable",
  tolerable: "Tolerable",
  intolerable: "Intolerable",
};

export const RISK_LEVEL_ORDER: RiskLevel[] = [
  "extremo",
  "alto",
  "moderado",
  "bajo",
];

/** Las filas historicas guardan la celda ("2B"), no el indice numerico. */
export function isLegacyRiskIndex(
  riskIndex: number | string | null | undefined,
): boolean {
  return (
    riskIndex !== null &&
    riskIndex !== undefined &&
    riskIndex !== "" &&
    Number.isNaN(Number(riskIndex))
  );
}

export function severityValueFor(severity: string): number {
  const code = severity.trim().toUpperCase() as SeverityCode;

  return SEVERITY_MAP[code] ?? 0;
}

export function riskIndexFor(probability: number, severity: string): number {
  return Number(probability) * severityValueFor(severity);
}

export function riskLevelFor(riskIndex: number): RiskLevel {
  if (riskIndex >= 15) return "extremo";
  if (riskIndex >= 8) return "alto";
  if (riskIndex >= 4) return "moderado";

  return "bajo";
}

export function tolerabilityFor(riskIndex: number): TolerabilityLevel {
  if (riskIndex >= 15) return "intolerable";
  if (riskIndex >= 4) return "tolerable";

  return "aceptable";
}

export function describeRisk(probability: number, severity: string) {
  const index = riskIndexFor(probability, severity);
  const level = riskLevelFor(index);

  return {
    index,
    level,
    ...RISK_LEVEL_META[level],
    tolerabilityLabel: TOLERABILITY_LABELS[RISK_LEVEL_META[level].tolerability],
  };
}
