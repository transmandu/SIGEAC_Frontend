"use client";

import { RetiredBadge } from "@/components/planificacion/controles/RetiredBadge";
import Link from "next/link";
import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DirectiveControl } from "@/types";
import DirectiveControlDropdownActions from "@/components/dropdowns/mantenimiento/DirectiveControlDropdownActions";
import {
  MaintenanceStatusSummary,
  emptyStatusCounts,
} from "@/components/tables/MaintenanceStatusSummary";
import { Plane, ShieldAlert, Clock } from "lucide-react";

/** Cuántas AD aplicables hay en cada franja — sin reloj (no aplicable, cumplida, sin plazo) no cuentan. */
function statusCounts(control: DirectiveControl) {
  const counts = emptyStatusCounts();
  for (const item of control.items ?? []) {
    if (!item.computed?.status) continue;
    counts[item.computed.status] += 1;
  }
  return counts;
}

export const getColumns = (
  companySlug: string,
): AppColumnDef<DirectiveControl>[] => [
  {
    accessorKey: "aircraft",
    accessorFn: (row) => row.aircraft?.acronym ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Aeronave" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2 pr-9">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Plane className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium">
          {row.original.aircraft?.acronym ?? "N/D"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Título" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col items-center gap-1">
        <Link
          href={`/${companySlug}/planificacion/control_directivas/${row.original.id}`}
          className="text-center font-medium transition-colors hover:text-primary hover:underline underline-offset-4"
        >
          {row.original.title}
        </Link>
        <RetiredBadge record={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm text-muted-foreground line-clamp-1">
        {row.original.description || "Sin descripción"}
      </span>
    ),
  },
  {
    accessorKey: "has_reference_manual",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manual de Referencia" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.has_reference_manual ? (
          <Badge className="rounded-md border border-primary/30 bg-primary/10 font-medium text-primary shadow-none hover:bg-primary/10">
            {row.original.reference_manual || "Sí"}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground/60">No</span>
        )}
      </div>
    ),
  },
  {
    id: "applicable_items_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AD Aplicables" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium tabular-nums text-foreground/80">
          <ShieldAlert className="h-3.5 w-3.5" />
          {row.original.applicable_items_count ?? 0}
        </span>
        {(row.original.pending_analysis_count ?? 0) > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-1 text-xs font-medium tabular-nums text-amber-600">
                <Clock className="h-3 w-3" />
                {row.original.pending_analysis_count}
              </span>
            </TooltipTrigger>
            <TooltipContent>Pendientes de análisis</TooltipContent>
          </Tooltip>
        )}
      </div>
    ),
  },
  {
    id: "status_summary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vencimientos" />
    ),
    cell: ({ row }) =>
      row.original.retired_at ? (
        <span className="block text-center text-muted-foreground/60">—</span>
      ) : (
        <MaintenanceStatusSummary counts={statusCounts(row.original)} />
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DirectiveControlDropdownActions directiveControl={row.original} />
      </div>
    ),
    size: 60,
  },
];
