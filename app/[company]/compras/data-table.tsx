'use client'

import React, { useMemo, useState, useCallback } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from '@/components/tables/DataTablePagination'
import { useComprasPageSize } from './use-compras-page-size'

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean
  disablePagination?: boolean
  renderSubRow?: (row: Row<TData>) => React.ReactNode
  canExpandRow?: (row: Row<TData>) => boolean
  /** Pass arbitrary meta to the table instance (e.g. { costDrafts }) */
  meta?: Record<string, unknown>
  /** Custom slot rendered above the table (e.g. toolbar buttons) */
  toolbar?: React.ReactNode
  /** Text shown while loading */
  loadingText?: string
  /** Text shown when data is empty */
  emptyText?: string
  /** Whether the table container uses overflow-visible instead of overflow-hidden */
  overflowVisible?: boolean
  /** Default page size */
  pageSize?: number
  /** When set, the selected page size is persisted per-user (localStorage) under this key and restored on future visits, overriding `pageSize` */
  persistKey?: string
  // ── Manual (server‑side) pagination ──────────────────────────
  /** Enable manual pagination – page / row count are controlled externally */
  manualPagination?: boolean
  /** Total number of rows across all pages (required when manualPagination) */
  totalRows?: number
  /** Total number of pages (required when manualPagination) */
  pageCount?: number
  /** Current page index (0‑based), required when manualPagination */
  pageIndex?: number
  /** Called when the user changes page or page size */
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
}

function DataTableInner<TData>({
  columns,
  data,
  loading = false,
  disablePagination = false,
  renderSubRow,
  canExpandRow,
  meta,
  toolbar,
  loadingText = 'Cargando datos...',
  emptyText = 'No se encontraron resultados...',
  overflowVisible = false,
  pageSize = 10,
  persistKey,
  manualPagination = false,
  totalRows,
  pageCount,
  pageIndex,
  onPaginationChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const persistedPageSize = useComprasPageSize((s) =>
    persistKey ? s.pageSizes[persistKey] : undefined,
  )
  const setPersistedPageSize = useComprasPageSize((s) => s.setPageSize)

  const [localPagination, setLocalPagination] = useState({
    pageIndex: 0,
    pageSize: persistedPageSize ?? pageSize,
  })

  const isManual = manualPagination === true

  // Stable reference to prevent useCallback dependency changes on every render
  const paginationState = useMemo(
    () =>
      isManual
        ? { pageIndex: pageIndex ?? 0, pageSize: persistedPageSize ?? pageSize }
        : localPagination,
    [isManual, pageIndex, pageSize, persistedPageSize, localPagination],
  )

  const handlePaginationChange = useCallback(
    (updater: any) => {
      if (isManual) {
        const next =
          typeof updater === 'function'
            ? updater(paginationState)
            : updater
        if (persistKey && next.pageSize !== paginationState.pageSize) {
          setPersistedPageSize(persistKey, next.pageSize)
        }
        onPaginationChange?.(next.pageIndex, next.pageSize)
      } else {
        setLocalPagination((prev: typeof localPagination) => {
          const next = typeof updater === 'function' ? updater(prev) : updater
          if (persistKey && next.pageSize !== prev.pageSize) {
            setPersistedPageSize(persistKey, next.pageSize)
          }
          return next
        })
      }
    },
    [isManual, paginationState, onPaginationChange, persistKey, setPersistedPageSize],
  )

  const stableData = useMemo(() => data, [data])

  const table = useReactTable({
    data: stableData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      pagination: paginationState,
    },
    meta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isManual ? undefined : getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    rowCount: isManual ? (totalRows ?? 0) : undefined,
    pageCount: isManual ? (pageCount ?? 0) : undefined,
    getRowCanExpand: (row) => {
      if (!renderSubRow) return false
      return canExpandRow?.(row) ?? true
    },
  })

  const rows = table.getRowModel().rows
  const isEmpty = rows.length === 0

  return (
    <div className="flex flex-col gap-4">

      {toolbar && (
        <div className="flex items-center justify-between gap-2">
          {toolbar}
        </div>
      )}

      <div
        className={`
          rounded-xl border
          ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}
          bg-white dark:bg-slate-900/60
          border-slate-200 dark:border-slate-700/60
        `}
      >
        <Table className="table-fixed">

          <TableHeader className="sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="
                  bg-slate-50 dark:bg-slate-800/70
                  border-b border-slate-200 dark:border-slate-700/60
                "
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="
                      py-3
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-muted-foreground
                    "
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {loadingText}
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const canExpand = row.getCanExpand()

                return (
                  <React.Fragment key={row.id}>

                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => {
                        if (canExpand) {
                          row.toggleExpanded()
                        }
                      }}
                      className={`
                        border-b border-slate-200/70 dark:border-slate-700/50
                        hover:bg-slate-50 dark:hover:bg-slate-800/60
                        transition-colors
                        ${canExpand ? 'cursor-pointer select-none' : ''}
                      `}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="py-2 text-sm leading-tight"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {row.getIsExpanded() && renderSubRow && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={columns.length}
                          className="p-0 border-b border-border/40"
                        >
                          <div
                            className="
                              pl-10 pr-4 py-3
                              bg-muted/20
                              border-l-2
                              border-emerald-300 dark:border-emerald-200
                            "
                          >
                            {renderSubRow(row)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                  </React.Fragment>
                )
              })
            )}
          </TableBody>

        </Table>
      </div>

      {!disablePagination && (
        <DataTablePagination table={table} />
      )}

    </div>
  )
}

export const DataTable = React.memo(DataTableInner) as <TData>(
  props: DataTableProps<TData>,
) => React.ReactElement