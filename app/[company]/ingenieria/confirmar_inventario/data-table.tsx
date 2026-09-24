"use client";

import {
  ColumnFiltersState,
  flexRender,
  type RowData,
  RowSelectionState,
  SortingState,
  type Updater,
  useTable,
  ColumnVisibilityState,
} from "@tanstack/react-table";
import { appTableFeatures, type AppColumnDef } from "@/lib/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  onSelectionChange?: (ids: number[]) => void;
  selectionResetKey?: number;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  onSelectionChange,
  selectionResetKey,
}: DataTableProps<TData>) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // `getRowId` usa el id del artículo, así que las claves de la selección ya son
  // los ids; se filtran contra `data` para no arrastrar filas de otra categoría.
  const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
    const next =
      typeof updater === "function" ? updater(rowSelection) : updater;
    setRowSelection(next);

    if (!onSelectionChange) return;
    const visibleIds = new Set(
      data.map((row) => String((row as { id?: number | string }).id)),
    );
    onSelectionChange(
      Object.keys(next)
        .filter((key) => next[key] && visibleIds.has(key))
        .map(Number)
        .filter((id) => Number.isFinite(id)),
    );
  };

  // ============================================
  // TABLE CONFIGURATION
  // ============================================
  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    getRowId: (row, index) =>
      String((row as { id?: number | string }).id ?? index),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Se ajusta durante el render y no en un efecto: así la selección vacía sale
  // en el mismo render, sin pintar antes las filas aún marcadas.
  const [prevResetKey, setPrevResetKey] = useState(selectionResetKey);
  if (selectionResetKey !== prevResetKey) {
    setPrevResetKey(selectionResetKey);
    setRowSelection({});
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} artículo(s) total(es)
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              value={table.state.pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 w-17.5 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Página {table.state.pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
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
        </div>
      </div>
    </div>
  );
}
