"use client"

import React, { useEffect, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/tables/DataTablePagination"
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onSelectionChange?: (rows: TData[]) => void
  toolbar?: React.ReactNode
  getRowId?: (row: TData) => string
  groupBy?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
  toolbar,
  getRowId,
  groupBy,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId as any,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, rowSelection },
    enableRowSelection: true,
  })

  useEffect(() => {
    if (!onSelectionChange) return
    const selected = table.getSelectedRowModel().rows.map((r) => r.original)
    onSelectionChange(selected)
  }, [rowSelection, onSelectionChange, table])

  const renderGroupedBody = () => {
    const rows = table.getRowModel().rows
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
            No se ha encontrado ningún resultado...
          </TableCell>
        </TableRow>
      )
    }

    const map = new Map<string, typeof rows>()

    for (const row of rows) {
      const key = String((row.original as any)[groupBy!] ?? "")
      if (!key) {
        if (!map.has("\x00")) map.set("\x00", [])
        map.get("\x00")!.push(row)
        continue
      }
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    }

    const sections: React.ReactNode[] = []

    Array.from(map.entries()).forEach(([key, groupRows]) => {
      if (key === "\x00" || groupRows.length < 2) {
        groupRows.forEach((row) => {
          sections.push(
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          )
        })
      } else {
        sections.push(
          <TableRow key={`group-${key}`} className="bg-muted/30 hover:bg-muted/50">
            <TableCell colSpan={columns.length} className="font-semibold py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Orden: {key}</span>
                <Badge variant="secondary" className="text-xs">
                  {groupRows.length} {groupRows.length === 1 ? "artículo" : "artículos"}
                </Badge>
              </div>
            </TableCell>
          </TableRow>
        )
        groupRows.forEach((row) => {
          sections.push(
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          )
        })
      }
    })

    return sections
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-3">
        <DataTableViewOptions table={table} />
        {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
      </div>

      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {groupBy ? renderGroupedBody() : (
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No se ha encontrado ningún resultado...
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
