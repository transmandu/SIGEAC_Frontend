"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { History, Loader2 } from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import { EmptyState } from "@/components/misc/EmptyState";
import { Dialog } from "@/components/ui/dialog";
import type {
  CompanyLoanAgreement,
  LoanHistoryEvent,
} from "@/hooks/ajustes/convenios/types";
import { useGetLoanHistory } from "@/hooks/ajustes/convenios/useGetLoanHistory";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import {
  calendarDayNumber,
  instantToCalendarDay,
  relativeDayLabel,
} from "@/lib/date";
import { cn } from "@/lib/utils";

interface Props {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const describe = (e: LoanHistoryEvent): string => {
  const scope = e.scope ? `«${e.scope}»` : "";
  const subject = e.subject ?? "";

  switch (e.type) {
    case "agreement_created":
      return "Convenio creado";
    case "agreement_suspended":
      return "Convenio suspendido";
    case "agreement_resumed":
      return "Convenio reanudado";
    case "scope_opened":
      return `Alcance ${scope} abierto`;
    case "scope_closed":
      return `Alcance ${scope} cerrado`;
    case "scope_reopened":
      return `Alcance ${scope} reabierto`;
    case "person_added":
      return `${subject} autorizado en ${scope}`;
    case "person_removed":
      return `${subject} dado de baja de ${scope}`;
    case "department_added":
      return `Departamento ${subject} elegido en ${scope}`;
    case "department_removed":
      return `Departamento ${subject} dado de baja de ${scope}`;
    case "person_excluded":
      return `${subject} excluido de ${scope}`;
    case "exclusion_lifted":
      return `${subject} reincorporado a ${scope}`;
  }
};

/** El color del nodo cuenta de qué tipo de movimiento se trata, sin leer el texto. */
const dotOf = (type: LoanHistoryEvent["type"]) => {
  switch (type) {
    case "agreement_created":
    case "scope_opened":
    case "scope_reopened":
    case "person_added":
    case "department_added":
    case "exclusion_lifted":
    case "agreement_resumed":
      return "bg-emerald-500";
    case "agreement_suspended":
    case "scope_closed":
    case "person_removed":
    case "department_removed":
    case "person_excluded":
      return "bg-amber-500";
  }
};

const plural = (count: number, one: string, other: string) =>
  `${count} ${count === 1 ? one : other}`;

// Cada fila trae su tramo de línea; el nodo se dibuja encima. La primera
// arranca en su nodo y la última termina en él (ver `TransitTimeline`).
const rowClass =
  "relative pl-8 before:absolute before:bottom-0 before:left-2 before:top-0 before:w-px before:-translate-x-1/2 before:bg-border first:before:top-2.5 last:before:bottom-auto last:before:h-2.5";

type Row =
  | { type: "day"; key: string; label: string; since?: string }
  | { type: "event"; event: LoanHistoryEvent };

/**
 * Detalle de solo lectura: cierra con clic fuera, no hay nada que perder. El
 * historial se lee como una línea de tiempo agrupada por día, del más reciente
 * al más antiguo.
 */
export function LoanHistoryDialog({
  agreement,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  const timeZone = useCompanyTimezone();
  const { data, isLoading, isError } = useGetLoanHistory(
    open ? companySlug : undefined,
    agreement.id,
  );

  const otherName =
    companySlug === agreement.lender_company_slug
      ? agreement.borrower_company_name
      : agreement.lender_company_name;

  const today = instantToCalendarDay(new Date(), timeZone) ?? "";

  // Los eventos traen un día de calendario (`yyyy-MM-dd`), no un instante.
  const rows: Row[] = [];
  let previousDay: string | null = null;

  (data ?? []).forEach((event) => {
    const key = event.date.slice(0, 10);

    if (key !== previousDay) {
      const newerDay: string | null = previousDay;
      const gap = newerDay
        ? Math.round(calendarDayNumber(newerDay) - calendarDayNumber(key))
        : 0;

      rows.push({
        type: "day",
        key,
        label: relativeDayLabel(key, today),
        since: gap >= 1 ? `${plural(gap, "día", "días")} antes` : undefined,
      });
      previousDay = key;
    }

    rows.push({ type: "event", event });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={History}
        title="Historial del convenio"
        description={
          <>
            Todo lo ocurrido en el convenio con{" "}
            <span className="font-medium text-foreground">{otherName}</span>,
            del más reciente al más antiguo.
          </>
        }
        lockOutside={false}
        className="sm:max-w-2xl"
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
            title="Aún no hay movimientos"
            description="Aquí quedará constancia de todo lo que ocurra en el convenio."
          />
        ) : (
          <PanelSection
            icon={History}
            title="Movimientos"
            hint={plural(data.length, "movimiento", "movimientos")}
          >
            <ol className="list-none">
              {rows.map((row, index) =>
                row.type === "day" ? (
                  <li
                    key={`day-${row.key}-${index}`}
                    className={cn(rowClass, index === 0 ? "pb-3" : "pb-3 pt-1")}
                  >
                    <span
                      aria-hidden
                      className="absolute left-2 top-1.5 z-10 size-2.5 -translate-x-1/2 rounded-full border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                    />
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                      <span className="font-semibold text-foreground/80 first-letter:uppercase">
                        {row.label}
                      </span>
                      {row.since && (
                        <span className="text-xs text-muted-foreground">
                          · {row.since}
                        </span>
                      )}
                    </p>
                  </li>
                ) : (
                  <li key={index} className={cn(rowClass, "pb-4 last:pb-0")}>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-2 top-1.5 z-10 size-2.5 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-slate-900",
                        dotOf(row.event.type),
                      )}
                    />
                    <p className="text-sm font-medium wrap-anywhere">
                      {describe(row.event)}
                    </p>
                    {row.event.by && (
                      <p className="text-[13px] text-muted-foreground">
                        {row.event.by}
                      </p>
                    )}
                  </li>
                ),
              )}
            </ol>
          </PanelSection>
        )}
      </FormDialogContent>
    </Dialog>
  );
}
