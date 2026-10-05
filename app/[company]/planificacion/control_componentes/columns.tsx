"use client";

import { RetiredBadge } from "@/components/planificacion/controles/RetiredBadge";
import Link from "next/link";
import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { ComponentControl } from "@/types";
import ComponentControlDropdownActions from "@/components/dropdowns/mantenimiento/ComponentControlDropdownActions";
import { computeMaintenanceItem } from "@/lib/maintenanceControlCalc";
import {
  MaintenanceStatusSummary,
  emptyStatusCounts,
} from "@/components/tables/MaintenanceStatusSummary";
import { Plane, Cog } from "lucide-react";

/** Cuántos componentes activos hay en cada franja de estado — el vistazo rápido del listado. */
function statusCounts(control: ComponentControl) {
  const counts = emptyStatusCounts();
  for (const item of control.items ?? []) {
    if (item.status !== "ACTIVE") continue;
    counts[computeMaintenanceItem(item).status] += 1;
  }
  return counts;
}

export const getColumns = (
  companySlug: string,
): AppColumnDef<ComponentControl>[] => [
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
          href={`/${companySlug}/planificacion/control_componentes/${row.original.id}`}
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
    id: "active_items_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Componentes" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium tabular-nums text-foreground/80">
          <Cog className="h-3.5 w-3.5" />
          {row.original.active_items_count ?? 0}
        </span>
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
        <ComponentControlDropdownActions componentControl={row.original} />
      </div>
    ),
    size: 60,
  },
];
