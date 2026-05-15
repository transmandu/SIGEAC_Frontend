'use client'

import React, { useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
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

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean
  costDrafts?: Record<number, any>
  type?: string
  category?: string
  disablePagination?: boolean
}

function DataTableInner<TData>({
  columns,
  data,
  loading = false,
  costDrafts,
  disablePagination = false,
}: DataTableProps<TData>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  })

  const stableData = useMemo(() => data, [data])

  const table = useReactTable({
    data: stableData,
    columns,

    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    meta: {
      costDrafts,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rows = table.getRowModel().rows
  const isEmpty = rows.length === 0

  return (
    <div className="flex flex-col gap-4">

      <div
        className="
          rounded-xl border overflow-hidden
          bg-white dark:bg-slate-900/60
          border-slate-200 dark:border-slate-700/60
        "
      >

        <Table>

          {/* HEADER */}
          <TableHeader className="sticky top-0">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="
                  bg-slate-50 dark:bg-slate-800/70
                  border-b border-slate-200 dark:border-slate-700/60
                "
              >
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="
                      text-[11px] font-semibold uppercase tracking-wide
                      text-muted-foreground
                      py-3
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

          {/* BODY */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Sin registros
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="
                    border-b border-slate-200/70 dark:border-slate-700/50
                    hover:bg-slate-50 dark:hover:bg-slate-800/60
                    transition-colors
                  "
                >
                  {row.getVisibleCells().map(cell => (
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
              ))
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

export const DataTable = React.memo(DataTableInner) as typeof DataTableInner