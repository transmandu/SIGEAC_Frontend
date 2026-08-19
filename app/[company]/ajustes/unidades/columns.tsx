"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Unit } from "@/types"
import UnitDropdownActions from "@/components/dropdowns/ajustes/UnitDropdownActions"
import { Badge } from "@/components/ui/badge"
import { Ruler } from "lucide-react"

export const columns: ColumnDef<Unit>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.label}</span>
        <span className="font-light text-center ml-1">({row.original.value})</span>
      </div>
    ),
  },
  {
    accessorKey: "is_dimensional",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medidas" />
    ),
    // Solo se marca lo habilitado: un badge en cada fila normal sería ruido,
    // porque la mayoría de las unidades nunca sirven para dimensionar.
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.is_dimensional ? (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Ruler className="h-3 w-3" />
            Declara medidas
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <UnitDropdownActions unit={row.original} />
      </div>
    ),
  },
];
