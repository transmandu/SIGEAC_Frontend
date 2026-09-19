"use client"

import Link from "next/link"
import { type AppColumnDef } from "@/lib/table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ComponentControl } from "@/types"
import ComponentControlDropdownActions from "@/components/dropdowns/mantenimiento/ComponentControlDropdownActions"
import { computeMaintenanceItem, STATUS_META } from "@/lib/maintenanceControlCalc"
import { Plane, Cog, Calendar, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

/** Cuántos componentes activos hay en cada franja de estado — el vistazo rápido del listado. */
function StatusSummary({ control }: { control: ComponentControl }) {
  const counts = { OK: 0, WARNING: 0, CRITICAL: 0, OVERDUE: 0 }
  for (const item of control.items ?? []) {
    if (item.status !== "ACTIVE") continue
    counts[computeMaintenanceItem(item).status] += 1
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {(Object.keys(counts) as (keyof typeof counts)[]).map((status) =>
        counts[status] > 0 ? (
          <Tooltip key={status}>
            <TooltipTrigger asChild>
              <span className={cn("inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-xs font-medium tabular-nums", STATUS_META[status].text)}>
                <span className={cn("size-1.5 rounded-full", STATUS_META[status].dot)} />
                {counts[status]}
              </span>
            </TooltipTrigger>
            <TooltipContent>{STATUS_META[status].label}</TooltipContent>
          </Tooltip>
        ) : null,
      )}
    </div>
  )
}

export const getColumns = (companySlug: string): AppColumnDef<ComponentControl>[] => [
  {
    accessorKey: "aircraft",
    accessorFn: (row) => row.aircraft?.acronym ?? "",
    header: ({ column }) => <DataTableColumnHeader filter column={column} title="Aeronave" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Plane className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium">{row.original.aircraft?.acronym ?? "N/D"}</span>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader filter column={column} title="Título" />,
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: "has_reference_manual",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Manual de Referencia" />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Componentes" />,
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => <StatusSummary control={row.original} />,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{row.original.created_at ? formatDate(row.original.created_at) : "-"}</span>
      </div>
    ),
  },
  {
    id: "view",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/${companySlug}/planificacion/control_componentes/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver control de componentes</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver</TooltipContent>
        </Tooltip>
      </div>
    ),
    size: 40,
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
]
