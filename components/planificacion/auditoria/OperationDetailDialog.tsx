"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";
import { EDIT_REASON_LABELS } from "@/lib/planificacion/editReasons";
import { cn } from "@/lib/utils";
import type {
  PlanificationAuditEntry,
  PlanificationAuditOperation,
} from "@/types/planification/audit";
import { AlertTriangle, Link2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ACTION_META,
  AuditLookups,
  STRUCTURAL_FIELDS,
  fieldLabel,
  formatAuditValue,
  typeLabel,
} from "./labels";
import { useAuditLookups } from "./useAuditLookups";
import {
  actionBadgeCls,
  microLabelCls,
  neutralBadgeCls,
  reasonBadgeCls,
  workflowBadgeCls,
} from "./ui";

const DATE_TIME = "dd MMM yyyy · HH:mm:ss";

interface OperationDetailDialogProps {
  operation: PlanificationAuditOperation | null;
  onOpenChange: (open: boolean) => void;
}

export function OperationDetailDialog({
  operation,
  onOpenChange,
}: OperationDetailDialogProps) {
  const timeZone = useCompanyTimezone();
  const lookups = useAuditLookups();

  return (
    <Dialog open={!!operation} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-3xl flex-col overflow-hidden p-0">
        {operation && (
          <>
            <DialogHeader className="shrink-0 border-b border-border/60 bg-background px-6 pb-4 pt-6">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {operation.entries[0]?.reference ?? "Operación"}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {operation.actions.map((action) => (
                    <span key={action} className={actionBadgeCls(action)}>
                      {ACTION_META[action].label}
                    </span>
                  ))}
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
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Meta label="Usuario" value={operation.changed_by} />
                <Meta
                  label="Fecha y hora"
                  value={formatInstant(
                    operation.changed_at,
                    timeZone,
                    DATE_TIME,
                  )}
                />
                <Meta
                  label="Dirección IP"
                  value={operation.ip_address ?? "—"}
                />
              </dl>

              {operation.reason_note && (
                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                  <span className={microLabelCls}>Nota del motivo</span>
                  <p className="mt-1 text-sm">{operation.reason_note}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className={microLabelCls}>
                  {operation.entries.length}{" "}
                  {operation.entries.length === 1
                    ? "registro tocado"
                    : "registros tocados"}
                </span>
                {operation.entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    timeZone={timeZone}
                    lookups={lookups}
                  />
                ))}
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <Link2 className="size-3" />
                Operación {operation.operation_id}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EntryCard({
  entry,
  timeZone,
  lookups,
}: {
  entry: PlanificationAuditEntry;
  timeZone: string;
  lookups: AuditLookups;
}) {
  const fields = entry.fields.filter(
    (field) => !STRUCTURAL_FIELDS.has(field.field),
  );
  const isCorrection = entry.event_kind === "CORRECTION";

  return (
    <div className="rounded-lg border border-border/50 bg-background/70">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 px-3 py-2">
        <span className={actionBadgeCls(entry.action)}>
          {ACTION_META[entry.action].label}
        </span>
        <span className="text-sm font-medium">
          {typeLabel(entry.auditable_type)}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {entry.reference}
        </span>
        {entry.sequence !== null && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default font-mono text-[10px] text-muted-foreground/60">
                #{entry.sequence}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs font-mono text-[10px] break-all">
              Entrada {entry.sequence} de la cadena · {entry.hash}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {fields.length > 0 && (
        <div className="flex flex-col divide-y divide-border/40">
          {fields.map((field) => {
            const critical = field.is_critical && isCorrection;

            return (
              <div
                key={field.field}
                className="grid grid-cols-[minmax(8rem,12rem)_1fr] gap-3 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {fieldLabel(field.field)}
                  {critical && (
                    <span className={cn(neutralBadgeCls, "gap-1")}>
                      <AlertTriangle className="size-3" />
                      Crítico
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  {field.old_value !== null && (
                    <span className="wrap-break-word text-muted-foreground/70 line-through decoration-muted-foreground/40">
                      {formatAuditValue(
                        field.field,
                        field.old_value,
                        timeZone,
                        lookups,
                      )}
                    </span>
                  )}
                  {field.old_value !== null && field.new_value !== null && (
                    <span className="text-muted-foreground/40">→</span>
                  )}
                  {field.new_value !== null && (
                    <span className="wrap-break-word font-medium">
                      {formatAuditValue(
                        field.field,
                        field.new_value,
                        timeZone,
                        lookups,
                      )}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className={microLabelCls}>{label}</dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
    </div>
  );
}
