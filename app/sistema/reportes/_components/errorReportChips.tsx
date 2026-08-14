import { ErrorReport } from "@/types";
import { cn } from "@/lib/utils";

/* ───────────────────────── Chip: soft, semantic badge ───────────────────────── */

export type ChipTone = "emerald" | "indigo" | "rose" | "amber" | "orange" | "slate" | "sky";

const CHIP_TONES: Record<ChipTone, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  indigo:
    "bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
  rose: "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  orange:
    "bg-orange-50 text-orange-700 border-orange-200/70 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
  sky: "bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
  slate:
    "bg-slate-100 text-slate-700 border-slate-200/70 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20",
};

export function Chip({
  tone = "slate",
  icon,
  children,
}: {
  tone?: ChipTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit select-none items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        // Mismo criterio que el Badge: el hover ajusta el propio color.
        "transition-[filter] duration-150 hover:brightness-95 dark:hover:contrast-125",
        CHIP_TONES[tone]
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export const STATUS_CHIP: Record<ErrorReport["status"], { label: string; tone: ChipTone }> = {
  OPEN: { label: "ABIERTO", tone: "rose" },
  IN_PROGRESS: { label: "EN PROGRESO", tone: "amber" },
  RESOLVED: { label: "RESUELTO", tone: "emerald" },
};

export function sourceTone(source: string): ChipTone {
  const s = source.toLowerCase();
  if (s.includes("whatsapp")) return "emerald";
  if (s.includes("mail")) return "sky";
  if (s.includes("web") || s.includes("app")) return "indigo";
  return "slate";
}

export function httpStatusTone(status: number | null): ChipTone {
  if (status == null) return "slate";
  if (status >= 500) return "rose";
  if (status >= 400) return "amber";
  return "emerald";
}
