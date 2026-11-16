"use client";

import {
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  type RowData,
  SortingState,
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
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { useState } from "react";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
}

export function DataTable<TData extends RowData>({
  columns,
  data,
}: DataTableProps<TData>) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({}); // {} = todas colapsadas por defecto

  // ============================================
  // TABLE CONFIGURATION
  // ============================================
  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getSubRows: (row: any) => row.subRows,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
  });

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
                  className={row.depth > 0 ? "bg-muted/30" : ""}
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
                  No hay registros de historial de vuelo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
