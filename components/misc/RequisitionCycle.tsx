"use client";

import { Check, ChevronDown, Minus, Pause, RefreshCw, X } from "lucide-react";
import { useId, useState, type CSSProperties } from "react";

import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetRequisitionCycle } from "@/hooks/mantenimiento/compras/useGetRequisitionCycle";
import { useNow } from "@/hooks/useNow";
import { formatInstant } from "@/lib/date";
import {
  HOLDING_LABELS,
  compactDuration,
  formatDuration,
  holdingEntries,
  isRunning,
  liveSeconds,
} from "@/lib/purchases/cycle";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  RequisitionCycle,
  RequisitionCycleStage,
  RequisitionCycleStageState,
} from "@/types/purchase";

/*
 * Las etapas se acomodan en una sola fila desde 700 px de ancho interno
 * (`@min-[700px]:`): con diez etapas a 70 px cabe la palabra más larga
 * ("Recepción", unos 64 px a 12 px de letra) sin partirla; las etiquetas de dos
 * palabras ("En tránsito", "En almacén") ya parten en dos líneas. Por debajo se
 * apilan en vertical. Si se cambia este valor hay que cambiarlo también en el
 * punto de partición de RequisitionOverview, que lo da por supuesto. Se mide sobre
 * el contenedor y no sobre la ventana: el mismo componente vive en páginas de
 * distinto ancho y con o sin menú lateral. Las clases van literales en cada
 * sitio porque Tailwind no ve las que se arman por partes.
 */

const STEP_MS = 120;

/**
 * Clases completas y estáticas: Tailwind no ve las que se arman por partes.
 * El nodo siempre es un círculo de 32 px; lo que cambia es su relleno.
 */
const NODE: Record<RequisitionCycleStageState, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  current: "border-2 border-primary bg-background text-primary",
  partial: "border-primary/50 bg-primary/10 text-primary",
  pending: "border-slate-300 bg-background dark:border-slate-600",
  skipped:
    "border-dashed border-slate-300 bg-background text-slate-400 dark:border-slate-600",
  halted:
    "border-2 border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rejected: "border-red-600 bg-red-600 text-white",
};

const NODE_COMPLETED = "border-emerald-600 bg-emerald-600 text-white";

const STATE_TEXT: Record<RequisitionCycleStageState, string> = {
  done: "superada",
  current: "etapa actual",
  partial: "en curso, con parte de los artículos",
  pending: "pendiente",
  skipped: "omitida",
  halted: "donde se detuvo",
  rejected: "rechazada",
};

const STATE_TONE: Record<RequisitionCycleStageState, TagTone> = {
  done: "blue",
  current: "blue",
  partial: "sky",
  pending: "slate",
  skipped: "slate",
  halted: "amber",
  rejected: "rose",
};

const STATE_TAG: Record<RequisitionCycleStageState, string> = {
  done: "Superada",
  current: "Etapa actual",
  partial: "En curso",
  pending: "Pendiente",
  skipped: "Omitida",
  halted: "Se detuvo aquí",
  rejected: "Rechazada",
};

interface Props {
  requisitionId?: number;
  /**
   * `section` es la sección de las fichas de compras (misma superficie y misma
   * cabecera de título con línea que "Justificación de la solicitud"); `card` es
   * el bloque de la ficha de almacén/solicitante, que conserva el estilo de
   * tarjeta de esa pantalla.
   */
  variant: "section" | "card";
  className?: string;
}

