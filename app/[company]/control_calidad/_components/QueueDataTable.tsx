"use client"

import React, { useEffect, useEffectEvent, useState } from "react"
import {
  ColumnFiltersState,
  flexRender,
  type RowData,
  RowSelectionState,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { appTableFeatures, type AppColumnDef } from "@/lib/table";

import { DataTablePagination } from "@/components/tables/DataTablePagination"
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface QueueDataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[]
  data: TData[]
  onSelectionChange?: (rows: TData[]) => void
  toolbar?: React.ReactNode
  getRowId?: (row: TData) => string
}

/**
 * Tabla de las colas de Control de Calidad. Si se pide, avisa de la selección
 * al padre.
 */
export function QueueDataTable<TData extends RowData>({
  columns,
  data,
  onSelectionChange,
  toolbar,
  getRowId,
}: QueueDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    getRowId: getRowId as any,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, rowSelection },
    enableRowSelection: true,
  })

  // `useTable` devuelve un objeto nuevo en cada render, así que `table` no sirve
  // como dependencia: el efecto se disparaba en cada render y, como el padre
  // guarda lo seleccionado en un estado, cada aviso lo volvía a renderizar. Ese
  // ciclo no termina nunca y deja sin turno a las navegaciones (la ruta pedida
  // desde el menú no se montaba hasta que esta tabla desaparecía). La selección
  // solo cambia cuando cambia `rowSelection` o los datos.
  const notifySelection = useEffectEvent(() => {
    onSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original))
  })

  useEffect(() => {
    notifySelection()
  }, [rowSelection, data])

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
            {table.getRowModel().rows?.length ? (
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
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
