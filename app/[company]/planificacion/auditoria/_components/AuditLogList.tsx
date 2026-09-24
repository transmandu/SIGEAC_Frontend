"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { useGetPlanificationAuditLogs } from "@/hooks/mantenimiento/planificacion/useGetPlanificationAuditLogs";
import { formatInstant } from "@/lib/date";
import {
  EDIT_REASONS,
  EDIT_REASON_LABELS,
  EditReason,
} from "@/lib/planificacion/editReasons";
import { cn } from "@/lib/utils";
import type {
  AuditEventKind,
  AuditTypeFilter,
  PlanificationAuditLog,
} from "@/types/planification/audit";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Loader2,
  Search,
} from "lucide-react";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import { useState } from "react";
import { AuditLogDetailDialog } from "./AuditLogDetailDialog";
import { TYPE_ICONS, TYPE_LABELS, fieldLabel } from "./labels";
import { Segmented } from "./Segmented";
import {
  microLabelCls,
  panelCls,
  reasonBadgeCls,
  workflowBadgeCls,
} from "./ui";

type KindFilter = AuditEventKind | "ALL";
type ReasonFilter = EditReason | "SIN_CLASIFICAR" | "ALL";

const KIND_OPTIONS: { key: KindFilter; label: string }[] = [
  { key: "CORRECTION", label: "Correcciones" },
  { key: "WORKFLOW", label: "Flujo" },
  { key: "ALL", label: "Todo" },
];

const PREVIEW_FIELDS = 2;

interface AuditLogListProps {
  from?: string;
  to?: string;
  type?: AuditTypeFilter;
}

export function AuditLogList({ from, to, type }: AuditLogListProps) {
  const [kind, setKind] = useState<KindFilter>("CORRECTION");
  const [reason, setReason] = useState<ReasonFilter>("ALL");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PlanificationAuditLog | null>(null);
  const timeZone = useCompanyTimezone();
  // Una petición por pausa al escribir, no por tecla.
  const debouncedSearch = useDebounce(search.trim(), 350);

  const { data, isLoading, isFetching } = useGetPlanificationAuditLogs({
    from,
    to,
    type,
    event_kind: kind === "ALL" ? undefined : kind,
    reason_category: reason === "ALL" ? undefined : reason,
    critical_only: criticalOnly,
    search: debouncedSearch || undefined,
    page,
    per_page: 20,
  });

  // Todo filtro nuevo vuelve a la primera página.
  const withReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const logs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            placeholder="N° de vuelo u orden..."
            className="h-9 border-border/60 bg-background/70 pl-9"
          />
        </div>

        <Segmented
          ariaLabel="Tipo de edición"
          value={kind}
          options={KIND_OPTIONS}
          onChange={withReset(setKind)}
        />

        <Select
          value={reason}
          onValueChange={(value) => withReset(setReason)(value as ReasonFilter)}
        >
          <SelectTrigger className="h-9 w-52 border-border/60 bg-background/70 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los motivos</SelectItem>
            {[...EDIT_REASONS, "SIN_CLASIFICAR" as const].map((value) => (
              <SelectItem key={value} value={value}>
                {EDIT_REASON_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          aria-pressed={criticalOnly}
          onClick={() => withReset(setCriticalOnly)(!criticalOnly)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
            criticalOnly
              ? "border-foreground/20 bg-foreground text-background"
              : "border-border/60 bg-background/70 text-muted-foreground hover:text-foreground",
          )}
        >
          <AlertTriangle className="size-3.5" />
          Campos críticos
        </button>

        {isFetching && !isLoading && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isLoading ? (
        <div
          className={cn(panelCls, "flex min-h-60 items-center justify-center")}
        >
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div
          className={cn(
            panelCls,
            "flex min-h-60 flex-col items-center justify-center gap-1.5 select-none",
          )}
        >
          <FileSearch className="size-4 text-muted-foreground/60" />
          <span className="text-[11px] tracking-widest text-muted-foreground/60 uppercase">
            Sin ediciones para estos filtros
          </span>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {logs.map((log) => (
            <AuditLogRow
              key={log.id}
              log={log}
              timeZone={timeZone}
              onOpen={() => setSelected(log)}
            />
          ))}
        </ul>
      )}

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between">
          <span className={microLabelCls}>
            {meta.total} {meta.total === 1 ? "edición" : "ediciones"}
          </span>
          {meta.last_page > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {meta.current_page} / {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <AuditLogDetailDialog
        log={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function AuditLogRow({
  log,
  timeZone,
  onOpen,
}: {
  log: PlanificationAuditLog;
  timeZone: string;
  onOpen: () => void;
}) {
  const Icon = TYPE_ICONS[log.auditable_type];
  const preview = log.fields.slice(0, PREVIEW_FIELDS);
  const hidden = log.fields.length - preview.length;

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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-medium">
              {log.reference ?? `#${log.auditable_id}`}
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              {TYPE_LABELS[log.auditable_type]}
            </span>
            {log.has_critical && (
              <AlertTriangle
                className="size-3 text-muted-foreground"
                aria-label="Incluye campos críticos"
              />
            )}
          </div>

          <div className="mt-1 flex flex-col gap-0.5">
            {preview.map((field) => (
              <div
                key={field.field}
                className="flex min-w-0 items-center gap-1.5 text-xs"
              >
                <span className="w-28 shrink-0 truncate text-muted-foreground/70">
                  {fieldLabel(field.field)}
                </span>
                <span className="max-w-[30%] truncate text-muted-foreground/60 line-through">
                  {field.old_value ?? "—"}
                </span>
                <span className="shrink-0 text-muted-foreground/40">→</span>
                <span className="truncate font-medium">
                  {field.new_value ?? "—"}
                </span>
              </div>
            ))}
            {hidden > 0 && (
              <span className="text-[11px] text-muted-foreground/60">
                +{hidden} {hidden === 1 ? "campo" : "campos"} más
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          {log.event_kind === "WORKFLOW" ? (
            <span className={workflowBadgeCls}>Flujo</span>
          ) : (
            <span className={reasonBadgeCls(log.reason_category)}>
              {EDIT_REASON_LABELS[log.reason_category ?? "SIN_CLASIFICAR"]}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {log.changed_by}
            </span>
            {" · "}
            {formatInstant(log.changed_at, timeZone, "dd MMM yyyy · HH:mm")}
          </span>
        </div>
      </button>
    </li>
  );
}
