"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/misc/EmptyState";
import { cn } from "@/lib/utils";
import { formatInstant } from "@/lib/date";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import {
  CalendarClock,
  History,
  PackageCheck,
  Pencil,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { GeneralArticleCostHistoryEntry } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
  brandModel?: string;
  variantType?: string;
  history?: GeneralArticleCostHistoryEntry[];
  /** El historial se pide al abrir la hoja: no viaja con cada fila. */
  isLoading?: boolean;
};

type Source = GeneralArticleCostHistoryEntry["source"];

const SOURCES: Record<
  Source,
  { icon: LucideIcon; label: string; badge: string; dot: string }
> = {
  PURCHASE: {
    icon: ShoppingCart,
    label: "Compra",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  },
  MANUAL: {
    icon: Pencil,
    label: "Edición manual",
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  },
  SEED: {
    icon: History,
    label: "Costo previo",
    badge:
      "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dot: "border-slate-400/50 text-slate-500 dark:text-slate-400",
  },
};

const money = (value: number | null | undefined) =>
  `$${Number(value ?? 0).toFixed(2)}`;

interface Change {
  amount: number;
  percent: number | null;
}

/** Cambio entre dos costos; solo es comparable si están en la misma unidad. */
const changeBetween = (
  newer: GeneralArticleCostHistoryEntry,
  older?: GeneralArticleCostHistoryEntry,
): Change | null => {
  if (!older || newer.cost == null || older.cost == null) return null;
  if ((newer.unit_label ?? null) !== (older.unit_label ?? null)) return null;

  const amount = newer.cost - older.cost;
  if (amount === 0) return null;

  return {
    amount,
    percent: older.cost !== 0 ? (amount / older.cost) * 100 : null,
  };
};

const ChangeChip = ({ change }: { change: Change }) => {
  const up = change.amount > 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md border px-2 text-xs font-medium tabular-nums",
        up
          ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      )}
    >
      <Icon className="size-3.5" />
      {up ? "+" : "−"}
      {money(Math.abs(change.amount))}
      {change.percent != null && ` (${Math.abs(change.percent).toFixed(1)}%)`}
    </span>
  );
};

interface PersonProps {
  label: string;
  name: string | null | undefined;
  icon: LucideIcon;
}

/**
 * Quién dejó cada entrada, con el papel que tuvo. En una compra son dos
 * personas distintas: el precio sale de la cotización y compras registra la
 * entrega; quien confirma solo da fe de que llegó al almacén. Atribuir el costo
 * al segundo, como hacía el historial, era incorrecto.
 */
const peopleOf = (entry: GeneralArticleCostHistoryEntry): PersonProps[] => {
  if (entry.source === "PURCHASE") {
    const registered = entry.registered_by ?? null;
    const confirmed = entry.confirmed_by ?? entry.by ?? null;

    if (registered && registered === confirmed) {
      return [
        { label: "Registró y confirmó", name: registered, icon: ShoppingCart },
      ];
    }

    return [
      ...(registered
        ? [
            {
              label: "Registró la compra",
              name: registered,
              icon: ShoppingCart,
            },
          ]
        : []),
      { label: "Confirmó el ingreso", name: confirmed, icon: PackageCheck },
    ];
  }

  return [
    {
      label:
        entry.source === "MANUAL" ? "Costo editado por" : "Costo cargado por",
      name: entry.by,
      icon: UserRound,
    },
  ];
};

const Person = ({ label, name, icon: Icon }: PersonProps) => (
  <div className="flex items-start justify-between gap-3 text-[13px]">
    <span className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground max-sm:max-w-[45%]">
      <Icon className="size-3.5" />
      {label}
    </span>
    <span className="min-w-0 text-right font-medium wrap-anywhere text-slate-700 dark:text-slate-200">
      {name ?? "—"}
    </span>
  </div>
);

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-border/60 bg-background px-3 py-2.5">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold tabular-nums wrap-anywhere">
      {children}
    </span>
  </div>
);

