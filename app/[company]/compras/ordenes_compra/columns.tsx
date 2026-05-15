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
import { ChevronRight } from "lucide-react"

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<PurchaseOrder>[] => [

  {
    id: "expander",
    size: 32,

    header: () => null,

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground/50 transition-transform duration-150",
            row.getIsExpanded() &&
              "rotate-90 text-emerald-600 dark:text-emerald-400"
          )}
        />
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "order_number",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nro. Orden" />
      </div>
    ),

    meta: {
      title: "Nro. Orden",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Link
          href={`/${selectedCompany?.slug}/compras/ordenes_compra/${row.original.order_number}`}
          onClick={(e) => e.stopPropagation()}
          className="
            text-sm font-semibold
            text-slate-700 dark:text-slate-200

            hover:text-emerald-600
            dark:hover:text-emerald-400

            transition-colors
          "
        >
          {row.original.order_number}
        </Link>
      </div>
    ),
  },

  {
    accessorKey: "quote_order",
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cotización" />
      </div>
    ),

    meta: {
      title: "Cotización",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.quote_order?.quote_number ?? "—"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "purchase_date",
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha de Creación" />
      </div>
    ),

    meta: {
      title: "Fecha de Creación",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {format(new Date(row.original.purchase_date), "PPP", {
            locale: es,
          })}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "vendor",
    size: 240,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Proveedor" />
      </div>
    ),

    meta: {
      title: "Proveedor",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {row.original.vendor?.name ?? "—"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "status",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),

    meta: {
      title: "Estado",
    },

    cell: ({ row }) => {
      const status = row.original.status

      const approved = status === "CERRADO"
      const process =
        status === "PROCESO" ||
        status === "PAGADO"

      return (
        <div className="flex justify-center w-full">
          <Badge
            className={cn(
              `
                rounded-md
                border
                px-2 py-0.5
                text-[10px]
                font-semibold
                tracking-wide
                shadow-sm
                transition-colors duration-150
                cursor-default
              `,

              process && `
                border-yellow-500/30
                bg-yellow-500/10
                text-yellow-700
                dark:text-yellow-300
                hover:bg-yellow-500/15
              `,

              approved && `
                border-emerald-500/30
                bg-emerald-500/10
                text-emerald-700
                dark:text-emerald-300
                hover:bg-emerald-500/15
              `,

              !process &&
                !approved &&
                `
                  border-red-500/30
                  bg-red-500/10
                  text-red-700
                  dark:text-red-300
                  hover:bg-red-500/15
                `
            )}
          >
            {status}
          </Badge>
        </div>
      )
    },
  },

  {
    accessorKey: "articles",
    size: 180,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Artículos" />
      </div>
    ),

    meta: {
      title: "Artículos",
    },

    cell: ({ row }) => {
      const count = row.original.article_purchase_order?.length ?? 0

      const isEmpty = count === 0

      return (
        <div className="flex justify-center w-full">
          <div
            className="
              flex items-center justify-center
              px-2 py-0.5
              rounded-md
              text-xs tabular-nums
              border
              transition-colors
              bg-white/60 dark:bg-slate-900/30
              border-slate-200/60 dark:border-slate-700/50
              text-slate-600 dark:text-slate-300
            "
          >
            <span className="font-medium">
              {count}
            </span>

            <span className="ml-1 text-muted-foreground">
              {count === 1 ? "artículo" : "artículos"}
            </span>

            {isEmpty && (
              <span className="ml-1 text-[10px] text-muted-foreground/70">
                vacío
              </span>
            )}
          </div>
        </div>
      )
    },
  },

  {
    id: "actions",
    size: 120,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: {
      title: "Acciones",
    },
    cell: ({ row }) => (
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseOrderDropdownActions po={row.original} />
      </div>
    ),
  },
]