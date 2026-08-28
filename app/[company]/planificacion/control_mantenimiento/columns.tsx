"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MaintenanceControl } from "@/types"
import MaintenanceControlDropdownActions from "@/components/dropdowns/mantenimiento/MaintenanceControlDropdownActions"
import { Plane, FileCheck2, Wrench, Puzzle, Calendar, Eye, LucideIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"

function CountChip({ icon: Icon, value }: { icon: LucideIcon; value?: number }) {
  const count = value ?? 0
  return (
    <div className="flex justify-center">
      <span
        className={
          count > 0
            ? "inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium tabular-nums text-foreground/80"
            : "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs tabular-nums text-muted-foreground/60"
        }
      >
        <Icon className="h-3.5 w-3.5" />
        {count}
      </span>
    </div>
  )
}

export const getColumns = (companySlug: string): ColumnDef<MaintenanceControl>[] => [
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
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">
        {row.original.description || "Sin descripción"}
      </span>
    ),
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
    id: "certificates_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Certificados" />,
    cell: ({ row }) => <CountChip icon={FileCheck2} value={row.original.certificates_count} />,
  },
  {
    id: "services_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Servicios" />,
    cell: ({ row }) => <CountChip icon={Wrench} value={row.original.services_count} />,
  },
  {
    id: "parts_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Partes" />,
    cell: ({ row }) => <CountChip icon={Puzzle} value={row.original.parts_count} />,
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
              <Link href={`/${companySlug}/planificacion/control_mantenimiento/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver control de mantenimiento</span>
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
        <MaintenanceControlDropdownActions maintenanceControl={row.original} />
      </div>
    ),
    size: 60,
  },
]
