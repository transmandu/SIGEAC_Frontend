"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { intakeStatusLabelEs } from "@/lib/warehouse/statuses";
import { CalendarRange, Package, TrendingUp, Truck } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

type StatsProps = {
  total: number;
  byMonth: Record<string, number>;
  topArticles: Record<string, number>;
  /** Aeronáuticas compran a un vendor; las generales a un retailer. */
  topSuppliers: Record<string, number>;
  supplierLabel: string;
  /** Solo los artículos generales tienen estados. */
  byStatus?: Record<string, number>;
  periodLabel: string;
  /** Desglose que ocupa el lugar de los estados cuando no los hay. */
  breakdown?: { label: string; value: number | string }[];
};

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const formatMonth = (key: string) => {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[Number(month) - 1] ?? month} '${year.slice(2)}`;
};

const STATUS_DOTS: Record<string, string> = {
  CONFIRMED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  PENDING: "bg-amber-500",
};


/**
 * Alto fijo de la fila: lo dicta el caso más alto — el card de totales con los
 * cuatro estados del intake. El resto se acomoda dentro sin estirar nada.
 */
const CARD_HEIGHT = "h-48";

const StatCard = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card className={cn("flex-1 basis-56 overflow-hidden", CARD_HEIGHT)}>
    <CardContent className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </CardContent>
  </Card>
);

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
      <p className="text-[11px] text-muted-foreground">
        {payload[0].payload.label}
      </p>
      <p className="text-sm font-semibold">
        {payload[0].value}{" "}
        <span className="text-[11px] font-normal text-muted-foreground">
          recepciones
        </span>
      </p>
    </div>
  );
};

const TopList = ({
  data,
  emptyLabel,
}: {
  data: Record<string, number>;
  emptyLabel: string;
}) => {
  const entries = Object.entries(data).slice(0, 3);

  if (entries.length === 0) {
    return <p className="text-xs italic text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...entries.map(([, count]) => count));

  return (
    <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
      {entries.map(([label, count]) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-xs" title={label}>
              {label}
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums">
              {count}
            </span>
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
};

export const ReceptionStats = ({
  total,
  byMonth,
  topArticles,
  topSuppliers,
  supplierLabel,
  byStatus,
  periodLabel,
  breakdown,
}: StatsProps) => {
  const months = Object.entries(byMonth).map(([key, value]) => ({
    key,
    label: formatMonth(key),
    value,
  }));

  const peak = months.length ? Math.max(...months.map((m) => m.value)) : 0;
  const monthAverage = months.length
    ? Math.round((total / months.length) * 10) / 10
    : 0;

  return (
    <div className="flex flex-wrap gap-3">
      <StatCard label="Total recibido" icon={<Package className="size-3.5" />}>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold leading-none">{total}</span>
          <span className="text-xs text-muted-foreground">
            {total === 1 ? "recepción" : "recepciones"}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">{periodLabel}</p>

        {byStatus ? (
          <div className="mt-auto flex shrink-0 flex-col gap-1 border-t pt-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    STATUS_DOTS[status] ?? "bg-muted-foreground",
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {intakeStatusLabelEs(status)}
                </span>
                <span className="ml-auto text-xs font-semibold tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          breakdown && (
            <div className="mt-auto flex shrink-0 flex-col gap-1 border-t pt-2">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="ml-auto text-xs font-semibold tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </StatCard>

      <StatCard
        label="Recepciones por mes"
        icon={<CalendarRange className="size-3.5" />}
      >
        {months.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">
            Sin recepciones en el período.
          </p>
        ) : (
          <>
            <div className="relative min-h-12 w-full flex-1">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 2, bottom: 0 }}>
                    <Tooltip
                      content={<MonthTooltip />}
                      cursor={{ className: "fill-muted/40" }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={14}>
                      {months.map((month) => (
                        <Cell
                          key={month.key}
                          className={
                            month.value === peak
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
                {months.length === 1
                  ? months[0].label
                  : `${months[0].label} — ${months.at(-1)!.label}`}
              </span>
              <span className="text-xs font-semibold tabular-nums">
                {monthAverage}
                <span className="font-normal text-muted-foreground"> /mes</span>
              </span>
            </div>
          </>
        )}
      </StatCard>

      <StatCard
        label="Artículos más recibidos"
        icon={<TrendingUp className="size-3.5" />}
      >
        <TopList
          data={topArticles}
          emptyLabel="Sin recepciones en el período."
        />
      </StatCard>

      <StatCard label={supplierLabel} icon={<Truck className="size-3.5" />}>
        <TopList
          data={topSuppliers}
          emptyLabel={`Sin ${supplierLabel.toLowerCase()} registrados en el período.`}
        />
      </StatCard>
    </div>
  );
};
