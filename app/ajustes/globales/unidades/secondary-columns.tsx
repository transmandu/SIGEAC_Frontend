"use client"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import SecondaryUnitDropdownActions from "@/components/dropdowns/ajustes/SecondaryUnitDropdownActions"
import { Convertion } from "@/types"

export const secondary_columns: ColumnDef<Convertion>[] = [
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
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='font-bold text-center'>{row.original.secondary_unit}</span>
      </div>
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidades" />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='font-bold text-center'>{row.original.convertion_rate}</span>
      </div>
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor por U." />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='font-bold text-center'>{row.original.quantity_unit}</span>
      </div>
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad Primaria" />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <span className='font-bold text-center'>{row.original.unit.label}</span>
      </div>
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center">
        <SecondaryUnitDropdownActions id={row.original.id} />
      </div>
  },
]
