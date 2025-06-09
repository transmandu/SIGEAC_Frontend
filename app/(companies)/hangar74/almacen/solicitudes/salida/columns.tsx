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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DispatchRequest, WorkOrder, Convertion } from "@/types"
import DispatchArticlesDialog from "@/components/dialogs/DispatchArticlesDialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface IDispatch {
  id: number,
  requested_by: string,
  created_by: string,
  justification: string,
  destination_place: string,
  submission_date: string,
  work_order?: WorkOrder,
  status: "PROCESO" | "APROBADO" | "RECHAZADO",
  articles:
  {
    id: number,
    part_number: string,
    serial: string,
    description: string,
    unit?: Convertion[],
    quantity: string,
  }[],
}


export const columns: ColumnDef<IDispatch>[] = [
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
    accessorKey: "work_order",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Orden de Trabajo" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-bold">{row.original.work_order?.order_number ? row.original.work_order?.order_number : "N/A"}</p>
    )
  },
  {
    accessorKey: "created_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Empleado Responsable" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.created_by}</p>
      )
    }
  },
  {
    accessorKey: "justification",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Justificación" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.justification}</p>
      )
    }
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{format(row.original.submission_date, "PPP", {
        locale: es
      })}</p>
    )
  },
  {
    accessorKey: "articles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulos" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DispatchArticlesDialog articles={row.original.articles} work_order={row.original.work_order?.order_number!} />
      </div>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const approved = row.original.status === "APROBADO"
      const process = row.original.status === "PROCESO"
      return (
        <p className="font-medium text-center">{row.original.status ? <Badge className={cn("", approved ? "bg-green-500 hover:bg-green-600" : process ? "bg-yellow-500 hover:bg-yellow-600" : "bg-red-500 hover:bg-red-600")}>{row.original.status.toUpperCase()}</Badge> :"N/A"}</p>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="flex gap-2 justify-center">
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Tooltip>
                  <TooltipTrigger>
                    <Trash2 className='size-5 text-red-500' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar</p>
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tooltip>
                  <TooltipTrigger>
                    <SquarePen className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Editar
                  </TooltipContent>
                </Tooltip>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      )
    },
  },
]
