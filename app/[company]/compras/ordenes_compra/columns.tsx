'use client'

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PurchaseOrder } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import PurchaseOrderDropdownActions from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions"

// Creamos función que recibe la compañía
export const getColumns = (selectedCompany?: { slug: string }): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nro. de Orden" />
      </div>
    ),
    meta: { title: "Nro. Orden" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          href={`/${selectedCompany?.slug}/compras/ordenes_compra/${row.original.order_number}`}
          className="font-bold text-center hover:italic hover:scale-110 transition-all"
        >
          {row.original.order_number}
        </Link>
      </div>
    )
  },
  {
    accessorKey: "quote_order",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Nro. de Cotización" />
      </div>
    ),
    meta: { title: "Nro. Cotización" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="font-medium text-center">
          {row.original.quote_order?.quote_number ?? "N/A"}
        </p>
      </div>
    )
  },
  {
    accessorKey: "purchase_date",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha" />
      </div>
    ),
    meta: { title: "Fecha" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-muted-foreground italic text-center">
          {format(row.original.purchase_date, "PPP", { locale: es })}
        </p>
      </div>
    )
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Proveedor" />
      </div>
    ),
    meta: { title: "Proveedor" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="font-medium text-center">{row.original.vendor.name}</p>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    meta: { title: "Status" },
    cell: ({ row }) => {
      const process = row.original.status === "PROCESO"
      const paid = row.original.status === "PAGADO"

      return (
        <div className="flex justify-center">
          <Badge
            className={cn(
              process ? "bg-yellow-500" : paid ? "bg-green-500" : "bg-red-500"
            )}
          >
            {row.original.status.toUpperCase()}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "articles",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Artículos" />
      </div>
    ),
    meta: { title: "Artículos" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span>Total de {row.original.article_purchase_order.length} artículo(s)</span>
      </div>
    )
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <PurchaseOrderDropdownActions po={row.original} />
      </div>
    ),
  },
]