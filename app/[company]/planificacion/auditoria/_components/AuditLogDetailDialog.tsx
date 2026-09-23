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
import type { PlanificationAuditLog } from "@/types/planification/audit";
import { AlertTriangle } from "lucide-react";
import { TYPE_ICONS, TYPE_LABELS, fieldLabel } from "./labels";
import {
  microLabelCls,
  neutralBadgeCls,
  reasonBadgeCls,
  workflowBadgeCls,
} from "./ui";

interface AuditLogDetailDialogProps {
  log: PlanificationAuditLog | null;
  onOpenChange: (open: boolean) => void;
}

const DATE_TIME = "dd MMM yyyy · HH:mm";

export function AuditLogDetailDialog({
  log,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  const timeZone = useCompanyTimezone();
  const Icon = log ? TYPE_ICONS[log.auditable_type] : null;

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {log && Icon && (
          <>
            <DialogHeader className="border-b border-border/60 pb-4">
              <DialogTitle className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
                <Icon className="size-5 text-muted-foreground/70" />
                {log.reference ?? `#${log.auditable_id}`}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <span>{TYPE_LABELS[log.auditable_type]}</span>
                {log.event_kind === "WORKFLOW" ? (
                  <span className={workflowBadgeCls}>Flujo de trabajo</span>
                ) : (
                  <span className={reasonBadgeCls(log.reason_category)}>
                    {
                      EDIT_REASON_LABELS[
                        log.reason_category ?? "SIN_CLASIFICAR"
                      ]
                    }
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-4 py-1">
              <Meta
                label="Editó"
                who={log.changed_by}
                when={formatInstant(log.changed_at, timeZone, DATE_TIME)}
              />
              <Meta
                label="Cargó el registro"
                who={log.record_author ?? "—"}
                when={
                  log.record_created_at
                    ? formatInstant(log.record_created_at, timeZone, DATE_TIME)
                    : undefined
                }
              />
            </dl>

            {log.reason_note && (
              <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                <span className={microLabelCls}>Nota</span>
                <p className="mt-1 text-sm">{log.reason_note}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className={microLabelCls}>
                {log.fields.length}{" "}
                {log.fields.length === 1
                  ? "campo modificado"
                  : "campos modificados"}
              </span>
              <div className="flex flex-col divide-y divide-border/50 rounded-lg border border-border/50 bg-background/70">
                {log.fields.map((field) => (
                  <div
                    key={field.field}
                    className="flex flex-col gap-1.5 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {fieldLabel(field.field)}
                      </span>
                      {field.is_critical && (
                        <span className={cn(neutralBadgeCls, "gap-1")}>
                          <AlertTriangle className="size-3" />
                          Crítico
                        </span>
                      )}
                      {field.field_kind === "WORKFLOW" &&
                        log.event_kind === "CORRECTION" && (
                          <span className={workflowBadgeCls}>Flujo</span>
                        )}
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 text-sm">
                      <span className="wrap-break-word text-muted-foreground/70 line-through decoration-muted-foreground/40">
                        {field.old_value ?? "—"}
                      </span>
                      <span className="text-muted-foreground/40">→</span>
                      <span className="wrap-break-word font-medium">
                        {field.new_value ?? "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Meta({
  label,
  who,
  when,
}: {
  label: string;
  who: string;
  when?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={microLabelCls}>{label}</dt>
      <dd className="text-sm font-medium">{who}</dd>
      {when && <dd className="text-xs text-muted-foreground">{when}</dd>}
    </div>
  );
}
