'use client'

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Quote } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import QuoteDropdownActions from "@/components/dropdowns/mantenimiento/compras/QuoteDropdownActions"

// Generamos las columnas dinámicamente pasando selectedCompany
export const getColumns = (selectedCompany?: { slug: string }): ColumnDef<Quote>[] => [
  {
    accessorKey: "quote_number",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nro. de Cotización" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          href={`/${selectedCompany?.slug}/compras/cotizaciones/${row.original.quote_number}`}
          className="font-bold text-center hover:italic hover:scale-110 transition-all"
        >
          {row.original.quote_number}
        </Link>
      </div>
    )
  },
  {
    accessorKey: "requisition_order",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Nro. de Requisición" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="font-medium text-center">{row.original.requisition_order?.order_number ?? "N/A"}</p>
      </div>
    )
  },
  {
    accessorKey: "quote_date",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-muted-foreground italic text-center">
          {format(row.original.quote_date, "PPP", { locale: es })}
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
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="font-medium text-center">{row.original.vendor?.name}</p>
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
    cell: ({ row }) => {
      const pending = row.original.status === "PENDIENTE"
      const approved = row.original.status === "APROBADO"
      return (
        <div className="flex justify-center">
          <Badge
            className={cn(
              pending ? "bg-yellow-500" :
              approved ? "bg-green-500" :
              "bg-red-500"
            )}
          >
            {row.original.status.toUpperCase()}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "article_quote_order",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Artículos" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span>Total de {row.original.article_quote_order?.length ?? 0} artículo(s)</span>
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
    cell: ({ row }) => (
      <div className="flex justify-center">
        <QuoteDropdownActions quote={row.original} />
      </div>
    )
  }
]