"use client"

import React, { useMemo, useState } from "react"
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { GeneralArticle } from "@/types"
import { GeneralInventoryToolbar } from "./GeneralInventoryToolbar"
import { GeneralInventoryDataTable } from "./GeneralInventoryDataTable"
import { buildGeneralInventoryColumns } from "./columnts"

type Props = {
  articles: GeneralArticle[]
  baseQuantities: Record<number, number>
  editedQuantities: Record<number, number | undefined>
  onQuantityChange: (id: number, value: string) => void
  onSave: () => void
  isSaving: boolean
  hasChanges: boolean
  modifiedCount: number
}

export function GeneralInventoryTable({
  articles,
  baseQuantities,
  editedQuantities,
  onQuantityChange,
  onSave,
  isSaving,
  hasChanges,
  modifiedCount,
}: Props) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(
    () =>
      buildGeneralInventoryColumns({
        baseQuantities,
        editedQuantities,
        onQuantityChange,
      }),
    [baseQuantities, editedQuantities, onQuantityChange]
  )

  const table = useReactTable({
    data: articles,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim()
      if (!q) return true

      const d = String(row.original.description ?? "").toLowerCase()
      const b = String(row.original.brand_model ?? "").toLowerCase()
      const v = String(row.original.variant_type ?? "").toLowerCase()

      return d.includes(q) || b.includes(q) || v.includes(q)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <div className="flex flex-col gap-3">
      <GeneralInventoryToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        totalCount={articles.length}
        filteredCount={filteredCount}
        modifiedCount={modifiedCount}
        hasChanges={hasChanges}
        onSave={onSave}
        isSaving={isSaving}
      />
      <GeneralInventoryDataTable table={table} colSpan={columns.length} />
    </div>
  )
}
