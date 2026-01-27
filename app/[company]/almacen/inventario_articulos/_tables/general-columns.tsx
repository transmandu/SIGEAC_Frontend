"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import ActivityReportsDropdownActions from "@/components/dropdowns/aerolinea/desarrollo/ActivityReportsDropdownActions"
import { Badge } from "@/components/ui/badge"
import { GeneralArticle } from "@/types"

export const columns: ColumnDef<GeneralArticle>[] = [
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader filter column={column} title="Descripción" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.description?.trim() || "N/A"

      return (
        <div className="flex justify-center">
          <div className="max-w-[520px]">
            <p
              className="text-center font-bold text-sm"
              title={value}
            >
              {value}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "brand_model",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader filter column={column} title="Marca / Modelo" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.brand_model?.trim() || "N/A"

      return (
        <div className="flex justify-center">
          <div className="max-w-[280px]">
            <p
              className="text-center text-sm text-muted-foreground font-medium  italic"
              title={value}
            >
              {value}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "variant_type",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader filter column={column} title="Present. / Especif." />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.original.variant_type?.trim() || "N/A"

      return (
        <div className="flex justify-center">
          <div className="max-w-[240px]">
            <p className="text-center text-sm font-medium" title={value}>
              {value}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Cantidad" />
      </div>
    ),
    cell: ({ row }) => {
      const qty = Number(row.original.quantity ?? 0)
      const isZero = !Number.isFinite(qty) || qty <= 0

      return (
        <div className="flex justify-center">
          <Badge
            variant={isZero ? "outline" : "secondary"}
            className="tabular-nums px-2 py-1 text-xs"
            title={isZero ? "Sin stock" : "Stock disponible"}
          >
            {isZero ? "0" : qty}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ActivityReportsDropdownActions id={String(row.original.id)} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
