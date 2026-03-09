"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ServerPagination {
  currentPage: number
  lastPage: number
  total: number
  from: number
  to: number
  onPageChange: (page: number) => void
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  rowClassName?: (row: TData) => string
  serverPagination?: ServerPagination
}

type ColMeta = {
  sticky?: "right" | "left"
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  rowClassName,
  serverPagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: { pageSize: 100 },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const stickyHeadClass = "sticky right-0 z-40 bg-background"
  const stickyCellClass = "sticky right-0 z-30 bg-background group-hover:bg-muted/50"

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColMeta | undefined
                  const isStickyRight = meta?.sticky === "right"

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(isStickyRight && stickyHeadClass, meta?.className)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("group", rowClassName?.(row.original))}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as ColMeta | undefined
                    const isStickyRight = meta?.sticky === "right"

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(isStickyRight && stickyCellClass, meta?.className)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {serverPagination
            ? `${serverPagination.from}–${serverPagination.to} de ${serverPagination.total} artículo(s)`
            : `${table.getFilteredRowModel().rows.length} artículo(s) total(es)`}
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          {!serverPagination && (
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm"
              >
                {[10, 20, 50, 100, 200, 500].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          )}

          {serverPagination ? (
            <>
              <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                Página {serverPagination.currentPage} de {serverPagination.lastPage}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => serverPagination.onPageChange(serverPagination.currentPage - 1)}
                  disabled={serverPagination.currentPage <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => serverPagination.onPageChange(serverPagination.currentPage + 1)}
                  disabled={serverPagination.currentPage >= serverPagination.lastPage}
                >
                  Siguiente
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Siguiente
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
