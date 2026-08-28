"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { MaintenanceCompliance } from "@/types";
import { CalendarRange, Plane, Timer, Wrench } from "lucide-react";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const formatMonth = (key: string) => {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[Number(month) - 1] ?? month} '${year.slice(2)}`;
};

const CARD_HEIGHT = "h-48";

function StatCard({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-1 basis-56 flex-col gap-2 overflow-hidden rounded-xl p-4",
        "bg-gradient-to-br from-background/70 to-background/40 backdrop-blur-md",
        "border border-slate-400/50 shadow-sm dark:border-slate-600/50",
        "transition-shadow duration-200 hover:shadow-md hover:shadow-blue-500/10",
        CARD_HEIGHT,
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );
}

function TopList({ data, emptyLabel }: { data: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(data).slice(0, 4);

  if (entries.length === 0) {
    return <p className="text-xs italic text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...entries.map(([, count]) => count));

  return (
    <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
      {entries.map(([label, count]) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs" title={label}>{label}</span>
            <span className="shrink-0 text-xs font-semibold tabular-nums">{count}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#2e5efa] dark:bg-[#3987e5]"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const MonthTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 shadow-md">
      <p className="text-[11px] text-muted-foreground">{payload[0].payload.label}</p>
      <p className="text-sm font-semibold">
        {payload[0].value} <span className="text-[11px] font-normal text-muted-foreground">cumplimientos</span>
      </p>
    </div>
  );
};

/**
 * Todo se deriva del mismo array de cumplimientos ya cargado por la página
 * (respeta el filtro de aeronave activo): conteos por mes, por aeronave, por
 * certificado/servicio, y el intervalo promedio entre cumplimientos
 * consecutivos de un MISMO ítem (solo cuenta ítems con 2+ cumplimientos).
 */
function useComplianceStats(compliances: MaintenanceCompliance[]) {
  return useMemo(() => {
    const byMonth: Record<string, number> = {};
    const byAircraft: Record<string, number> = {};
    const byItem: Record<string, number> = {};
    const datesByItem: Record<string, Date[]> = {};

    for (const c of compliances) {
      const date = parseISO(c.compliance_date);
      const monthKey = format(date, "yyyy-MM");
      byMonth[monthKey] = (byMonth[monthKey] ?? 0) + 1;

      const aircraftLabel = c.maintenance_control_item?.maintenance_control?.aircraft?.acronym ?? "—";
      byAircraft[aircraftLabel] = (byAircraft[aircraftLabel] ?? 0) + 1;

      const itemName = c.maintenance_control_item?.name ?? "—";
      byItem[itemName] = (byItem[itemName] ?? 0) + 1;

      const itemKey = String(c.maintenance_control_item_id);
      (datesByItem[itemKey] ??= []).push(date);
    }

    let totalIntervalDays = 0;
    let intervalCount = 0;
    for (const dates of Object.values(datesByItem)) {
      if (dates.length < 2) continue;
      const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
      for (let i = 1; i < sorted.length; i++) {
        totalIntervalDays += differenceInCalendarDays(sorted[i], sorted[i - 1]);
        intervalCount++;
      }
    }

    const months = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, label: formatMonth(key), value }));

    const sortByCountDesc = (record: Record<string, number>) =>
      Object.fromEntries(Object.entries(record).sort(([, a], [, b]) => b - a));

    return {
      total: compliances.length,
      months,
      byAircraft: sortByCountDesc(byAircraft),
      byItem: sortByCountDesc(byItem),
      avgIntervalDays: intervalCount > 0 ? Math.round(totalIntervalDays / intervalCount) : null,
      intervalSampleSize: intervalCount,
    };
  }, [compliances]);
}

export function MaintenanceComplianceStats({ compliances }: { compliances: MaintenanceCompliance[] }) {
  const stats = useComplianceStats(compliances);
  const peakMonth = stats.months.length ? Math.max(...stats.months.map((m) => m.value)) : 0;

  return (
    <div className="flex flex-wrap gap-3">
      <StatCard label="Cumplimientos por mes" icon={<CalendarRange className="size-3.5" />}>
        {stats.months.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">Sin cumplimientos registrados.</p>
        ) : (
          <>
            <div className="relative min-h-12 w-full flex-1">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.months} margin={{ top: 2, bottom: 0 }}>
                    <Tooltip content={<MonthTooltip />} cursor={{ className: "fill-muted/40" }} />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={14}>
                      {stats.months.map((month) => (
                        <Cell
                          key={month.key}
                          className={
                            month.value === peakMonth
                              ? "fill-[#2e5efa] dark:fill-[#3987e5]"
                              : "fill-[#6d8efc] dark:fill-[#2c64ac]"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground">
                {stats.months.length === 1 ? stats.months[0].label : `${stats.months[0].label} — ${stats.months.at(-1)!.label}`}
              </span>
              <span className="text-xs font-semibold tabular-nums">
                {stats.total} <span className="font-normal text-muted-foreground">total</span>
              </span>
            </div>
          </>
        )}
      </StatCard>

      <StatCard label="Intervalo promedio" icon={<Timer className="size-3.5" />}>
        {stats.avgIntervalDays === null ? (
          <p className="text-xs italic text-muted-foreground">
            Hace falta al menos 2 cumplimientos de un mismo ítem para calcularlo.
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold leading-none">{stats.avgIntervalDays}</span>
              <span className="text-xs text-muted-foreground">días</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Entre cumplimientos consecutivos de un mismo certificado/servicio.
            </p>
            <p className="mt-auto text-[11px] text-muted-foreground">
              Calculado sobre {stats.intervalSampleSize} {stats.intervalSampleSize === 1 ? "intervalo" : "intervalos"}.
            </p>
          </>
        )}
      </StatCard>

      <StatCard label="Por aeronave" icon={<Plane className="size-3.5" />}>
        <TopList data={stats.byAircraft} emptyLabel="Sin cumplimientos registrados." />
      </StatCard>

      <StatCard label="Por certificado / servicio" icon={<Wrench className="size-3.5" />}>
        <TopList data={stats.byItem} emptyLabel="Sin cumplimientos registrados." />
      </StatCard>
    </div>
  );
}