export default function RequisitionCycle({
  requisitionId,
  variant,
  className,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data, isLoading, isError, refetch, dataUpdatedAt } =
    useGetRequisitionCycle(requisitionId, selectedCompany?.slug);

  if (isLoading) {
    return (
      <Shell variant={variant} className={className}>
        <div
          role="status"
          aria-label="Cargando el ciclo de la solicitud"
          className="space-y-3"
        >
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell variant={variant} className={className}>
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <p className="text-sm text-muted-foreground">
            No se pudo cargar el ciclo de la solicitud.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 size-3.5" />
            Reintentar
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <LoadedCycle
      cycle={data}
      fetchedAt={dataUpdatedAt}
      variant={variant}
      className={className}
    />
  );
}

function LoadedCycle({
  cycle,
  fetchedAt,
  variant,
  className,
}: {
  cycle: RequisitionCycle;
  fetchedAt: number;
  variant: "section" | "card";
  className?: string;
}) {
  const timeZone = useCompanyTimezone();
  // Cada 30 s basta: la unidad más fina que se muestra es el minuto.
  const now = useNow(30_000);
  const sinceFetchMs = now.getTime() - fetchedAt;

  const running = !cycle.completed && !cycle.rejected;
  const elapsed =
    cycle.elapsed_seconds === null
      ? null
      : running
        ? liveSeconds(cycle.elapsed_seconds, sinceFetchMs)
        : cycle.elapsed_seconds;

  const currentStage = cycle.stages.find(
    (stage) => stage.key === cycle.current_stage,
  );

  const listId = useId();
  const [expanded, setExpanded] = useState(false);

  const summary = (
    <Summary
      cycle={cycle}
      elapsed={elapsed}
      variant={variant}
    />
  );

  return (
    <Shell variant={variant} className={className} action={summary}>
      <div className="@container">
        <CompactSummary
          cycle={cycle}
          stage={currentStage}
          sinceFetchMs={sinceFetchMs}
          timeZone={timeZone}
          expanded={expanded}
          listId={listId}
          onToggle={() => setExpanded((value) => !value)}
        />

        <ol
          id={listId}
          aria-label="Etapas de la solicitud"
          className={cn(
            "mt-4 flex-col @min-[700px]:mt-0 @min-[700px]:grid @min-[700px]:auto-cols-fr @min-[700px]:grid-flow-col",
            expanded ? "flex motion-safe:animate-reveal" : "hidden",
          )}
        >
          {cycle.stages.map((stage, index) => (
            <StageItem
              key={stage.key}
              stage={stage}
              index={index}
              next={cycle.stages[index + 1]}
              completed={cycle.completed && index === cycle.stages.length - 1}
              hideDuration={repeatsTotal(stage, cycle)}
              sinceFetchMs={sinceFetchMs}
              timeZone={timeZone}
            />
          ))}
        </ol>
      </div>
    </Shell>
  );
}

/**
 * Cada cifra se dice una sola vez. La cabecera da lo que lleva la solicitud en
 * total; la etapa vigente solo repite esa cifra cuando es toda su vida (la
 * primera, aún abierta), y en ese caso no la vuelve a decir.
 */
const repeatsTotal = (
  stage: RequisitionCycleStage | undefined,
  cycle: RequisitionCycle,
): boolean =>
  stage?.state === "current" &&
  stage.seconds !== null &&
  cycle.elapsed_seconds !== null &&
  Math.abs(stage.seconds - cycle.elapsed_seconds) < 60;

/**
 * La fecha de la primera etapa es la "Fecha de solicitud" de la información que
 * va al lado: no se repite.
 */
const repeatsRequestDate = (stage: RequisitionCycleStage | undefined): boolean =>
  stage?.key === "CREATED";

const SEGMENT: Partial<Record<RequisitionCycleStageState, string>> = {
  done: "bg-primary",
  current: "bg-primary",
  partial: "bg-primary/50",
  skipped: "bg-primary/25",
  halted: "bg-amber-500",
  rejected: "bg-red-500",
};

/**
 * El ciclo en una línea, para cuando no caben las diez etapas en fila: un
 * tramo por etapa que se dibuja de izquierda a derecha, el de la etapa vigente
 * latiendo. Es el mismo avance que los nodos, sin sus rótulos.
 */
function SegmentBar({ stages }: { stages: RequisitionCycleStage[] }) {
  return (
    <div role="img" aria-label="Avance del ciclo" className="flex gap-1">
      {stages.map((stage, index) => (
        <span
          key={stage.key}
          className={cn(
            "relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
            stage.state === "current" && "motion-safe:animate-pulse",
          )}
        >
          {SEGMENT[stage.state] && (
            <span
              style={{ animationDelay: `${index * 70}ms` }}
              className={cn(
                "absolute inset-0 origin-left rounded-full motion-safe:animate-cycle-x",
                SEGMENT[stage.state],
              )}
            />
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Lo esencial del ciclo para pantallas estrechas (móvil y tableta vertical):
 * la barra, la etapa en la que está con cuánto lleva en ella, y un botón que
 * despliega la lista completa. Desde 700 px de ancho no existe: ahí caben los
 * nodos con todos sus rótulos.
 */
function CompactSummary({
  cycle,
  stage,
  sinceFetchMs,
  timeZone,
  expanded,
  listId,
  onToggle,
}: {
  cycle: RequisitionCycle;
  stage?: RequisitionCycleStage;
  sinceFetchMs: number;
  timeZone: string;
  expanded: boolean;
  listId: string;
  onToggle: () => void;
}) {
  // Cerrado (completo o rechazado), la insignia de la cabecera ya lo dice: aquí
  // solo queda la barra.
  const closed = cycle.completed || cycle.rejected;
  const running = !!stage && isRunning(stage);
  const seconds = !stage
    ? null
    : running
      ? liveSeconds(stage.seconds, sinceFetchMs)
      : stage.seconds;

  const duration =
    seconds !== null && !repeatsTotal(stage, cycle)
      ? compactDuration(seconds)
      : null;
  const showSince = !!stage?.entered_at && !repeatsRequestDate(stage);

  return (
    <div className="@min-[700px]:hidden">
      <SegmentBar stages={cycle.stages} />

      {!closed && (
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Etapa actual</p>
            <p className="text-base leading-tight font-semibold wrap-anywhere">
              {stage?.label ?? "—"}
            </p>
            {showSince && stage?.entered_at && (
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                desde el {formatInstant(stage.entered_at, timeZone, "dd MMM")}
              </p>
            )}
          </div>

          {duration && (
            <p className="shrink-0 text-right">
              <span className="block text-lg leading-tight font-semibold text-primary tabular-nums">
                {duration}
              </span>
              <span className="text-xs text-muted-foreground">
                en esta etapa
              </span>
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={onToggle}
        className="mt-3 flex w-full touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors active:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:border-slate-700/60 dark:text-slate-300"
      >
        {expanded ? "Ocultar las etapas" : "Ver las etapas"}
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
        />
      </button>
    </div>
  );
}

/** Contenedor de cada piel; las etapas dentro son idénticas en ambas. */
function Shell({
  variant,
  className,
  action,
  children,
}: {
  variant: "section" | "card";
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (variant === "section") {
    return (
      <section
        className={cn(
          "flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 dark:border-slate-700/60 dark:bg-slate-900/60",
          className,
        )}
      >
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 select-none">
          <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
            Ciclo de la solicitud
          </span>
          <div className="h-px min-w-6 flex-1 bg-border/50" />
          {action}
        </div>
        <div className="my-auto">{children}</div>
      </section>
    );
  }

  return (
    <section className={cn("rounded-xl border bg-secondary/40 p-3", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="text-[13px] font-semibold text-foreground/80">
          Ciclo de la solicitud
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Summary({
  cycle,
  elapsed,
  variant,
}: {
  cycle: RequisitionCycle;
  elapsed: number | null;
  variant: "section" | "card";
}) {
  const duration = elapsed === null ? null : formatDuration(elapsed);

  const [tone, text]: [TagTone, string] = cycle.completed
    ? ["emerald", `Completada en ${duration ?? "—"}`]
    : cycle.rejected
      ? ["rose", `No aprobada tras ${duration ?? "—"}`]
      : ["blue", `Lleva ${duration ?? "—"}`];

  // Mientras corre, la etapa y el avance ya los dicen los nodos; solo el cierre
  // aporta algo que ellos no dicen.
  const detail = cycle.completed ? "El material ya está en el almacén" : null;

  if (variant === "card") {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {detail && (
          <span className="text-xs text-muted-foreground">{detail}</span>
        )}
        <Badge variant="outline" className="text-xs">
          {text}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {detail && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {detail}
        </span>
      )}
      <TagBadge tone={tone}>{text}</TagBadge>
    </div>
  );
}

function StageItem({
  stage,
  index,
  next,
  completed,
  hideDuration,
  sinceFetchMs,
  timeZone,
}: {
  stage: RequisitionCycleStage;
  index: number;
  next?: RequisitionCycleStage;
  completed: boolean;
  /** La cifra de la etapa ya la dice la cabecera. */
  hideDuration: boolean;
  sinceFetchMs: number;
  timeZone: string;
}) {
  const running = isRunning(stage);
  const seconds = running
    ? liveSeconds(stage.seconds, sinceFetchMs)
    : stage.seconds;

  const delay: CSSProperties = { animationDelay: `${index * STEP_MS}ms` };
  const interactive = stage.state !== "pending" && stage.state !== "skipped";

  const content = (
    <>
      <Node stage={stage} completed={completed} style={delay} />

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 @min-[700px]:block @min-[700px]:flex-none @min-[700px]:text-center">
        <p
          className={cn(
            "text-sm leading-tight wrap-anywhere @min-[700px]:text-xs",
            stage.state === "pending" || stage.state === "skipped"
              ? "text-slate-500 dark:text-slate-400"
              : "font-semibold text-foreground",
          )}
        >
          {stage.label}
          <span className="sr-only">, {STATE_TEXT[stage.state]}</span>
        </p>

        <Caption
          stage={stage}
          seconds={seconds}
          running={running}
          hideDuration={hideDuration}
          timeZone={timeZone}
        />
      </div>
    </>
  );

  const layout =
    "flex w-full items-center gap-3 text-left @min-[700px]:flex-col @min-[700px]:gap-2 @min-[700px]:text-center";

  return (
    <li className="relative pb-4 last:pb-0 @min-[700px]:pb-0">
      {next && <Connector next={next} index={index} />}

      {interactive ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                layout,
                "touch-manipulation rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:animate-cycle-node",
              )}
              style={delay}
            >
              {content}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="center">
            <StageDetail
              stage={stage}
              seconds={seconds}
              running={running}
              timeZone={timeZone}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className={cn(layout, "motion-safe:animate-cycle-node")} style={delay}>
          {content}
        </div>
      )}
    </li>
  );
}

function Node({
  stage,
  completed,
  style,
}: {
  stage: RequisitionCycleStage;
  completed: boolean;
  style: CSSProperties;
}) {
  const Icon =
    stage.state === "done"
      ? Check
      : stage.state === "skipped"
        ? Minus
        : stage.state === "halted"
          ? Pause
          : stage.state === "rejected"
            ? X
            : null;

  const dot = stage.state === "current" || stage.state === "partial";

  return (
    <span className="relative grid size-6 shrink-0 place-items-center @min-[700px]:size-8">
      {stage.state === "current" && (
        <span
          aria-hidden
          style={style}
          className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-cycle-pulse"
        />
      )}
      <span
        className={cn(
          "relative grid size-6 place-items-center rounded-full border @min-[700px]:size-8",
          completed && stage.state === "done" ? NODE_COMPLETED : NODE[stage.state],
        )}
      >
        {Icon && (
          <Icon aria-hidden className="size-3.5 @min-[700px]:size-4" />
        )}
        {dot && (
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full @min-[700px]:size-2.5",
              stage.state === "current" ? "bg-primary" : "bg-primary/60",
            )}
          />
        )}
      </span>
    </span>
  );
}

/**
 * Tramo hacia la etapa siguiente, de borde a borde de los dos nodos. Se dibuja
 * como un relleno que crece con retardo escalonado, así la línea avanza de una
 * etapa a otra al cargar. En vertical (móvil) corre hacia abajo.
 */
function Connector({
  next,
  index,
}: {
  next: RequisitionCycleStage;
  index: number;
}) {
  const reached = next.state !== "pending";

  const fill =
    next.state === "rejected"
      ? "bg-red-500"
      : next.state === "skipped"
        ? "bg-primary/35"
        : "bg-primary";

  return (
    <span
      aria-hidden
      className="absolute top-6 bottom-0 left-3 w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-slate-200 @min-[700px]:top-4 @min-[700px]:bottom-auto @min-[700px]:left-[calc(50%+1.25rem)] @min-[700px]:h-0.5 @min-[700px]:w-[calc(100%-2.5rem)] @min-[700px]:translate-x-0 @min-[700px]:-translate-y-1/2 dark:bg-slate-700"
    >
      {reached && (
        <span
          style={{ animationDelay: `${index * STEP_MS + 180}ms` }}
          className={cn(
            "absolute inset-0 origin-top motion-safe:animate-cycle-y @min-[700px]:origin-left @min-[700px]:motion-safe:animate-cycle-x",
            fill,
          )}
        />
      )}
    </span>
  );
}

function Caption({
  stage,
  seconds,
  running,
  hideDuration,
  timeZone,
}: {
  stage: RequisitionCycleStage;
  seconds: number | null;
  running: boolean;
  hideDuration: boolean;
  timeZone: string;
}) {
  // Lo que aún no ocurre no necesita decir nada: el guion solo era ruido.
  if (stage.state === "pending") return null;

  if (stage.state === "skipped") {
    return (
      <p className="text-xs text-muted-foreground @min-[700px]:mt-0.5">
        Omitida
      </p>
    );
  }

  const date =
    stage.entered_at && !repeatsRequestDate(stage)
      ? `${stage.approximate ? "≈ " : ""}${formatInstant(stage.entered_at, timeZone, "dd MMM")}`
      : null;

  const main =
    stage.state === "rejected" || hideDuration
      ? null
      : seconds !== null
        ? compactDuration(seconds)
        : stage.entered_at
          ? null
          : "Sin registro";

  const count =
    stage.total !== null &&
    stage.reached !== null &&
    stage.total > 1 &&
    (stage.state === "current" || stage.state === "partial")
      ? `${stage.reached} de ${stage.total}`
      : null;

  if (!main && !count && !date) return null;

  return (
    <div className="flex items-baseline gap-x-2 @min-[700px]:mt-0.5 @min-[700px]:block @min-[700px]:space-y-px">
      {main && (
        <p
          className={cn(
            "text-xs tabular-nums",
            running
              ? "font-semibold text-primary"
              : "font-medium text-slate-700 dark:text-slate-300",
          )}
        >
          {main}
        </p>
      )}
      {count && (
        <p className="text-xs text-slate-600 tabular-nums dark:text-slate-300">
          {count}
        </p>
      )}
      {date && (
        <p className="text-xs text-muted-foreground tabular-nums">{date}</p>
      )}
    </div>
  );
}

function StageDetail({
  stage,
  seconds,
  running,
  timeZone,
}: {
  stage: RequisitionCycleStage;
  seconds: number | null;
  running: boolean;
  timeZone: string;
}) {
  const moment = (value: string | null) =>
    value ? formatInstant(value, timeZone, "dd MMM yyyy, HH:mm") : null;

  const rows: [string, string | null][] = [
    ["Entró", moment(stage.entered_at)],
    ["Salió", running ? null : moment(stage.left_at)],
    [
      running ? "Lleva" : "Permaneció",
      seconds === null ? null : formatDuration(seconds),
    ],
    [
      "Desde la creación",
      stage.since_start_seconds === null || stage.since_start_seconds === 0
        ? null
        : formatDuration(stage.since_start_seconds),
    ],
    ["Registró", stage.by],
    [
      "Veces en esta etapa",
      stage.visits > 1 ? `${stage.visits} (volvió atrás)` : null,
    ],
    [
      "Artículos",
      stage.total !== null && stage.reached !== null && stage.total > 0
        ? `${stage.reached} de ${stage.total}`
        : null,
    ],
  ];

  const holding = holdingEntries(stage);
  const visible = rows.filter(([, value]) => value);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
        <p className="text-[13px] font-semibold text-foreground/80">
          {stage.label}
        </p>
        <TagBadge tone={STATE_TONE[stage.state]}>
          {STATE_TAG[stage.state]}
        </TagBadge>
      </div>

      <div className="space-y-3 p-3">
        {visible.length > 0 ? (
          <dl className="divide-y divide-border/60">
            {visible.map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
              >
                <dt className="text-[13px] text-muted-foreground">{label}</dt>
                <dd className="text-right text-sm font-medium tabular-nums wrap-anywhere">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Esta etapa no dejó registro de fecha.
          </p>
        )}

        {holding.length > 0 && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2">
            <p className="mb-1 text-[13px] font-semibold text-foreground/80">
              Ahora mismo
            </p>
            <ul className="space-y-0.5">
              {holding.map(([status, count]) => (
                <li
                  key={status}
                  className="flex justify-between gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <span>{HOLDING_LABELS[status] ?? status}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stage.approximate && (
          <p className="text-xs text-muted-foreground">
            Fecha aproximada: se tomó de la última modificación de la solicitud,
            porque este cambio de estado no quedó registrado.
          </p>
        )}

        {stage.optional && (
          <p className="text-xs text-muted-foreground">
            El pago no es obligatorio en artículos generales.
          </p>
        )}
      </div>
    </div>
  );
}
