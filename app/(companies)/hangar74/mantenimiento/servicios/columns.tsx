"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MaintenanceService } from "@/types"
import Link from "next/link"
import MaintenanceServiceDropdownActions from "@/components/dropdowns/mantenimiento/ordenes_trabajo/MaintenanceServiceDropdownActionts"

export const columns: ColumnDef<MaintenanceService>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-bold italic">{row.original.name}</p>
    )
  },
  {
    accessorKey: "manufacturer.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fabricante" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-medium">{row.original.manufacturer.name}</p>
    )
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-bold italic">{row.original.description}</p>
    )
  },
  {
    accessorKey: "tasks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fabricante" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-medium">{row.original.tasks.length} - Tareas</p>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      return (
        <MaintenanceServiceDropdownActions service={row.original} />
      )
    },
  },
]
