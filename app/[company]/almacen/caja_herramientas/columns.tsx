"use client"

import { type AppColumnDef } from "@/lib/table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import PendingDispatchRequestDropdownActions from "@/components/dropdowns/mantenimiento/almacen/DispatchRequestDropdownActions"
import { ToolBox } from "@/types"
import { ToolBoxHistoryButton } from "@/components/dialogs/almacen/ToolBoxHistoryButton"
import ToolBoxToolsDialog from "@/components/dialogs/mantenimiento/almacen/ToolBoxToolsDialog"
import ToolBoxDropdownActions from "@/components/dropdowns/mantenimiento/ordenes_trabajo/ToolBoxDropdownActions"
import { fullName } from "@/lib/person-name";

export const columns: AppColumnDef<ToolBox>[] = [
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
      const employee = row.original.employee
      return (
        <p className="font-medium text-center">{employee ? fullName(employee) : "N/A"}</p>
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
        <p className="font-medium text-center">{row.original.tool.length + (row.original.individuals?.length ?? 0)}</p>
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
        <ToolBoxToolsDialog
          tools={row.original.tool}
          individuals={row.original.individuals}
          name={row.original.name}
        />
      </div>
    )
  },
  {
    id: "history",
    header: () => <p className="text-center text-sm font-medium">Historial</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ToolBoxHistoryButton toolBoxId={row.original.id} name={row.original.name} />
      </div>
    ),
    enableSorting: false,
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
