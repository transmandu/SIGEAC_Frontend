"use client"

import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import ActivityReportsDropdownActions from "@/components/dropdowns/aerolinea/desarrollo/ActivityReportsDropdownActions"
import { GeneralArticle } from "@/types"
import { QuantityEditCell } from "./QuantityCell"

type BuildColumnsArgs = {
  baseQuantities: Record<number, number>
  editedQuantities: Record<number, number | undefined>
  onQuantityChange: (id: number, value: string) => void
}

export function buildGeneralInventoryColumns({
  baseQuantities,
  editedQuantities,
  onQuantityChange,
}: BuildColumnsArgs): ColumnDef<GeneralArticle>[] {
  return [
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
            <p className="max-w-[520px] truncate text-center text-sm font-medium" title={value}>
              {value}
            </p>
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
            <Badge variant="secondary" className="max-w-[260px] truncate" title={value}>
              {value}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "variant_type",
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader filter column={column} title="Tipo / N° Parte" />
        </div>
      ),
      cell: ({ row }) => {
        const value = row.original.variant_type?.trim() || "N/A"
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className="max-w-[240px] truncate" title={value}>
              {value}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "actual_quantity",
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader filter column={column} title="Cantidad Actual" />
        </div>
      ),
      cell: ({ row }) => {
        const qty = row.original.quantity ?? 0
        return (
          <div className="flex justify-center">
            <Badge variant="outline" className="max-w-[240px] truncate" >
              {qty}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "quantity_edit",
      header: () => <div className="text-center text-sm font-medium">Nueva Cant.</div>,
      cell: ({ row }) => {
        const id = row.original.id
        const base = baseQuantities[id] ?? 0
        const edited = editedQuantities[id]

        return (
          <QuantityEditCell
            id={id}
            base={base}
            edited={edited}
            onCommit={onQuantityChange}
          />
        )
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-center text-sm font-medium">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <ActivityReportsDropdownActions id={String(row.original.id)} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
