"use client";

import React, { useMemo, useState } from "react";
import {
  ColumnFiltersState,
  flexRender,
  type RowData,
  SortingState,
  useTable,
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
import { CreateConditionDialog } from "@/components/dialogs/ajustes/CreateConditionDialog";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
}

function DataTableInner<TData extends RowData>({
  columns,
  data,
  loading = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const stableData = useMemo(() => data, [data]);

  const table = useTable({
    features: appTableFeatures,
    data: stableData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  const rows = table.getRowModel().rows;
  const isEmpty = rows.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2" data-tour="condiciones-new">
          <CreateConditionDialog />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div
        className="rounded-xl border overflow-hidden bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60"
        data-tour="condiciones-table"
      >
        <Table>
          {/* HEADER */}
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60"
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
                          header.getContext(),
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
                  Cargando condiciones...
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se han encontrado condiciones.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-2 text-sm leading-tight"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div data-tour="condiciones-pagination">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

export const DataTable = React.memo(DataTableInner) as typeof DataTableInner;
