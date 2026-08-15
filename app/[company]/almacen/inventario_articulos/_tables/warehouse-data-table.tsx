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
  /** Con orden agrupado el total cuenta grupos, no artículos. */
  unitLabel?: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  rowClassName?: (row: TData) => string
  serverPagination?: ServerPagination
  /** Delega el orden al servidor: sin esto solo se ordena la página cargada. */
  serverSorting?: {
    sorting: SortingState
    onSortingChange: (sorting: SortingState) => void
  }
  /** Refetch en curso con datos previos en pantalla. */
  isFetching?: boolean
  /**
   * Delega ciertos filtros de columna al servidor. Sin esto solo se filtra la
   * página cargada, que con paginado por servidor son unas pocas filas.
   */
  serverColumnFilters?: {
    columnIds: string[]
    onFiltersChange: (filters: Record<string, string>) => void
  }
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
  serverSorting,
  isFetching = false,
  serverColumnFilters,
}: DataTableProps<TData, TValue>) {
  const [localSorting, setLocalSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const sorting = serverSorting ? serverSorting.sorting : localSorting

  const handleColumnFiltersChange: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  > = (updater) => {
    const next = typeof updater === "function" ? updater(columnFilters) : updater
    setColumnFilters(next)

    if (!serverColumnFilters) return

    const delegated: Record<string, string> = {}
    for (const id of serverColumnFilters.columnIds) {
      const value = next.find((f) => f.id === id)?.value
      const raw = String(value ?? "").trim()
      if (raw) delegated[id] = raw
    }
    serverColumnFilters.onFiltersChange(delegated)
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      if (serverSorting) serverSorting.onSortingChange(next)
      else setLocalSorting(next)
    },
    getSortedRowModel: getSortedRowModel(),
    manualSorting: !!serverSorting,
    onColumnFiltersChange: handleColumnFiltersChange,
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

  // z bajo a propósito: la columna fija solo debe cubrir las celdas que pasan
  // por debajo al hacer scroll horizontal, no montarse sobre dropdowns ni
  // diálogos.
  const stickyHeadClass = "sticky right-0 z-[2] bg-background"
  // La celda necesita fondo opaco (tapa lo que pasa por debajo al hacer
  // scroll), pero la fila tiñe con muted/50 translúcido. color-mix reproduce
  // esa mezcla ya compuesta sobre el fondo, así el tono coincide exactamente;
  // transition-colors la sincroniza con el transition-colors de la fila.
  const stickyHoverBg =
    "color-mix(in srgb, hsl(var(--muted)) 50%, hsl(var(--background)))"
  const stickyCellClass =
    "sticky right-0 z-[1] bg-background transition-colors group-hover:[background:var(--sticky-hover-bg)] group-data-[state=selected]:bg-muted"

  return (
    <div className="space-y-4">
      <div className="relative rounded-md border overflow-x-auto">
        {isFetching && (
          <div className="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-muted">
            <div className="h-full w-1/4 animate-indeterminate bg-primary" />
          </div>
        )}
        <Table
          className={cn(
            "transition-opacity",
            isFetching && "opacity-60 pointer-events-none",
          )}
        >
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
                        style={
                          isStickyRight
                            ? ({ "--sticky-hover-bg": stickyHoverBg } as React.CSSProperties)
                            : undefined
                        }
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
            ? `${serverPagination.from}–${serverPagination.to} de ${serverPagination.total} ${serverPagination.unitLabel ?? "artículo(s)"}`
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
