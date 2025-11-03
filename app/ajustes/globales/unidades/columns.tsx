"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import { Checkbox } from "@/components/ui/checkbox"
import { Unit } from "@/types"
import UnitDropdownActions from "@/components/dropdowns/ajustes/UnitDropdownActions"

export const columns: ColumnDef<Unit>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Seleccionar todos"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Seleccionar fila"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.label}</span>
      </div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Simbolo" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.value}</span>
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <UnitDropdownActions id={row.original.id} />
      </div>
    ),
  },
];
