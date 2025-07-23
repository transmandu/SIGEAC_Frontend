"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import WorkOrderDropdownActions from "@/components/dropdowns/mantenimiento/ordenes_trabajo/WorkOrderDropdownActionts"
import { Checkbox } from "@/components/ui/checkbox"
import { PrelimInspectionItem } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export const columns: ColumnDef<PrelimInspectionItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ata",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="ATA" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-bold text-center">{row.original.ata}</p>
      )
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <p className="text-center">{row.original.description}</p>
      )
    }
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{row.original.location}</p>
    )
  },
]
