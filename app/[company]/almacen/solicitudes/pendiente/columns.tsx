"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import DispatchArticlesDialog from "@/components/dialogs/mantenimiento/almacen/DispatchArticlesDialog"
import PendingDispatchRequestDropdownActions from "@/components/dropdowns/mantenimiento/almacen/PendingDispatchRequestDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import { DispatchRequest } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const columns: ColumnDef<DispatchRequest>[] = [
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
    accessorKey: "created_by",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Empleado Responsable" />
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
      <DataTableColumnHeader filter column={column} title="Justificación" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.justification}</p>
      )
    }
  },
  {
    accessorKey: "destination_place",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Destino" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.destination_place}</p>
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
    cell: ({ row }) => {
      // Transform articles to match the expected interface
      const transformedArticles = row.original.batch.articles.map(article => ({
        serial: article.serial,
        quantity: article.quantity,
        part_number: article.part_number,
        article_id: article.article_id,
        unit: article.unit && article.unit.length > 0 ? article.unit[0].secondary_unit.value : undefined
      }));
      
      return (
        <div className="flex justify-center">
          <DispatchArticlesDialog articles={transformedArticles} work_order={row.original.work_order?.order_number!} />
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original

      return (
        <PendingDispatchRequestDropdownActions request={request} />
      )
    },
  },
]
