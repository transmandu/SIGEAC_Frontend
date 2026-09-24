import { cn } from "@/lib/utils";
import type { EditReason } from "@/lib/planificacion/editReasons";
import { format, startOfYear, subDays, subMonths } from "date-fns";

/**
 * Lenguaje visual de la auditoría: el mismo del módulo Supervisor (paneles
 * translúcidos, labels micro-tipográficos, badges suaves). El color se reserva
 * para una sola cosa: el error de captura, que es lo que la vista mide.
 * Las otras correcciones van en teal; el flujo, en neutro.
 *
 * Teal y naranja pasaron el validador de paleta (daltonismo y banda de
 * luminosidad) en ambos temas; el naranja oscuro es un paso más profundo para
 * caer en banda sobre el fondo del tema oscuro.
 */
export const SERIES = {
  corrections: { light: "#2a9d90", dark: "#2a9d90" },
  errors: { light: "#e76e50", dark: "#de6446" },
} as const;

export const correctionFillCls = "bg-[#2a9d90]";
export const errorFillCls = "bg-[#e76e50] dark:bg-[#de6446]";

export const panelCls =
  "rounded-xl border border-border/60 bg-linear-to-b from-muted/30 to-muted/10 p-5 shadow-xs";

export const microLabelCls =
  "text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 select-none";

const badgeBase =
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-xs select-none whitespace-nowrap";

export const reasonBadgeCls = (reason: EditReason | null) =>
  cn(
    badgeBase,
    reason === "ERROR_CAPTURA"
      ? "border-[#e76e50]/40 bg-[#e76e50]/10 text-[#b4452a] dark:text-[#f09a82]"
      : reason
        ? "border-[#2a9d90]/35 bg-[#2a9d90]/10 text-[#1f756b] dark:text-[#6fd0c4]"
        : "border-dashed border-border bg-muted/40 text-muted-foreground",
  );

export const workflowBadgeCls = cn(
  badgeBase,
  "border-border/60 bg-muted/40 font-medium text-muted-foreground",
);

export const neutralBadgeCls = cn(
  badgeBase,
  "border-border/50 bg-background/70 font-medium text-muted-foreground",
);

export type PeriodKey = "30d" | "90d" | "6m" | "12m" | "ytd";

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
  { key: "6m", label: "6 meses" },
  { key: "12m", label: "12 meses" },
  { key: "ytd", label: "Este año" },
];

export const periodRange = (key: PeriodKey): { from: string; to: string } => {
  const today = new Date();
  const from = {
    "30d": subDays(today, 29),
    "90d": subDays(today, 89),
    "6m": subMonths(today, 6),
    "12m": subMonths(today, 12),
    ytd: startOfYear(today),
  }[key];

  return { from: format(from, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd") };
};
