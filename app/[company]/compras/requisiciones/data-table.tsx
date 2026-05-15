'use client'

import React, { useMemo, useState } from 'react'
import { ColumnDef, ColumnFiltersState, ExpandedState, Row, SortingState, VisibilityState, flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { DataTablePagination } from '@/components/tables/DataTablePagination'
import { CreateRequisitionDialog } from '@/components/dialogs/mantenimiento/compras/CreateRequisitionDialog'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  renderSubRow?: ( row: Row<TData> ) => React.ReactNode
  canExpandRow?: ( row: Row<TData> ) => boolean
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  loading = false,
  renderSubRow,
  canExpandRow,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 15,
    })

  const stableData = useMemo( () => data, [data] )

  const table = useReactTable({
    data: stableData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => {
      if (!renderSubRow) return false
      return canExpandRow?.(row) ?? true
    },
  })

  const rows = table.getRowModel().rows
  const isEmpty = rows.length === 0

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreateRequisitionDialog />
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60"
      >

        <Table>

          <TableHeader className="sticky top-0">
            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className=" bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
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
                  Cargando requisiciones...
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron requisiciones.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {

                const canExpand = row.getCanExpand()

                return (
                  <React.Fragment
                    key={row.id}
                  >

                    <TableRow
                      data-state={
                        row.getIsSelected() &&
                        'selected'
                      }

                      onClick={() => {
                        if (canExpand) {
                          row.toggleExpanded()
                        }
                      }}

                      className={`border-b border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors
                        ${
                          canExpand
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                      `}
                    >
                      {row
                        .getVisibleCells()
                        .map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-2 text-sm leading-tight"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                    </TableRow>

                    {row.getIsExpanded() &&
                      renderSubRow && (
                        <TableRow
                          className="hover:bg-transparent"
                        >
                          <TableCell
                            colSpan={
                              columns.length
                            }
                            className="p-0 border-b border-border/40"
                          >
                            <div
                              className="pl-10 pr-4 py-3 bg-muted/20 border-l-2 border-emerald-300 dark:border-emerald-200"
                            >
                              {renderSubRow(
                                row
                              )}
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

      <DataTablePagination table={table} />

    </div>
  )
}

export const DataTable = React.memo(
  DataTableInner
) as typeof DataTableInner