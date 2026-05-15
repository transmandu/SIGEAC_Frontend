'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import React, { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/tables/DataTablePagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderSubRow?: (row: Row<TData>) => React.ReactNode
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  renderSubRow,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})
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
      columnFilters,
      expanded,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),

    getRowCanExpand: () => !!renderSubRow,
  })

  const rows = table.getRowModel().rows
  const isEmpty = rows.length === 0

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-between"></div>

      <div className="
        rounded-xl border overflow-hidden
        bg-white dark:bg-slate-900/60
        border-slate-200 dark:border-slate-700/60
      ">
        <Table>
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

            {isEmpty && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se ha encontrado ningún resultado...
                </TableCell>
              </TableRow>
            )}

            {rows.map(row => (
              <React.Fragment key={row.id}>

                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => renderSubRow && row.toggleExpanded()}
                  className={`
                    border-b border-slate-200/70 dark:border-slate-700/50
                    hover:bg-slate-50 dark:hover:bg-slate-800/60
                    transition-colors
                    ${renderSubRow ? 'cursor-pointer select-none' : ''}
                  `}
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
            ))}

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