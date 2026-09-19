"use client"

import Link from "next/link"
import { type AppColumnDef } from "@/lib/table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DirectiveControl } from "@/types"
import DirectiveControlDropdownActions from "@/components/dropdowns/mantenimiento/DirectiveControlDropdownActions"
import { STATUS_META } from "@/lib/maintenanceControlCalc"
import { Plane, ShieldAlert, Clock, Calendar, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

/** Cuántas AD aplicables hay en cada franja — sin reloj (no aplicable, cumplida, sin plazo) no cuentan. */
function StatusSummary({ control }: { control: DirectiveControl }) {
  const counts = { OK: 0, WARNING: 0, CRITICAL: 0, OVERDUE: 0 }
  for (const item of control.items ?? []) {
    if (!item.computed?.status) continue
    counts[item.computed.status] += 1
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

export const getColumns = (companySlug: string): AppColumnDef<DirectiveControl>[] => [
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
    id: "applicable_items_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="AD Aplicables" />,
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
              <Link href={`/${companySlug}/planificacion/control_directivas/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver control de directivas</span>
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
        <DirectiveControlDropdownActions directiveControl={row.original} />
      </div>
    ),
    size: 60,
  },
]
