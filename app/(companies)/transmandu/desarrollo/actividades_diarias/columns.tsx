"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import ActivityReportsDropdownActions from "@/components/dropdowns/aerolinea/desarrollo/ActivityReportsDropdownActions"
import { ActivityReport } from "@/types"
import { addDays, format } from "date-fns"
import { es } from "date-fns/locale"


export const columns: ColumnDef<ActivityReport>[] = [
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
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <p className="font-medium text-center">{row.original.date}</p>
    )
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Empleado Responsable" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{`${row.original.user.first_name} ${row.original.user.last_name}`}</p>
      )
    }
  },
  {
    accessorKey: "total_activities",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total de Actividades" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.activities.length}</p>
      )
    }
  },
  {
    accessorKey: "observation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Observaciones" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.observation ?? "Sin observaciones..."}</p>
      )
    }
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      return (
        <ActivityReportsDropdownActions
          id={row.original.id!.toString()}
        />
      );
    },
  },
]
