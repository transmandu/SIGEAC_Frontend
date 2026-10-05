"use client";

import { ACTION_META } from "@/components/planificacion/auditoria/labels";
import { OperationList } from "@/components/planificacion/auditoria/OperationList";
import { Segmented } from "@/components/planificacion/auditoria/Segmented";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/helpers/useDebounce";
import {
  EDIT_REASONS,
  EDIT_REASON_LABELS,
  EditReason,
} from "@/lib/planificacion/editReasons";
import { cn } from "@/lib/utils";
import type {
  AuditAction,
  AuditEventKind,
  PlanificationAuditFilters,
} from "@/types/planification/audit";
import { AlertTriangle, Search } from "lucide-react";
import { useMemo, useState } from "react";

type KindFilter = AuditEventKind | "ALL";
type ReasonFilter = EditReason | "SIN_CLASIFICAR" | "ALL";
type ActionFilter = AuditAction | "ALL";

const KIND_OPTIONS: { key: KindFilter; label: string }[] = [
  { key: "ALL", label: "Todo" },
  { key: "CORRECTION", label: "Correcciones" },
  { key: "WORKFLOW", label: "Flujo" },
];

export function AuditLog({
  baseFilters,
}: {
  baseFilters: Pick<PlanificationAuditFilters, "from" | "to" | "module">;
}) {
  const [kind, setKind] = useState<KindFilter>("ALL");
  const [reason, setReason] = useState<ReasonFilter>("ALL");
  const [action, setAction] = useState<ActionFilter>("ALL");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [search, setSearch] = useState("");
  // Una petición por pausa al escribir, no por tecla.
  const debouncedSearch = useDebounce(search.trim(), 350);

  const filters = useMemo(
    () => ({
      ...baseFilters,
      event_kind: kind === "ALL" ? undefined : kind,
      reason_category: reason === "ALL" ? undefined : reason,
      action: action === "ALL" ? undefined : [action],
      critical_only: criticalOnly || undefined,
      search: debouncedSearch || undefined,
    }),
    [baseFilters, kind, reason, action, criticalOnly, debouncedSearch],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Matrícula, N° de vuelo, OT, ítem..."
            className="h-9 border-border/60 bg-background/70 pl-9"
          />
        </div>

        <Segmented
          ariaLabel="Tipo de operación"
          value={kind}
          options={KIND_OPTIONS}
          onChange={setKind}
        />

        <Select
          value={action}
          onValueChange={(value) => setAction(value as ActionFilter)}
        >
          <SelectTrigger className="h-9 w-44 border-border/60 bg-background/70 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las acciones</SelectItem>
            {(Object.keys(ACTION_META) as AuditAction[]).map((value) => (
              <SelectItem key={value} value={value}>
                {ACTION_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={reason}
          onValueChange={(value) => setReason(value as ReasonFilter)}
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
          onClick={() => setCriticalOnly(!criticalOnly)}
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
      </div>

      <OperationList filters={filters} />
    </div>
  );
}
