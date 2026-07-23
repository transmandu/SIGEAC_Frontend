"use client";

import { AlertTriangle, CheckCircle2, Inbox, SearchCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorReport } from "@/types";
import { useGetErrorReports } from "@/hooks/sistema/reportes/useGetErrorReports";

interface ErrorReportKpiCardsProps {
  activeStatus: ErrorReport["status"] | undefined;
  onSelect: (status: ErrorReport["status"] | undefined) => void;
}

const CARD_TONES = {
  slate: {
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
    ring: "ring-slate-300/80 dark:ring-slate-600/60",
    activeBg: "bg-slate-50/80 dark:bg-slate-900/40",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    ring: "ring-rose-300/80 dark:ring-rose-500/50",
    activeBg: "bg-rose-50/80 dark:bg-rose-500/10",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    ring: "ring-amber-300/80 dark:ring-amber-500/50",
    activeBg: "bg-amber-50/80 dark:bg-amber-500/10",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    ring: "ring-emerald-300/80 dark:ring-emerald-500/50",
    activeBg: "bg-emerald-50/80 dark:bg-emerald-500/10",
  },
} as const;

export default function ErrorReportKpiCards({ activeStatus, onSelect }: ErrorReportKpiCardsProps) {
  const { data: total, isLoading: totalLoading } = useGetErrorReports({ page: 1, per_page: 1 });
  const { data: open, isLoading: openLoading } = useGetErrorReports({
    page: 1,
    per_page: 1,
    status: "OPEN",
  });
  const { data: inProgress, isLoading: inProgressLoading } = useGetErrorReports({
    page: 1,
    per_page: 1,
    status: "IN_PROGRESS",
  });
  const { data: resolved, isLoading: resolvedLoading } = useGetErrorReports({
    page: 1,
    per_page: 1,
    status: "RESOLVED",
  });

  const cards: {
    status: ErrorReport["status"] | undefined;
    label: string;
    hint: string;
    value?: number;
    loading: boolean;
    icon: typeof Inbox;
    tone: keyof typeof CARD_TONES;
  }[] = [
    {
      status: undefined,
      label: "Total registrados",
      hint: "Todo el historial",
      value: total?.pagination.total,
      loading: totalLoading,
      icon: Inbox,
      tone: "slate",
    },
    {
      status: "OPEN",
      label: "Abiertos",
      hint: "Atención requerida",
      value: open?.pagination.total,
      loading: openLoading,
      icon: AlertTriangle,
      tone: "rose",
    },
    {
      status: "IN_PROGRESS",
      label: "En investigación",
      hint: "Diagnóstico en curso",
      value: inProgress?.pagination.total,
      loading: inProgressLoading,
      icon: SearchCode,
      tone: "amber",
    },
    {
      status: "RESOLVED",
      label: "Solucionados",
      hint: "Cerrados con éxito",
      value: resolved?.pagination.total,
      loading: resolvedLoading,
      icon: CheckCircle2,
      tone: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const tone = CARD_TONES[card.tone];
        const active = activeStatus === card.status;

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelect(active ? undefined : card.status)}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-background/60 p-4 text-left shadow-sm shadow-slate-200/40 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/80 dark:shadow-none",
              active && cn("ring-2", tone.ring, tone.activeBg)
            )}
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tone.icon)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              {card.loading ? (
                <div className="mt-1 h-6 w-10 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums tracking-tight">{card.value ?? "—"}</p>
              )}
              <p className="truncate text-[11px] text-muted-foreground">{card.hint}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
