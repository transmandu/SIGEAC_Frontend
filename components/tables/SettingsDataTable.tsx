"use client";

import React, { useMemo, useState } from "react";
import {
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  type RowData,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { Inbox, RefreshCw, SearchX, TriangleAlert } from "lucide-react";
import { appTableFeatures, type AppColumnDef } from "@/lib/table";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SettingsDataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  /** Primera carga: el esqueleto vive dentro de la tabla, la página ya está pintada. */
  loading?: boolean;
  /** La carga falló: se muestra el error dentro de la tabla, no una tabla vacía. */
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  /** Texto cuando no hay registros en absoluto. */
  emptyMessage?: string;
  /** Hay un filtro/búsqueda activo: vacío significa "sin coincidencias", no "sin datos". */
  filtered?: boolean;
  /** Botón/diálogo de creación; queda sobre la tabla, a la izquierda. */
  actions?: React.ReactNode;
  /** Prefijo de los `data-tour` (`-new`, `-table`, `-pagination`). */
  tourPrefix?: string;
  pageSize?: number;
  /** Con subfila, la fila entera se expande al hacer clic. */
  renderSubRow?: (row: TData) => React.ReactNode;
  /** `data-tour` extra del cuerpo, para tours que señalan las filas. */
  bodyTourId?: string;
}

const SKELETON_ROWS = 5;

function TableMessage({
  colSpan,
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
}: {
  colSpan: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-48">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div
            className={
              tone === "error"
                ? "flex size-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500"
                : "flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-muted-foreground"
            }
          >
            <Icon className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="max-w-sm text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {action}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function SettingsDataTable<TData extends RowData>({
  columns,
  data,
  loading = false,
  error = false,
  errorMessage = "No se pudo cargar la información.",
  onRetry,
  emptyMessage = "No se encontraron resultados.",
  filtered = false,
  actions,
  tourPrefix,
  pageSize = 15,
  renderSubRow,
  bodyTourId,
}: SettingsDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const stableData = useMemo(() => data, [data]);

  const table = useTable({
    features: appTableFeatures,
    data: stableData,
    columns,
    state: { sorting, columnFilters, pagination, expanded },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => !!renderSubRow,
  });

  const rows = table.getRowModel().rows;
  const hasColumnFilters = columnFilters.length > 0;
  const tour = (suffix: string) =>
    tourPrefix ? `${tourPrefix}-${suffix}` : undefined;

  const showSkeleton = loading;
  const showError = !loading && error;
  const showEmpty = !loading && !error && rows.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {actions && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2" data-tour={tour("new")}>
            {actions}
          </div>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60"
        data-tour={tour("table")}
      >
        <Table className="table-fixed">
          <TableHeader className="sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
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

          <TableBody data-tour={bodyTourId}>
            {showSkeleton ? (
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-transparent border-b border-slate-200/70 dark:border-slate-700/50"
                >
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="py-3">
                      <Skeleton className="mx-auto h-4 w-3/4 max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showError ? (
              <TableMessage
                colSpan={columns.length}
                icon={TriangleAlert}
                tone="error"
                title={errorMessage}
                description="Revisa tu conexión e inténtalo de nuevo."
                action={
                  onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 h-8 gap-2"
                      onClick={onRetry}
                    >
                      <RefreshCw className="size-3.5" />
                      Reintentar
                    </Button>
                  )
                }
              />
            ) : showEmpty ? (
              filtered || hasColumnFilters ? (
                <TableMessage
                  colSpan={columns.length}
                  icon={SearchX}
                  title="Sin coincidencias"
                  description="Ningún registro coincide con la búsqueda o los filtros aplicados."
                  action={
                    hasColumnFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 h-8"
                        onClick={() => table.resetColumnFilters()}
                      >
                        Limpiar filtros de columna
                      </Button>
                    )
                  }
                />
              ) : (
                <TableMessage
                  colSpan={columns.length}
                  icon={Inbox}
                  title={emptyMessage}
                />
              )
            ) : (
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={
                      renderSubRow ? row.getToggleExpandedHandler() : undefined
                    }
                    className={
                      renderSubRow
                        ? "cursor-pointer border-b border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        : "border-b border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    }
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

                  {renderSubRow && row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length}
                        className="p-0 border-b border-border/40"
                      >
                        <div className="pl-10 pr-4 py-3 bg-slate-50/40 dark:bg-slate-900/20 border-l-2 border-blue-300 dark:border-blue-400">
                          {renderSubRow(row.original)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!showSkeleton && !showError && (
        <div data-tour={tour("pagination")}>
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
