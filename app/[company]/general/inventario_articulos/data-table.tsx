"use client";

import { flexRender, type RowData, useTable } from "@tanstack/react-table";
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

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  /** Paginación por cursor del servidor; `summary` lleva el total. */
  pagination: CursorPaginationState & { summary?: string };
  isFetching?: boolean;
}

/**
 * Tabla de consulta de la compañía. Búsqueda, filtros y paginación los
 * resuelve el servidor, así que aquí no se ordena ni se filtra la página.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  pagination,
  isFetching = false,
}: DataTableProps<TData>) {
  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    manualSorting: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 100 },
    },
  });

  return (
    <div className="space-y-4">
      <div className="relative rounded-md border">
        {isFetching && (
          <div className="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-muted">
            <div className="h-full w-1/4 animate-indeterminate bg-primary" />
          </div>
        )}
        <Table className={cn("transition-opacity", isFetching && "opacity-60")}>
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
                <TableRow key={row.id}>
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