const GeneralCostHistorySheet = ({
  open,
  onOpenChange,
  description,
  brandModel,
  variantType,
  history,
  isLoading = false,
}: Props) => {
  const timeZone = useCompanyTimezone();

  // Más reciente primero, sin suponer el orden en que llegue del servidor.
  const entries = useMemo(
    () =>
      [...(history ?? [])].sort(
        (a, b) =>
          (Date.parse(b.date ?? "") || 0) - (Date.parse(a.date ?? "") || 0),
      ),
    [history],
  );

  const current = entries[0];
  const first = entries[entries.length - 1];
  const overall =
    entries.length > 1 && current && first
      ? changeBetween(current, first)
      : null;

  const detail = [brandModel, variantType].filter(Boolean).join(" · ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <div className="shrink-0 border-b bg-linear-to-b from-slate-50 to-background px-5 pb-4 pt-5 dark:from-slate-900/40 sm:px-6 sm:pt-6">
          <div className="flex items-start gap-3 pr-8">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="size-5" />
            </span>

            <div className="min-w-0 space-y-1">
              <SheetTitle className="text-lg font-semibold leading-snug tracking-tight">
                Historial de costos
              </SheetTitle>
              <SheetDescription asChild>
                <div>
                  <p className="text-sm font-medium text-foreground/80 wrap-break-word">
                    {description ?? "Artículo general"}
                  </p>
                  {detail && (
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  )}
                </div>
              </SheetDescription>
            </div>
          </div>

          {!isLoading && current && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Costo actual">
                {money(current.cost)}
                {current.unit_label && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / {current.unit_label}
                  </span>
                )}
              </Stat>
              <Stat label="Movimientos">{entries.length}</Stat>
              <Stat label="Variación">
                {overall ? (
                  <span
                    className={
                      overall.amount > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {overall.amount > 0 ? "+" : "−"}
                    {overall.percent != null
                      ? `${Math.abs(overall.percent).toFixed(1)}%`
                      : money(Math.abs(overall.amount))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Stat>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {isLoading && (
            <div className="flex flex-col gap-3" role="status">
              <span className="sr-only">Cargando historial…</span>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <EmptyState
              icon={History}
              title="Sin movimientos de costo"
              description="Aún no hay compras ni ajustes registrados para este artículo."
            />
          )}

          {!isLoading && entries.length > 0 && (
            <ol className="relative flex flex-col gap-3 pl-10">
              <span
                aria-hidden
                className="absolute bottom-4 left-3.5 top-4 w-px bg-border"
              />

              {entries.map((entry, index) => {
                const source = SOURCES[entry.source];
                const Icon = source.icon;
                const change = changeBetween(entry, entries[index + 1]);

                return (
                  <li key={index} className="relative">
                    <span
                      className={cn(
                        "absolute -left-10 top-3 flex size-7 items-center justify-center rounded-full border bg-background",
                        source.dot,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>

                    <div
                      className={cn(
                        "flex flex-col gap-2.5 rounded-xl border bg-background p-3.5",
                        index === 0
                          ? "border-primary/30 shadow-xs"
                          : "border-border/70",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex h-6 items-center rounded-md border px-2.5 text-xs font-medium",
                            source.badge,
                          )}
                        >
                          {source.label}
                        </span>

                        <span className="flex items-baseline gap-1 text-base font-semibold tabular-nums">
                          {money(entry.cost)}
                          {entry.unit_label && (
                            <span className="text-xs font-normal text-muted-foreground">
                              / {entry.unit_label}
                            </span>
                          )}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-[13px] tabular-nums text-slate-600 dark:text-slate-300">
                        <CalendarClock className="size-3.5 text-muted-foreground" />
                        {formatInstant(entry.date, timeZone, "dateTime")}
                      </span>

                      <div className="flex flex-col gap-1.5 rounded-md bg-muted/40 px-2.5 py-2">
                        {peopleOf(entry).map((person) => (
                          <Person key={person.label} {...person} />
                        ))}
                      </div>

                      {(change ||
                        (entry.source === "PURCHASE" &&
                          (entry.quantity != null ||
                            entry.purchase_order_number))) && (
                        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2.5">
                          {change && <ChangeChip change={change} />}

                          {entry.source === "PURCHASE" &&
                            entry.purchase_order_number && (
                              <span className="inline-flex h-6 items-center rounded-md border border-border/60 bg-muted/40 px-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                OC {entry.purchase_order_number}
                              </span>
                            )}

                          {entry.source === "PURCHASE" &&
                            entry.requisition_order_number && (
                              <span className="inline-flex h-6 items-center rounded-md border border-border/60 bg-muted/40 px-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                Req. {entry.requisition_order_number}
                              </span>
                            )}

                          {entry.source === "PURCHASE" &&
                            entry.quantity != null && (
                              <span className="inline-flex h-6 items-center rounded-md border border-border/60 bg-muted/40 px-2 text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
                                Cantidad {entry.quantity}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GeneralCostHistorySheet;
