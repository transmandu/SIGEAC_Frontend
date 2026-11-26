"use client";

import { useMemo, useState } from "react";
import { History, Loader2, MapPin, Pencil } from "lucide-react";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import {
  CorrectAssignmentDialog,
  CorrectPeriodDialog,
} from "@/components/dialogs/general/EmployeeCorrectionDialogs";
import { EmployeeTrajectory } from "@/components/dialogs/general/EmployeeTrajectory";
import {
  PanelSection,
  PanelStaticLabel,
} from "@/components/forms/PanelSection";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetEmployeeHistory } from "@/hooks/ajustes/empleados/useGetEmployeeHistory";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { instantToCalendarDay } from "@/lib/date";
import {
  buildTrajectory,
  formatTenure,
  hasStory,
} from "@/lib/employee-history";
import {
  CHANGE_TYPE_META,
  END_TYPE_META,
  formatDayRange,
  START_TYPE_LABEL,
} from "@/lib/employee-lifecycle";
import { locationLabel } from "@/lib/locations";
import { fullName } from "@/lib/person-name";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";
import type {
  Employee,
  EmployeeAssignment,
  EmployeeHistoryPeriod,
} from "@/types";

// Cada fila trae su tramo de línea; el nodo se dibuja encima. La primera
// arranca en su nodo y la última termina en él.
const rowClass =
  "relative pl-8 before:absolute before:bottom-0 before:left-2 before:top-0 before:w-px before:-translate-x-1/2 before:bg-border first:before:top-2.5 last:before:bottom-auto last:before:h-2.5";

// Clases completas y estáticas: Tailwind no ve las que se arman por partes.
const DOT: Record<TagTone, string> = {
  blue: "bg-blue-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-400",
};

/** Lápiz de corrección: solo lo ve quien puede corregir el historial. */
function CorrectButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          className="-my-1 size-7 text-muted-foreground"
          onClick={onClick}
        >
          <Pencil className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function AssignmentRow({
  assignment,
  onCorrect,
}: {
  assignment: EmployeeAssignment;
  onCorrect?: () => void;
}) {
  const change = CHANGE_TYPE_META[assignment.change_type];
  const place = assignment.location ? locationLabel(assignment.location) : "";

  return (
    <li className={cn(rowClass, "pb-4 last:pb-0")}>
      <span
        aria-hidden
        className={cn(
          "absolute left-2 top-1.5 z-10 size-2.5 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-slate-900",
          DOT[change.tone],
        )}
      />

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-sm font-semibold text-slate-700 wrap-anywhere dark:text-slate-200">
          {assignment.job_title?.name ?? "Cargo eliminado"}
          <span className="font-normal text-muted-foreground"> · </span>
          {assignment.department?.name ?? "Departamento eliminado"}
        </p>
        <TagBadge tone={change.tone}>{change.label}</TagBadge>
        {onCorrect && (
          <CorrectButton label="Corregir asignación" onClick={onCorrect} />
        )}
      </div>

      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
        {place && (
          <>
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span>{place}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <span className="tabular-nums">
          {formatDayRange(assignment.started_at, assignment.ended_at)}
        </span>
      </p>

      {assignment.reason && (
        <p className="mt-1 text-[13px] text-slate-600 wrap-anywhere dark:text-slate-300">
          {assignment.reason}
        </p>
      )}

      {assignment.registered_by && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Registrado por {assignment.registered_by}
        </p>
      )}
    </li>
  );
}

function PeriodPanel({
  period,
  number,
  onCorrectPeriod,
  onCorrectAssignment,
}: {
  period: EmployeeHistoryPeriod;
  number: number;
  onCorrectPeriod?: () => void;
  onCorrectAssignment?: (
    assignment: EmployeeAssignment,
    first: boolean,
  ) => void;
}) {
  const open = period.ended_at === null;
  const end = period.end_type ? END_TYPE_META[period.end_type] : null;

  return (
    <PanelSection
      icon={History}
      title={
        <>
          {open ? "Periodo actual" : `Periodo ${number}`}
          <span className="font-normal text-muted-foreground">
            {" · "}
            {START_TYPE_LABEL[period.start_type]}
          </span>
        </>
      }
      hint={
        <span className="tabular-nums">
          {formatDayRange(period.started_at, period.ended_at)}
        </span>
      }
      action={
        <span className="flex items-center gap-1">
          {open ? (
            <TagBadge tone="emerald">Vigente</TagBadge>
          ) : end ? (
            <TagBadge tone={end.tone}>{end.label}</TagBadge>
          ) : null}
          {onCorrectPeriod && (
            <CorrectButton label="Corregir periodo" onClick={onCorrectPeriod} />
          )}
        </span>
      }
    >
      <ol className="list-none">
        {period.assignments
          .map((assignment, index) => ({ assignment, first: index === 0 }))
          .reverse()
          .map(({ assignment, first }) => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              onCorrect={
                onCorrectAssignment &&
                (() => onCorrectAssignment(assignment, first))
              }
            />
          ))}
      </ol>

      {period.end_reason && (
        <div className="mt-4 border-t pt-3 text-[13px]">
          <p className="text-slate-600 wrap-anywhere dark:text-slate-300">
            <span className="text-muted-foreground">Egreso: </span>
            {period.end_reason}
            {period.closed_by && (
              <span className="text-muted-foreground">
                {" "}
                — {period.closed_by}
              </span>
            )}
          </p>
        </div>
      )}
    </PanelSection>
  );
}

