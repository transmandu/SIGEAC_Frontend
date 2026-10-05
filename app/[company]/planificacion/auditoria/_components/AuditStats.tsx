"use client";

import {
  ACTION_META,
  MODULE_META,
  fieldLabel,
  typeLabel,
} from "@/components/planificacion/auditoria/labels";
import {
  SERIES,
  correctionFillCls,
  errorFillCls,
  microLabelCls,
  panelCls,
} from "@/components/planificacion/auditoria/ui";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGetPlanificationAuditStats } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditStats";
import { EDIT_REASON_LABELS } from "@/lib/planificacion/editReasons";
import { cn } from "@/lib/utils";
import type {
  AuditAction,
  AuditModule,
  PlanificationAuditFilters,
  PlanificationAuditStats,
} from "@/types/planification/audit";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, BarChart3, Loader2 } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  corrections: { label: "Correcciones", theme: SERIES.corrections },
  errors: { label: "Errores de captura", theme: SERIES.errors },
} satisfies ChartConfig;

type StatsFilters = Pick<PlanificationAuditFilters, "from" | "to" | "module">;

export function AuditStats(filters: StatsFilters) {
  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
  } = useGetPlanificationAuditStats(filters);

  if (isLoading) {
    return (
      <div
        className={cn(panelCls, "flex min-h-60 items-center justify-center")}
      >
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <EmptyPanel
        message="No se pudo cargar la estadística"
        className="min-h-60"
      />
    );
  }

  return (
    // Con keepPreviousData, al cambiar de período se ven los datos anteriores
    // mientras llegan los nuevos: se atenúan para que no se lean como actuales.
    <div
      className={cn(
        "flex flex-col gap-4 transition-opacity",
        isFetching && "opacity-60",
      )}
      aria-busy={isFetching}
    >
      <KpiStrip stats={stats} />

      <div className="grid gap-4 xl:grid-cols-3">
        <TrendPanel stats={stats} className="xl:col-span-2" />
        <ReasonPanel stats={stats} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ErrorRatePanel stats={stats} />
        <ActivityPanel stats={stats} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MeterPanel
          title="Campos más corregidos"
          hint="Top 10 del período"
          rows={stats.by_field.slice(0, 10).map((row) => ({
            key: `${row.type}.${row.field}`,
            label: fieldLabel(row.field),
            sublabel: typeLabel(row.type),
            critical: row.critical,
            total: row.count,
            errors: row.errors,
          }))}
        />
        <MeterPanel
          title="Por autor del registro"
          hint="Quién cargó el dato que luego se corrigió"
          rows={stats.by_author.map((row) => ({
            key: row.author,
            label: row.author,
            total: row.corrections,
            errors: row.errors,
          }))}
        />
      </div>

      {stats.totals.unclassified > 0 && (
        <p className="text-xs text-muted-foreground/70">
          {stats.totals.unclassified}{" "}
          {stats.totals.unclassified === 1 ? "corrección" : "correcciones"} sin
          motivo: se hicieron fuera de los formularios y no entran en la tasa de
          error.
        </p>
      )}
    </div>
  );
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

