"use client";

import { Check, X } from "lucide-react";
import type { CSSProperties } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetRequisitionCycle } from "@/hooks/mantenimiento/compras/useGetRequisitionCycle";
import { useNow } from "@/hooks/useNow";
import { formatInstant } from "@/lib/date";
import {
  HOLDING_LABELS,
  compactDuration,
  formatDuration,
  liveSeconds,
} from "@/lib/purchases/cycle";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  RequisitionCycleJourneyStage,
  RequisitionCycleLine,
} from "@/types/purchase";

const STEP_MS = 90;

interface Props {
  /** Solicitud a la que pertenece la línea. */
  requisitionId?: number;
  /** Id de la línea (el `id` de la fila de `batch_articles` / `general_articles`). */
  lineId?: number | null;
  kind: "article" | "general";
  /**
   * Para tarjetas que ya ponen su propia franja de pie (como la de
   * "Justificación"): sin franja propia, con el rótulo "Recorrido" a la
   * izquierda y los tramos centrados. En ancho (800 px o más) van en una fila;
   * por debajo, en columnas iguales con el nodo arriba y el texto debajo, como
   * el ciclo de la solicitud, para que nada se parta ni deje una línea colgando.
   * Sin esto, los tramos van en línea sobre su propia franja gris.
   */
  bare?: boolean;
  className?: string;
}

/**
 * Cuánto estuvo un artículo en cada tramo de su ciclo de compra —tránsito,
 * recepción y cada paso de Incoming— hasta quedar almacenado. Es el ciclo de la
 * solicitud en miniatura: un nodo por tramo, unidos por una línea. Se apoya en
 * la misma consulta que esa barra (misma clave de caché), así que no agrega
 * ninguna petición.
 *
 * No pinta nada mientras el artículo no existe (la orden aún no se paga) o la
 * consulta no llegó: es información de apoyo, no debe dejar la tarjeta vacía.
 */
export default function ArticleJourney({
  requisitionId,
  lineId,
  kind,
  bare,
  className,
}: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data, dataUpdatedAt } = useGetRequisitionCycle(
    requisitionId,
    selectedCompany?.slug,
  );

  // Una línea puede traer más de un artículo si una cotización complementaria
  // volvió a comprar.
  const lines = (data?.lines ?? []).filter(
    (line) =>
      line.kind === kind &&
      line.requisition_line_id === lineId &&
      line.journey.stages.length > 0,
  );

  if (lines.length === 0) return null;

  return (
    <div
      className={cn(bare ? "@container space-y-3" : "space-y-1.5", className)}
    >
      {lines.map((line, index) => (
        <Journey
          key={line.article_id ?? `${line.requisition_line_id}-${index}`}
          line={line}
          fetchedAt={dataUpdatedAt}
          bare={!!bare}
          label={
            lines.length > 1
              ? `Compra ${index + 1}`
              : bare
                ? "Recorrido"
                : undefined
          }
        />
      ))}
    </div>
  );
}

type NodeTone = "done" | "running" | "stored" | "rejected";

