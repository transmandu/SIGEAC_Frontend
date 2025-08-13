"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import PendingDispatchRequestDropdownActions from "@/components/dropdowns/mantenimiento/almacen/PendingDispatchRequestDropdownActions"
import { ToolBox } from "@/types"
import ToolBoxToolsDialog from "@/components/dialogs/mantenimiento/almacen/ToolBoxToolsDialog"
import ToolBoxDropdownActions from "@/components/dropdowns/mantenimiento/ordenes_trabajo/ToolBoxDropdownActions"

export const columns: ColumnDef<ToolBox>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.name}</p>
      )
    }
  },
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empleado Responsable" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{`${row.original.employee.first_name} ${row.original.employee.last_name}`}</p>
      )
    }
  },
  {
    accessorKey: "delivered_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entregado Por" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.delivered_by}</p>
      )
    }
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad de Herr." />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.tool.length}</p>
      )
    }
  },
  {
    accessorKey: "tools",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Herramientas" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ToolBoxToolsDialog tools={row.original.tool} name={row.original.name} />
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const toolbox = row.original
      return (
        <ToolBoxDropdownActions initialData={toolbox} id={row.original.id} />
      )
    },
  },
]