function KpiStrip({ stats }: { stats: PlanificationAuditStats }) {
  const { totals, time_to_correction: ttc } = stats;

  return (
    <div
      className={cn(
        panelCls,
        "grid gap-6 p-0 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0",
      )}
    >
      <Kpi title="Operaciones">
        <KpiValue>{totals.operations}</KpiValue>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{totals.entries}</span>{" "}
          registros tocados ·{" "}
          <span className="font-medium text-foreground">{totals.workflow}</span>{" "}
          de flujo
        </p>
      </Kpi>

      <Kpi title="Correcciones">
        <KpiValue>{totals.corrections}</KpiValue>
        <p className="text-xs text-muted-foreground">
          Incluye bajas, reactivaciones y eliminaciones
          {totals.critical_corrections > 0 && (
            <>
              {" · "}
              <span className="font-medium text-foreground">
                {totals.critical_corrections}
              </span>{" "}
              en campos críticos
            </>
          )}
        </p>
      </Kpi>

      <Kpi title="Errores de captura">
        <KpiValue>{totals.errors}</KpiValue>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <div
            className={cn("h-full rounded-full", errorFillCls)}
            style={{
              width: `${totals.corrections > 0 ? Math.min((totals.errors / totals.corrections) * 100, 100) : 0}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {totals.corrections > 0
            ? `${Math.round((totals.errors / totals.corrections) * 100)}% de las correcciones`
            : "Sin correcciones en el período"}
        </p>
      </Kpi>

      <Kpi title="Tiempo hasta corregir">
        <KpiValue suffix={ttc.median_days == null ? undefined : "días"}>
          {ttc.median_days == null ? "—" : ttc.median_days.toLocaleString("es")}
        </KpiValue>
        <p className="text-xs text-muted-foreground">
          {ttc.avg_days == null
            ? "Sin correcciones en el período"
            : `Mediana · promedio ${ttc.avg_days.toLocaleString("es")} días`}
        </p>
      </Kpi>
    </div>
  );
}

function Kpi({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-4 xl:border-l xl:border-border/50 xl:first:border-l-0">
      <span className={microLabelCls}>{title}</span>
      {children}
    </div>
  );
}

function KpiValue({
  children,
  suffix,
}: {
  children: React.ReactNode;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-semibold tracking-tight tabular-nums">
        {children}
      </span>
      {suffix && (
        <span className="text-sm text-muted-foreground">{suffix}</span>
      )}
    </div>
  );
}

// ─── Tasa de error por módulo ────────────────────────────────────────────────

function ErrorRatePanel({ stats }: { stats: PlanificationAuditStats }) {
  const rows = (
    Object.entries(stats.error_rate) as [
      AuditModule,
      NonNullable<PlanificationAuditStats["error_rate"][AuditModule]>,
    ][]
  ).filter(([, rate]) => rate.created > 0);

  return (
    <section className={cn(panelCls, "flex flex-col gap-4")}>
      <PanelHeader
        title="Tasa de error por módulo"
        hint="Registros creados en el período que luego se corrigieron por error de captura"
      />

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map(([module, rate]) => (
            <li key={module} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{MODULE_META[module].label}</span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-medium">
                    {rate.rate == null
                      ? "—"
                      : `${rate.rate.toLocaleString("es")}%`}
                  </span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {rate.with_errors} de {rate.created}
                  </span>
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                aria-hidden
              >
                <div
                  className={cn("h-full rounded-full", errorFillCls)}
                  style={{ width: `${Math.min(rate.rate ?? 0, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Actividad: módulos y acciones ───────────────────────────────────────────

function ActivityPanel({ stats }: { stats: PlanificationAuditStats }) {
  const max = Math.max(1, ...stats.by_module.map((row) => row.operations));
  const actions = (
    Object.entries(stats.by_action) as [AuditAction, number][]
  ).sort((a, b) => b[1] - a[1]);

  return (
    <section className={cn(panelCls, "flex flex-col gap-4")}>
      <PanelHeader
        title="Actividad por módulo"
        hint="Operaciones y, de ellas, correcciones"
      />

      {stats.by_module.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3.5">
          {stats.by_module.map((row) => (
            <li key={row.module} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">
                  {MODULE_META[row.module].label}
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-medium">{row.operations}</span>
                  {row.corrections > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {row.corrections} correcciones
                    </span>
                  )}
                </span>
              </div>
              <div
                className="flex h-1.5 gap-0.5"
                style={{ width: `${(row.operations / max) * 100}%` }}
                aria-hidden
              >
                {row.corrections > 0 && (
                  <div
                    className={cn("h-full rounded-full", correctionFillCls)}
                    style={{ flexGrow: row.corrections }}
                  />
                )}
                {row.operations - row.corrections > 0 && (
                  <div
                    className="h-full rounded-full bg-muted-foreground/30"
                    style={{ flexGrow: row.operations - row.corrections }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
          {actions.map(([action, count]) => {
            const Icon = ACTION_META[action].icon;

            return (
              <span
                key={action}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-background/70 px-2 py-1 text-xs"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                {ACTION_META[action].label}
                <span className="font-semibold tabular-nums">{count}</span>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Tendencia ───────────────────────────────────────────────────────────────

function TrendPanel({
  stats,
  className,
}: {
  stats: PlanificationAuditStats;
  className?: string;
}) {
  const data = stats.monthly.map((row) => ({
    ...row,
    label: format(parseISO(`${row.month}-01`), "MMM yy", { locale: es }),
  }));

  return (
    <section className={cn(panelCls, "flex flex-col gap-4", className)}>
      <PanelHeader
        title="Correcciones por mes"
        hint="Los errores de captura son parte de las correcciones"
      >
        <Legend correctionsLabel="Correcciones" />
      </PanelHeader>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full"
        >
          <LineChart
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={11}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={28}
              fontSize={11}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="corrections"
              type="monotone"
              stroke="var(--color-corrections)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
            />
            <Line
              dataKey="errors"
              type="monotone"
              stroke="var(--color-errors)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </section>
  );
}

// ─── Motivos ─────────────────────────────────────────────────────────────────

function ReasonPanel({ stats }: { stats: PlanificationAuditStats }) {
  const max = Math.max(1, ...stats.by_reason.map((row) => row.count));
  const total = stats.by_reason.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className={cn(panelCls, "flex flex-col gap-4")}>
      <PanelHeader
        title="Por motivo"
        hint={`${total} ${total === 1 ? "corrección" : "correcciones"}`}
      />

      {stats.by_reason.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3.5">
          {stats.by_reason.map((row) => (
            <li key={row.reason} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">
                  {EDIT_REASON_LABELS[row.reason]}
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-medium">{row.count}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {Math.round((row.count / Math.max(total, 1)) * 100)}%
                  </span>
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                aria-hidden
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    row.reason === "ERROR_CAPTURA"
                      ? errorFillCls
                      : row.reason === "SIN_CLASIFICAR"
                        ? "bg-muted-foreground/40"
                        : correctionFillCls,
                  )}
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Listas con barra (campos, autores) ──────────────────────────────────────

interface MeterRow {
  key: string;
  label: string;
  sublabel?: string;
  critical?: boolean;
  total: number;
  errors: number;
}

function MeterPanel({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: MeterRow[];
}) {
  const max = Math.max(1, ...rows.map((row) => row.total));

  return (
    <section className={cn(panelCls, "flex flex-col gap-4")}>
      <PanelHeader title={title} hint={hint}>
        <Legend />
      </PanelHeader>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map((row) => {
            const others = row.total - row.errors;

            return (
              <li key={row.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate">{row.label}</span>
                    {row.critical && (
                      <AlertTriangle
                        className="size-3 shrink-0 text-muted-foreground"
                        aria-label="Campo crítico"
                      />
                    )}
                    {row.sublabel && (
                      <span className="truncate text-xs text-muted-foreground/70">
                        {row.sublabel}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    <span className="font-medium">{row.total}</span>
                    {row.errors > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {row.errors} {row.errors === 1 ? "error" : "errores"}
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className="flex h-1.5 gap-0.5"
                  style={{ width: `${(row.total / max) * 100}%` }}
                  aria-hidden
                >
                  {row.errors > 0 && (
                    <div
                      className={cn("h-full rounded-full", errorFillCls)}
                      style={{ flexGrow: row.errors }}
                    />
                  )}
                  {others > 0 && (
                    <div
                      className={cn("h-full rounded-full", correctionFillCls)}
                      style={{ flexGrow: others }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ─── Piezas comunes ──────────────────────────────────────────────────────────

function PanelHeader({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Legend({
  correctionsLabel = "Otras correcciones",
}: {
  correctionsLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("size-2 rounded-full", correctionFillCls)} />
        {correctionsLabel}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("size-2 rounded-full", errorFillCls)} />
        Error de captura
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-1.5 text-muted-foreground/60 select-none">
      <BarChart3 className="size-4 opacity-60" />
      <span className="text-[11px] tracking-widest uppercase">
        Sin datos en el período
      </span>
    </div>
  );
}

function EmptyPanel({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(panelCls, "flex items-center justify-center", className)}
    >
      <span className="text-[11px] tracking-widest text-muted-foreground/60 uppercase select-none">
        {message}
      </span>
    </div>
  );
}