function Journey({
  line,
  fetchedAt,
  bare,
  label,
}: {
  line: RequisitionCycleLine;
  fetchedAt: number;
  bare: boolean;
  label?: string;
}) {
  const timeZone = useCompanyTimezone();
  // Cada 30 s basta: la unidad más fina que se muestra es el minuto.
  const now = useNow(30_000);
  const sinceFetchMs = now.getTime() - fetchedAt;
  const { stages, stored, stored_at } = line.journey;

  const outcome =
    line.status === "REJECTED"
      ? { tone: "rejected" as const, text: "Rechazado por almacén", date: null }
      : stored
        ? {
            tone: "stored" as const,
            text: line.status === "DELIVERED" ? "Entregado" : "Almacenado",
            date: stored_at ? formatInstant(stored_at, timeZone, "dd MMM") : null,
          }
        : null;

  return (
    <div
      className={cn(
        bare
          ? "@min-[800px]:grid @min-[800px]:grid-cols-[1fr_auto_minmax(0,1fr)] @min-[800px]:items-center"
          : "flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg bg-muted/40 px-2.5 py-1.5",
      )}
    >
      {label && (
        <span
          className={cn(
            "text-xs text-muted-foreground",
            bare ? "mb-2.5 block @min-[800px]:mb-0" : "mr-1",
          )}
        >
          {label}
        </span>
      )}

      <ol
        className={cn(
          bare
            ? "grid auto-cols-fr grid-flow-col @min-[800px]:flex @min-[800px]:flex-wrap @min-[800px]:items-center @min-[800px]:justify-center @min-[800px]:gap-x-1.5 @min-[800px]:gap-y-1"
            : "flex flex-wrap items-center gap-x-1.5 gap-y-1",
        )}
      >
        {stages.map((stage, index) => (
          <li
            key={stage.key}
            className={cn(
              "flex items-center",
              bare && "relative justify-center @min-[800px]:justify-start",
            )}
          >
            <StageStep
              stage={stage}
              index={index}
              bare={bare}
              sinceFetchMs={sinceFetchMs}
              timeZone={timeZone}
            />
            {(index < stages.length - 1 || outcome) && (
              <Connector index={index} bare={bare} />
            )}
          </li>
        ))}

        {outcome && (
          <li
            className={cn(
              "flex items-center",
              bare && "justify-center @min-[800px]:justify-start",
            )}
          >
            <span
              style={{ animationDelay: `${stages.length * STEP_MS}ms` }}
              className={cn(
                "flex items-center gap-1.5 motion-safe:animate-cycle-node",
                bare && STEP_LAYOUT,
              )}
            >
              <Node tone={outcome.tone} />
              <span
                className={cn(
                  "flex items-baseline gap-1.5 text-xs font-medium",
                  bare && TEXT_LAYOUT,
                  outcome.tone === "rejected"
                    ? "text-red-700 dark:text-red-300"
                    : "text-emerald-700 dark:text-emerald-300",
                )}
              >
                <span>{outcome.text}</span>
                {outcome.date && (
                  <span className="font-normal tabular-nums">
                    {bare ? (
                      <>
                        <span aria-hidden className="hidden @min-[800px]:inline">
                          ·{" "}
                        </span>
                        {outcome.date}
                      </>
                    ) : (
                      `· ${outcome.date}`
                    )}
                  </span>
                )}
              </span>
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}

/** Nodo arriba y texto debajo en estrecho; en una fila desde 800 px. */
const STEP_LAYOUT =
  "flex-col gap-1 text-center @min-[800px]:flex-row @min-[800px]:gap-1.5 @min-[800px]:text-left";

/** Etiqueta sobre su cifra en estrecho; una al lado de la otra desde 800 px. */
const TEXT_LAYOUT =
  "flex-col items-center gap-0 @min-[800px]:flex-row @min-[800px]:items-baseline @min-[800px]:gap-1.5";

/**
 * Tramo hacia el siguiente nodo. Se dibuja como un relleno que crece con
 * retardo escalonado, igual que la barra del ciclo, así la línea avanza de un
 * tramo a otro al cargar. En columnas va de borde a borde de los dos nodos; en
 * fila es un trazo corto entre un tramo y el siguiente.
 */
function Connector({ index, bare }: { index: number; bare: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-0.5 shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
        bare
          ? "absolute top-2 left-[calc(50%+0.8rem)] w-[calc(100%-1.6rem)] @min-[800px]:static @min-[800px]:ml-1.5 @min-[800px]:w-5"
          : "ml-1.5 w-5",
      )}
    >
      <span
        style={{ animationDelay: `${index * STEP_MS + 120}ms` }}
        className="block h-full origin-left bg-primary motion-safe:animate-cycle-x"
      />
    </span>
  );
}

const NODE: Record<NodeTone, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  running: "border-2 border-primary bg-background",
  stored: "border-emerald-600 bg-emerald-600 text-white",
  rejected: "border-red-600 bg-red-600 text-white",
};

