"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MaintenanceControl } from "@/types"
import MaintenanceControlDropdownActions from "@/components/dropdowns/mantenimiento/MaintenanceControlDropdownActions"
import { Plane, FileCheck2, Wrench, Puzzle, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const getColumns = (companySlug: string): ColumnDef<MaintenanceControl>[] => [
  {
    accessorKey: "aircraft",
    accessorFn: (row) => row.aircraft?.acronym ?? "",
    header: ({ column }) => <DataTableColumnHeader filter column={column} title="Aeronave" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Plane className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.aircraft?.acronym ?? "N/D"}</span>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader filter column={column} title="Título" />,
    cell: ({ row }) => (
      <Button asChild variant="link" className="h-auto p-0 font-medium">
        <Link href={`/${companySlug}/planificacion/control_mantenimiento/${row.original.id}`}>
          {row.original.title}
        </Link>
      </Button>
    ),
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
          <Badge variant="secondary">{row.original.reference_manual || "Sí"}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">No</span>
        )}
      </div>
    ),
  },
  {
    id: "certificates_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Certificados" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <FileCheck2 className="h-4 w-4 text-muted-foreground" />
        <span className="tabular-nums">{row.original.certificates_count ?? 0}</span>
      </div>
    ),
  },
  {
    id: "services_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Servicios" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <span className="tabular-nums">{row.original.services_count ?? 0}</span>
      </div>
    ),
  },
  {
    id: "parts_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Partes" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Puzzle className="h-4 w-4 text-muted-foreground" />
        <span className="tabular-nums">{row.original.parts_count ?? 0}</span>
      </div>
    ),
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
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <MaintenanceControlDropdownActions maintenanceControl={row.original} />
      </div>
    ),
    size: 60,
  },
]
