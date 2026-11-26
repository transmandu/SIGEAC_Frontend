"use client";

import { useMemo } from "react";
import { Route } from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import type { TagTone } from "@/components/misc/TagBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCalendarDate } from "@/lib/date";
import {
  changedLanes,
  type LaneKey,
  type Segment,
  type Trajectory,
} from "@/lib/employee-history";
import { formatDayRange } from "@/lib/employee-lifecycle";
import { cn } from "@/lib/utils";

const LANE_LABEL: Record<LaneKey, string> = {
  period: "Periodo",
  job_title: "Cargo",
  department: "Departamento",
  location: "Sede",
};

// Cada valor distinto (cargo, departamento o sede) toma un tono, en orden de
// aparición: dos tramos con el mismo valor se reconocen a simple vista.
const PALETTE: TagTone[] = [
  "blue",
  "violet",
  "sky",
  "emerald",
  "amber",
  "rose",
  "orange",
  "green",
];

// Clases completas y estáticas: Tailwind no ve las que se arman por partes.
const SEGMENT: Record<TagTone, string> = {
  blue: "border-blue-500/30 bg-blue-500/15 text-blue-800 dark:text-blue-200",
  sky: "border-sky-500/30 bg-sky-500/15 text-sky-800 dark:text-sky-200",
  violet:
    "border-violet-500/30 bg-violet-500/15 text-violet-800 dark:text-violet-200",
  emerald:
    "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  green:
    "border-green-500/30 bg-green-500/15 text-green-800 dark:text-green-200",
  orange:
    "border-orange-500/30 bg-orange-500/15 text-orange-800 dark:text-orange-200",
  amber:
    "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  rose: "border-rose-500/30 bg-rose-500/15 text-rose-800 dark:text-rose-200",
  slate:
    "border-slate-500/30 bg-slate-500/15 text-slate-700 dark:text-slate-200",
};

const day = (value: string | null | undefined) =>
  formatCalendarDate(value, "date", "—");

/** Tono de cada tramo: por vigencia en el periodo, por valor en los demás carriles. */
const toneOf = (segment: Segment, order: Map<string, TagTone>): TagTone =>
  segment.lane === "period"
    ? segment.open
      ? "emerald"
      : "slate"
    : (order.get(segment.groupKey ?? "") ?? "slate");

/**
 * Trayectoria de un empleado sobre un eje de tiempo. Solo se dibuja cuando hay
 * algo que contar (varios periodos o algún cambio); y de cargo, departamento
 * y sede solo aparece el carril de lo que realmente cambió: lo demás va en una
 * línea de texto.
 */
export function EmployeeTrajectory({ trajectory }: { trajectory: Trajectory }) {
  const changed = changedLanes(trajectory);
  const lanes: LaneKey[] = ["period", ...changed];

  const unchanged = (["job_title", "department", "location"] as const)
    .filter((lane) => !changed.includes(lane))
    .map((lane) => trajectory.lanes[lane][0]?.label)
    .filter(Boolean);

  const tones = useMemo(() => {
    const byLane = new Map<LaneKey, Map<string, TagTone>>();

    for (const lane of lanes) {
      const order = new Map<string, TagTone>();

      for (const segment of trajectory.lanes[lane]) {
        if (segment.groupKey && !order.has(segment.groupKey)) {
          order.set(segment.groupKey, PALETTE[order.size % PALETTE.length]);
        }
      }
      byLane.set(lane, order);
    }

    return byLane;
    // `lanes` se deriva de `trajectory`: depender de este basta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trajectory]);

  // Solo los cambios de año marcan el eje; el inicio y el fin van en los bordes.
  const yearTicks = trajectory.ticks.filter(
    (tick) => tick.major && tick.left > 12 && tick.left < 88,
  );

  return (
    <PanelSection icon={Route} title="Trayectoria" compact>
      <div className="overflow-x-auto">
        <div className="grid min-w-64 grid-cols-1 gap-y-1 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-center sm:gap-x-3 sm:gap-y-1.5">
          <span aria-hidden className="hidden sm:block" />
          <div
            aria-hidden
            className="relative flex h-4 items-center justify-between text-xs tabular-nums text-muted-foreground"
          >
            <span>{day(trajectory.from)}</span>
            {yearTicks.map((tick) => (
              <span
                key={tick.label}
                className="absolute -translate-x-1/2 font-semibold text-foreground/70"
                style={{ left: `${tick.left}%` }}
              >
                {tick.label}
              </span>
            ))}
            <span>
              {trajectory.todayLeft !== null ? "Hoy" : day(trajectory.to)}
            </span>
          </div>

          {lanes.map((lane) => (
            <Lane
              key={lane}
              label={LANE_LABEL[lane]}
              segments={trajectory.lanes[lane]}
              yearTicks={yearTicks}
              toneOf={(segment) =>
                toneOf(segment, tones.get(lane) ?? new Map())
              }
            />
          ))}
        </div>
      </div>

      {unchanged.length > 0 && changed.length > 0 && (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Sin cambios: {unchanged.join(" · ")}
        </p>
      )}
    </PanelSection>
  );
}

function Lane({
  label,
  segments,
  yearTicks,
  toneOf,
}: {
  label: string;
  segments: Segment[];
  yearTicks: { left: number; label: string }[];
  toneOf: (segment: Segment) => TagTone;
}) {
  return (
    <>
      <span className="mt-1.5 text-[13px] text-muted-foreground sm:mt-0">
        {label}
      </span>

      <div className="relative h-7 rounded-md bg-muted/40">
        {yearTicks.map((tick) => (
          <span
            key={tick.label}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-border/70"
            style={{ left: `${tick.left}%` }}
          />
        ))}

        {segments.map((segment) => (
          <Tooltip key={segment.key}>
            <TooltipTrigger asChild>
              <div
                style={{
                  left: `${segment.left}%`,
                  width: `${segment.width}%`,
                }}
                className={cn(
                  "absolute inset-y-0.5 flex cursor-default items-center overflow-hidden rounded border px-2 text-xs font-medium",
                  segment.gap
                    ? "border-dashed border-slate-400/60 bg-transparent font-normal text-muted-foreground"
                    : SEGMENT[toneOf(segment)],
                )}
              >
                <span className="truncate">{segment.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="px-2 py-1 text-xs">
              <p className="font-medium">{segment.label}</p>
              <p className="tabular-nums opacity-80">
                {formatDayRange(segment.from, segment.to)}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </>
  );
}
