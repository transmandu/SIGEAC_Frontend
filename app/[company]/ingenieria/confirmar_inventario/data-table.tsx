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
import { CursorPagination } from "@/components/tables/CursorPagination";
import type { CursorPaginationState } from "@/hooks/helpers/useCursorListing";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  onSelectionChange?: (ids: number[]) => void;
  /**
   * Cambiarla vacía la selección. Incluye la página: la aceptación masiva solo
   * actúa sobre lo que está a la vista.
   */
  selectionResetKey?: string | number;
  /** Paginación por cursor del servidor; `summary` lleva el total. */
  pagination: CursorPaginationState & { summary?: string };
  isFetching?: boolean;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  onSelectionChange,
  selectionResetKey,
  pagination,
  isFetching = false,
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
    initialState: {
      pagination: { pageIndex: 0, pageSize: 100 },
    },
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
      <div className="relative rounded-md border">
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

      <CursorPagination {...pagination} />
    </div>
  );
}
