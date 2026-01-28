"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { WorkOrderReportItem } from "@/types"

export const columns: ColumnDef<WorkOrderReportItem>[] = [
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
    accessorKey: "ata_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="ATA" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-bold text-center">{row.original.ata_code}</p>
      )
    }
  },
  {
    accessorKey: "report",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <p className="text-center">{row.original.report}</p>
      )
    }
  },
  {
    accessorKey: "action_taken",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{row.original.action_taken}</p>
    )
  },
]
