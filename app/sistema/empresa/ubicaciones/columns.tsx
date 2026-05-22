"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Location } from "@/types"

export const columns: ColumnDef<Location>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Nombre"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold">
          {row.original.name ?? "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Ubicación"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground">
          {row.original.address}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Tipo"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span>{row.original.type}</span>
      </div>
    ),
  },
]
