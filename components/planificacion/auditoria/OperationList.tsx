"use client";

import { Button } from "@/components/ui/button";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetPlanificationAuditLogs } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditLogs";
import { formatInstant } from "@/lib/date";
import { EDIT_REASON_LABELS } from "@/lib/planificacion/editReasons";
import { cn } from "@/lib/utils";
import type {
  PlanificationAuditFilters,
  PlanificationAuditOperation,
} from "@/types/planification/audit";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import {
  ACTION_META,
  STRUCTURAL_FIELDS,
  SUBJECT_ICONS,
  fieldLabel,
  typeLabel,
} from "./labels";
import { OperationDetailDialog } from "./OperationDetailDialog";
import {
  actionBadgeCls,
  microLabelCls,
  panelCls,
  reasonBadgeCls,
  workflowBadgeCls,
} from "./ui";

interface OperationListProps {
  filters: Omit<PlanificationAuditFilters, "page" | "per_page">;
  perPage?: number;
  emptyLabel?: string;
}

export function OperationList({
  filters,
  perPage = 20,
  emptyLabel = "Sin operaciones para estos filtros",
}: OperationListProps) {
  const [page, setPage] = useState(1);
  const filtersKey = JSON.stringify(filters);
  const [pageFiltersKey, setPageFiltersKey] = useState(filtersKey);
  const [selected, setSelected] = useState<PlanificationAuditOperation | null>(
    null,
  );
  const timeZone = useCompanyTimezone();

  // Filtros nuevos vuelven a la primera página.
  if (pageFiltersKey !== filtersKey) {
    setPageFiltersKey(filtersKey);
    setPage(1);
  }

  const { data, isLoading, isFetching } = useGetPlanificationAuditLogs({
    ...filters,
    page,
    per_page: perPage,
  });

  const operations = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div
        className={cn(panelCls, "flex min-h-48 items-center justify-center")}
      >
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 transition-opacity",
        isFetching && "opacity-70",
      )}
    >
      {operations.length === 0 ? (
        <div
          className={cn(
            panelCls,
            "flex min-h-48 flex-col items-center justify-center gap-1.5 select-none",
          )}
        >
          <FileSearch className="size-4 text-muted-foreground/60" />
          <span className="text-[11px] tracking-widest text-muted-foreground/60 uppercase">
            {emptyLabel}
          </span>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {operations.map((operation) => (
            <OperationRow
              key={operation.operation_id}
              operation={operation}
              timeZone={timeZone}
              onOpen={() => setSelected(operation)}
            />
          ))}
        </ul>
      )}

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between">
          <span className={microLabelCls}>
            {meta.total} {meta.total === 1 ? "operación" : "operaciones"}
          </span>
          {meta.last_page > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {meta.current_page} / {meta.last_page}
              </span>
              {page > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
              )}
              {page < meta.last_page && (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <OperationDetailDialog
        operation={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function OperationRow({
  operation,
  timeZone,
  onOpen,
}: {
  operation: PlanificationAuditOperation;
  timeZone: string;
  onOpen: () => void;
}) {
  const root =
    operation.entries.find(
      (entry) => entry.auditable_type === entry.subject_type,
    ) ?? operation.entries[0];
  const Icon = root?.subject_type
    ? SUBJECT_ICONS[root.subject_type]
    : FileSearch;
  const changedFields = [
    ...new Set(
      operation.entries.flatMap((entry) =>
        entry.action === "UPDATE"
          ? entry.fields
              .filter((field) => !STRUCTURAL_FIELDS.has(field.field))
              .map((field) => fieldLabel(field.field))
          : [],
      ),
    ),
  ];
  const touchedTypes = [
    ...new Set(
      operation.entries.map((entry) => typeLabel(entry.auditable_type)),
    ),
  ];

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-left shadow-xs transition-colors hover:border-border hover:bg-muted/40"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background">
          <Icon className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-medium">
              {root?.reference ?? "—"}
            </span>
            {operation.actions.map((action) => (
              <span key={action} className={actionBadgeCls(action)}>
                {ACTION_META[action].label}
              </span>
            ))}
            {operation.has_critical && (
              <AlertTriangle
                className="size-3 text-muted-foreground"
                aria-label="Incluye campos críticos"
              />
            )}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {changedFields.length > 0
              ? changedFields.slice(0, 4).join(" · ") +
                (changedFields.length > 4
                  ? ` +${changedFields.length - 4}`
                  : "")
              : touchedTypes.join(" · ")}
            {operation.entries.length > 1 && (
              <span className="text-muted-foreground/60">
                {" "}
                · {operation.entries.length} registros
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          {operation.event_kind === "WORKFLOW" ? (
            <span className={workflowBadgeCls}>Flujo</span>
          ) : (
            <span className={reasonBadgeCls(operation.reason_category)}>
              {
                EDIT_REASON_LABELS[
                  operation.reason_category ?? "SIN_CLASIFICAR"
                ]
              }
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {operation.changed_by}
            </span>
            {" · "}
            {formatInstant(
              operation.changed_at,
              timeZone,
              "dd MMM yyyy · HH:mm",
            )}
          </span>
        </div>
      </button>
    </li>
  );
}
