"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ClipboardCheck, MoreHorizontal, SquarePen, Trash2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Batch, WorkOrder } from "@/types"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import WorkOrderDropdownActions from "@/components/dropdowns/mantenimiento/ordenes_trabajo/WorkOrderDropdownActionts"

export const columns: ColumnDef<WorkOrder>[] = [
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
    accessorKey: "order_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Orden" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`/hangar74/planificacion/ordenes_trabajo/${row.original.order_number}`} className="font-medium flex justify-center hover:scale-105 hover:text-blue-600 transition-all ease-in cursor-pointer duration-150">{row.original.order_number}</Link>
      )
    }
  },
  {
    accessorKey: "aircraft.acronym",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Aeronave" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`/hangar74/planificacion/aeronaves/${row.original.aircraft.acronym}`} className="font-medium flex justify-center hover:scale-105 hover:text-blue-600 transition-all ease-in cursor-pointer duration-150">{row.original.aircraft.acronym}</Link>
      )
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground">{row.original.description}</p>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      
      return (
        <div className="flex justify-center">
          <Badge
            className={`font-semibold ${
              status === "ABIERTO"
                ? "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                : status === "CERRADO"
                  ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
                  : "bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            {status}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "elaborated_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Elaborado" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center">{row.original.elaborated_by ?? "N/A"}</p>
    )
  },
  {
    accessorKey: "reviewed_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Revisado" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center">{row.original.reviewed_by ?? "N/A"}</p>
    )
  },
  {
    accessorKey: "approved_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aprobado" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center">{row.original.approved_by ?? "N/A"}</p>
    )
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center">{row.original.date ? format(parseISO(row.original.date), "PPP", { locale: es }) : "N/A"}</p>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <WorkOrderDropdownActions work_order={row.original} />
      )
    },
  },
]
