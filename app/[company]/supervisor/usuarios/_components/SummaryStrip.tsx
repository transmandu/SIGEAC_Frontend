"use client";

import { cn } from "@/lib/utils";
import type { Summary } from "@/app/[company]/supervisor/usuarios/_lib/activity";
import type { DirectoryFilter } from "./DirectoryPanel";

interface Metric {
  key: string;
  label: string;
  value: number;
  dot: string;
  /** Pestaña del directorio que abre al pulsarla; sin ella no es pulsable. */
  filter?: DirectoryFilter;
}

/** Tres cifras en una franja; las que tienen lista detrás filtran el directorio. */
export function SummaryStrip({
  summary,
  loading,
  onSelect,
}: {
  summary: Summary;
  loading: boolean;
  onSelect: (filter: DirectoryFilter) => void;
}) {
  const metrics: Metric[] = [
    {
      key: "connected",
      label: "Conectados",
      value: summary.online + summary.standby,
      dot: "bg-emerald-500",
      filter: "connected",
    },
    {
      key: "sessions",
      label: "Sesiones abiertas",
      value: summary.sessions,
      dot: "bg-blue-500",
    },
    {
      key: "attention",
      label: "Requieren atención",
      value: summary.attention,
      dot: summary.attention === 0 ? "bg-slate-400" : "bg-rose-500",
      filter: "attention",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-border/60 sm:grid-cols-3 dark:border-slate-700/60">
      {metrics.map((metric) => {
        const body = (
          <>
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span
                aria-hidden
                className={cn("size-2 rounded-full", metric.dot)}
              />
              {metric.label}
            </span>
            <span className="mt-1 block text-2xl font-semibold tabular-nums text-slate-700 dark:text-slate-200">
              {loading ? "…" : metric.value}
            </span>
          </>
        );

        return metric.filter ? (
          <button
            key={metric.key}
            type="button"
            onClick={() => onSelect(metric.filter!)}
            className="bg-white px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary/40 dark:bg-slate-900"
          >
            {body}
          </button>
        ) : (
          <div
            key={metric.key}
            className="bg-white px-4 py-3 dark:bg-slate-900"
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}
