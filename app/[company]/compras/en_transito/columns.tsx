'use client'

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PurchaseOrder } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import PurchaseOrderDropdownActions from "@/components/dropdowns/mantenimiento/compras/PurchaseOrderDropdownActions"

export const getColumns = (selectedCompany?: { slug: string }): ColumnDef<PurchaseOrder>[] => [
  // ── Expand indicator ──────────────────────────────────────────────
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <ChevronRight
        className={cn(
          "size-3.5 text-muted-foreground/50 transition-transform duration-150",
          row.getIsExpanded() && "rotate-90 text-amber-600 dark:text-amber-500"
        )}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  },

  // ── Nro. de Orden ─────────────────────────────────────────────────
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
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-sm font-semibold hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
        >
          {row.original.order_number}
        </Link>
      </div>
    ),
  },

  // ── Nro. Cotización ───────────────────────────────────────────────
  {
    accessorKey: "quote_order",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cotización" />
      </div>
    ),
    meta: { title: "Nro. Cotización" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.quote_order?.quote_number ?? "—"}
        </span>
      </div>
    ),
  },

  // ── Fecha ─────────────────────────────────────────────────────────
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
        <span className="text-sm text-muted-foreground">
          {format(row.original.purchase_date, "dd MMM yyyy", { locale: es })}
        </span>
      </div>
    ),
  },

  // ── Proveedor ─────────────────────────────────────────────────────
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
        <span className="text-sm font-medium">{row.original.vendor.name}</span>
      </div>
    ),
  },

  // ── Status ────────────────────────────────────────────────────────
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => {
      const isPaid = row.original.status === "PAGADO"
      return (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "text-xs font-medium px-2 py-0.5 border",
              isPaid
                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      )
    },
  },

  // ── Artículos ─────────────────────────────────────────────────────
  {
    accessorKey: "articles",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Artículos" />
      </div>
    ),
    meta: { title: "Artículos" },
    cell: ({ row }) => {
      const count = row.original.article_purchase_order.length
      return (
        <div className="flex justify-center">
          <span className={cn(
            "text-xs tabular-nums px-2 py-0.5 rounded border",
            row.getIsExpanded()
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60"
              : "text-muted-foreground border-border/40 bg-muted/30"
          )}>
            {count} {count === 1 ? "ítem" : "ítems"}
          </span>
        </div>
      )
    },
  },

  // ── Acciones ──────────────────────────────────────────────────────
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <div
        className="flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <PurchaseOrderDropdownActions po={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