function Node({ tone }: { tone: NodeTone }) {
  return (
    <span className="relative grid size-4.5 shrink-0 place-items-center">
      {tone === "running" && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-cycle-pulse"
        />
      )}
      <span
        className={cn(
          "relative grid size-4.5 place-items-center rounded-full border",
          NODE[tone],
        )}
      >
        {tone === "running" && (
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
        )}
        {(tone === "done" || tone === "stored") && (
          <Check aria-hidden className="size-3" />
        )}
        {tone === "rejected" && <X aria-hidden className="size-3" />}
      </span>
    </span>
  );
}

function StageStep({
  stage,
  index,
  bare,
  sinceFetchMs,
  timeZone,
}: {
  stage: RequisitionCycleJourneyStage;
  index: number;
  bare: boolean;
  sinceFetchMs: number;
  timeZone: string;
}) {
  const seconds = stage.running
    ? liveSeconds(stage.seconds, sinceFetchMs)
    : stage.seconds;

  // Incoming siempre se puede abrir: en qué parte del ciclo estuvo (inspección,
  // revisión, cuarentena…) es justo lo que importa. En los demás tramos los
  // pasos solo dicen algo si se volvió al estado.
  const hasDetail =
    stage.key === "INCOMING" || stage.steps.length > 1 || stage.visits > 1;

  // Si el artículo está ahora en un paso concreto de Incoming, se dice sin
  // tener que abrir nada.
  const lastStep = stage.steps[stage.steps.length - 1];
  const currentStep =
    stage.running && stage.key === "INCOMING" && lastStep?.status !== "INCOMING"
      ? (HOLDING_LABELS[lastStep?.status ?? ""] ?? null)
      : null;

  const delay: CSSProperties = { animationDelay: `${index * STEP_MS}ms` };

  const content = (
    <span
      style={delay}
      className={cn(
        "flex items-center gap-1.5 motion-safe:animate-cycle-node",
        bare && STEP_LAYOUT,
      )}
    >
      <Node tone={stage.running ? "running" : "done"} />
      <span
        className={cn("flex items-baseline gap-1.5 text-xs", bare && TEXT_LAYOUT)}
      >
        <span
          className={
            stage.running
              ? "font-semibold text-foreground"
              : "font-medium text-slate-700 dark:text-slate-300"
          }
        >
          {stage.label}
          {currentStep && (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {currentStep.toLowerCase()}
            </span>
          )}
        </span>
        {seconds !== null && (
          <span
            className={cn(
              "tabular-nums",
              stage.running
                ? "font-semibold text-primary"
                : "text-muted-foreground",
            )}
          >
            {stage.running ? "lleva " : ""}
            {compactDuration(seconds)}
          </span>
        )}
      </span>
    </span>
  );

  if (!hasDetail) return content;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Ver el detalle de ${stage.label}`}
          className="touch-manipulation rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {content}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="border-b bg-muted/30 px-3 py-2">
          <p className="text-[13px] font-semibold text-foreground/80">
            {stage.label}
            {seconds !== null && (
              <span className="ml-2 font-normal text-muted-foreground tabular-nums">
                {formatDuration(seconds)}
              </span>
            )}
          </p>
        </div>
        <ul className="divide-y divide-border/60 px-3">
          {stage.steps.map((step, stepIndex) => {
            const stepSeconds =
              step.until === null
                ? liveSeconds(step.seconds, sinceFetchMs)
                : step.seconds;

            return (
              <li
                key={`${step.status}-${step.from}-${stepIndex}`}
                className="py-1.5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {HOLDING_LABELS[step.status] ?? step.status}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {step.until === null && "lleva "}
                    {stepSeconds === null ? "—" : formatDuration(stepSeconds)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatInstant(step.from, timeZone, "dd MMM HH:mm")}
                  {step.until &&
                    ` → ${formatInstant(step.until, timeZone, "dd MMM HH:mm")}`}
                </p>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
