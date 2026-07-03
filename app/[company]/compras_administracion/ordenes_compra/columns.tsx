"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import QuoteDropdownActions from "@/components/dropdowns/mantenimiento/compras/QuoteDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { PurchaseOrder } from "@/types/purchase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import PurchaseOrderDropdownActions from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions"

const PO_STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE',
  PAID: 'PAGADA',
  COMPLETED: 'COMPLETADA',
}

export const columns: ColumnDef<PurchaseOrder>[] = [
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
        <div className="flex justify-center">
          <Link href={`/hangar74/compras/ordenes_compra/${row.original.order_number}`} className="font-bold text-center hover:italic hover:scale-110 transition-all">{row.original.order_number}</Link>
        </div>
      )
    }
  },
  {
    accessorKey: "requisition_order.quote_order.quote_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de Cotizacion" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.quote_order.quote_number ?? "N/A"}</p>
      )
    }
  },
  {
    accessorKey: "purchase_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{format(row.original.purchase_date, "PPP", {
        locale: es
      })}</p>
    )
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.vendor?.name ?? "N/A"}</p>
      )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const pending = row.original.status === 'PENDING'
      const paid = row.original.status === 'PAID'
      return (
        <Badge className={cn("flex justify-center", pending ? "bg-yellow-500" : paid ? "bg-green-500" : "bg-red-500")} > {PO_STATUS_LABELS[row.original.status] ?? row.original.status.toUpperCase()}</Badge >
      )
    }
  },
  {
    accessorKey: "articles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulos" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span>Total de {row.original.article_purchase_order.length} articulo(s)</span>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <PurchaseOrderDropdownActions po={row.original} />
      )
    },
  },
]