const plural = (count: number, one: string, other: string) =>
  `${count} ${count === 1 ? one : other}`;

/** Resumen en una línea, la trayectoria (solo si hay algo que contar) y el detalle por periodo. */
function HistoryContent({
  employee,
  periods,
  today,
}: {
  employee: Employee;
  periods: EmployeeHistoryPeriod[];
  today: string;
}) {
  const canCorrect = useIsSuperuser();
  const [correcting, setCorrecting] = useState<
    | { kind: "period"; periodId: number }
    | { kind: "assignment"; assignmentId: number; first: boolean }
    | null
  >(null);
  const trajectory = useMemo(
    () => buildTrajectory(periods, today),
    [periods, today],
  );

  const correctingPeriod =
    correcting?.kind === "period"
      ? periods.find((period) => period.id === correcting.periodId)
      : undefined;
  const correctingAssignment =
    correcting?.kind === "assignment"
      ? periods
          .flatMap((period) => period.assignments)
          .find((assignment) => assignment.id === correcting.assignmentId)
      : undefined;

  if (!trajectory) return null;

  const { stats } = trajectory;
  const showTrajectory = hasStory(trajectory);

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted-foreground">
        Antigüedad{" "}
        <span className="font-semibold text-foreground/80">
          {formatTenure(stats.tenureDays)}
        </span>
        {" · "}
        {plural(stats.periods, "periodo", "periodos")}
        {" · "}
        {stats.changes === 0
          ? "sin cambios de asignación"
          : plural(
              stats.changes,
              "cambio de asignación",
              "cambios de asignación",
            )}
      </p>

      {showTrajectory && <EmployeeTrajectory trajectory={trajectory} />}

      <div className="space-y-3">
        {showTrajectory && (
          <PanelStaticLabel>Detalle por periodo</PanelStaticLabel>
        )}
        {periods.map((period, index) => (
          <PeriodPanel
            key={period.id}
            period={period}
            number={periods.length - index}
            onCorrectPeriod={
              canCorrect
                ? () => setCorrecting({ kind: "period", periodId: period.id })
                : undefined
            }
            onCorrectAssignment={
              canCorrect
                ? (assignment, first) =>
                    setCorrecting({
                      kind: "assignment",
                      assignmentId: assignment.id,
                      first,
                    })
                : undefined
            }
          />
        ))}
      </div>

      {correctingPeriod && (
        <CorrectPeriodDialog
          employee={employee}
          period={correctingPeriod}
          open
          onOpenChange={(open) => !open && setCorrecting(null)}
        />
      )}
      {correctingAssignment && correcting?.kind === "assignment" && (
        <CorrectAssignmentDialog
          employee={employee}
          assignment={correctingAssignment}
          first={correcting.first}
          open
          onOpenChange={(open) => !open && setCorrecting(null)}
        />
      )}
    </div>
  );
}
/**
 * Historial laboral de un empleado: cada periodo en que estuvo contratado, con
 * sus cambios de cargo, departamento y sede. Se lee y cierra con clic fuera; el
 * SUPERUSER además puede corregir lo registrado desde aquí mismo.
 */
export function EmployeeHistoryDialog({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const timeZone = useCompanyTimezone();
  const today = instantToCalendarDay(new Date(), timeZone) ?? "";
  const { data, isLoading, isError } = useGetEmployeeHistory(
    selectedCompany?.slug,
    employee.id,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={History}
        title="Historial laboral"
        description={
          <>
            Periodos y asignaciones de{" "}
            <span className="font-medium text-foreground">
              {fullName(employee)}
            </span>
            , del más reciente al más antiguo.
          </>
        }
        lockOutside={false}
        className="sm:max-w-3xl"
      >
        {isLoading ? (
          <Loader2 className="mx-auto my-10 size-5 animate-spin text-muted-foreground" />
        ) : isError ? (
          <EmptyState
            tone="error"
            icon={History}
            title="No se pudo cargar el historial"
            description="Cierre el diálogo e inténtelo de nuevo."
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={History}
            title="Aún no hay historial"
            description="Aquí quedarán el ingreso, los cambios y el egreso de la persona."
          />
        ) : (
          <HistoryContent employee={employee} periods={data} today={today} />
        )}
      </FormDialogContent>
    </Dialog>
  );
}
