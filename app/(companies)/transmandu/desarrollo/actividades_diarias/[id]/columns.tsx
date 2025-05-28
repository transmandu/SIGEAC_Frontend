"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import ActivityDropdownActions from "@/components/misc/ActivityDropdownActions"
import { Activity } from "@/types"

export const columns: ColumnDef<Activity>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actividad" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{`${row.original.description}`}</p>
      )
    }
  },
  {
    accessorKey: "start_hour",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora de Inicio" />
    ),
    cell: ({ row }) => (
      <p className="font-medium text-center ml-[2px] italic">{`${row.original.start_hour}`}</p> // Ajuste de margen
    )
  },
  {
    accessorKey: "final_hour",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora de Finalizacion" />
    ),
    cell: ({ row }) => (
      <p className="font-medium text-center ml-[2px] italic">{row.original.final_hour ?? "-"}</p> // Ajuste de margen
    )
  },
  {
    accessorKey: "result",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resultados" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center ml-[2px]">{row.original.result ?? "Sin resultados..."}</p> // Ajuste de margen
      )
    }
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      const finished = row.original.final_hour !== null;
      return (
        <ActivityDropdownActions
          finished={finished}
          initialData={row.original}
        />
      );
    },
  },
]
