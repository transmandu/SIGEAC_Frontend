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
import {
  Inbox,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { appTableFeatures, type AppColumnDef } from "@/lib/table";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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

/**
 * Debajo de `md` la tabla se redibuja como tarjetas solo con CSS. El DOM es el
 * mismo: un segundo render duplicaría diálogos, menús y `data-tour`. Cada celda
 * toma su rótulo de `meta.title` vía `data-label`.
 */
const MOBILE_ROW =
  "max-md:relative max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-3 max-md:rounded-xl max-md:border! max-md:border-slate-200 max-md:bg-white max-md:p-4 dark:max-md:border-slate-700/60 dark:max-md:bg-slate-900/60";

/** Entrada escalonada (el retraso va en `style`) y respuesta al toque: sin ratón no hay `hover` que avise. */
const MOBILE_ENTER = "motion-safe:max-md:animate-card-in";

/**
 * `:active` sube a los ancestros: sin el `:has`, pulsar el menú `…` o un botón
 * de la fila también hundiría la tarjeta entera.
 */
const MOBILE_PRESS =
  "cursor-pointer max-md:touch-manipulation max-md:[-webkit-tap-highlight-color:transparent] max-md:transition-[background-color,border-color,scale] max-md:duration-150 max-md:[&:active:not(:has(:is(button,a,[role=button]):active))]:bg-slate-50 dark:max-md:[&:active:not(:has(:is(button,a,[role=button]):active))]:bg-slate-800/60";

const MOBILE_PRESS_SCALE =
  "max-md:[&:active:not(:has(:is(button,a,[role=button]):active))]:scale-[0.985]";

/** Las celdas vienen centradas para la tabla; en la tarjeta se leen a la izquierda. */
const MOBILE_LEFT =
  "max-md:wrap-anywhere max-md:[&_.justify-center]:justify-start max-md:[&_.text-center]:text-left max-md:[&_.flex-col.items-center]:items-start";

function mobileCellClass(columnId: string, label?: string, isTitle?: boolean) {
  if (columnId === "expander") {
    return "max-md:order-last max-md:col-span-2 max-md:flex max-md:items-center max-md:gap-1 max-md:border-t max-md:border-slate-200/70 max-md:p-0 max-md:pt-3 dark:max-md:border-slate-700/50 max-md:before:text-xs max-md:before:font-medium max-md:before:text-muted-foreground max-md:before:content-['Ver_detalle'] max-md:data-[expanded=true]:before:content-['Ocultar_detalle'] max-md:[&>div]:w-auto";
  }
  if (columnId === "actions") {
    return "max-md:absolute max-md:right-2 max-md:top-2 max-md:p-0 max-md:[&>div]:w-auto";
  }
  if (isTitle) {
    return cn(
      "max-md:col-span-2 max-md:p-0 max-md:pr-10 max-md:text-base",
      MOBILE_LEFT,
    );
  }
  return cn(
    "max-md:flex max-md:min-w-0 max-md:flex-col max-md:gap-1 max-md:p-0",
    label &&
      "max-md:before:content-[attr(data-label)] max-md:before:text-[11px] max-md:before:font-semibold max-md:before:uppercase max-md:before:tracking-wide max-md:before:text-muted-foreground",
    MOBILE_LEFT,
  );
}

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
    <TableRow
      role="row"
      className="hover:bg-transparent max-md:block max-md:w-full"
    >
      <TableCell
        role="cell"
        colSpan={colSpan}
        className="h-48 max-md:flex max-md:h-[max(12rem,calc(100dvh-30rem))] max-md:items-center max-md:justify-center"
      >
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
  const [controlsOpen, setControlsOpen] = useState(false);

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
  const hasSortable = table.getAllColumns().some((c) => c.getCanSort());
  const activeControls = sorting.length + columnFilters.length;
  const showControlsToggle =
    hasSortable &&
    !loading &&
    !error &&
    (data.length > 0 || activeControls > 0);
  const hasColumnFilters = columnFilters.length > 0;
  const titleColumnId = table
    .getVisibleLeafColumns()
    .find(
      (c) =>
        c.id !== "expander" && c.id !== "actions" && c.columnDef.meta?.title,
    )?.id;
  const tour = (suffix: string) =>
    tourPrefix ? `${tourPrefix}-${suffix}` : undefined;

  const showSkeleton = loading;
  const showError = !loading && error;
  const showEmpty = !loading && !error && rows.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {(actions || showControlsToggle) && (
        <div
          className={cn(
            "flex items-center justify-between gap-2 max-md:flex-wrap",
            !actions && "md:hidden",
          )}
        >
          <div className="flex items-center gap-2" data-tour={tour("new")}>
            {actions}
          </div>

          {showControlsToggle && (
            <ActionTriggerButton
              type="button"
              aria-label="Ordenar y filtrar"
              title="Ordenar y filtrar"
              className="min-w-10 shrink-0 px-2.5 md:hidden"
              aria-expanded={controlsOpen}
              onClick={() => setControlsOpen((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeControls > 0 && (
                <span className="ml-1 tabular-nums">({activeControls})</span>
              )}
            </ActionTriggerButton>
          )}
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 max-md:overflow-visible max-md:border-0 max-md:bg-transparent dark:max-md:bg-transparent"
        data-tour={tour("table")}
      >
        <Table role="table" className="table-fixed max-md:block">
          <TableHeader
            role="rowgroup"
            className={cn(
              "sticky top-0",
              controlsOpen && showControlsToggle
                ? "motion-safe:max-md:animate-reveal max-md:static max-md:mb-3 max-md:block max-md:rounded-xl max-md:border max-md:border-slate-200/40 max-md:bg-slate-200/40 dark:max-md:border-slate-700/60 dark:max-md:bg-slate-800/70"
                : "max-md:hidden",
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                role="row"
                key={headerGroup.id}
                className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60 max-md:flex max-md:bg-transparent dark:max-md:bg-transparent max-md:flex-wrap max-md:gap-1 max-md:border-b-0 max-md:p-2 max-md:hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    role="columnheader"
                    key={header.id}
                    style={
                      {
                        "--col-w": `${header.getSize()}px`,
                      } as React.CSSProperties
                    }
                    className={cn(
                      "py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:w-(--col-w) max-md:block max-md:h-auto max-md:p-0",
                      (header.isPlaceholder || !header.column.getCanSort()) &&
                        "max-md:hidden",
                    )}
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

          <TableBody
            role="rowgroup"
            data-tour={bodyTourId}
            className="max-md:flex max-md:flex-col max-md:gap-3"
          >
            {showSkeleton ? (
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow
                  role="row"
                  key={index}
                  className={cn(
                    "hover:bg-transparent border-b border-slate-200/70 dark:border-slate-700/50",
                    MOBILE_ROW,
                  )}
                >
                  {columns.map((_, cellIndex) => (
                    <TableCell
                      role="cell"
                      key={cellIndex}
                      className={cn(
                        "py-3 max-md:col-span-2 max-md:p-0",
                        cellIndex >= 3 && "max-md:hidden",
                      )}
                    >
                      <Skeleton className="mx-auto h-4 w-3/4 max-w-40 max-md:mx-0" />
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
              rows.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    role="row"
                    data-state={row.getIsSelected() && "selected"}
                    style={{
                      animationDelay: `${Math.min(rowIndex, 6) * 45}ms`,
                    }}
                    onClick={
                      renderSubRow ? row.getToggleExpandedHandler() : undefined
                    }
                    className={cn(
                      "border-b border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors",
                      renderSubRow && MOBILE_PRESS,
                      renderSubRow &&
                        !row.getIsExpanded() &&
                        MOBILE_PRESS_SCALE,
                      MOBILE_ROW,
                      MOBILE_ENTER,
                      renderSubRow &&
                        row.getIsExpanded() &&
                        "max-md:rounded-b-none max-md:border-b-0!",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const columnId = cell.column.id;
                      const isChrome =
                        columnId === "expander" || columnId === "actions";
                      const label = isChrome
                        ? undefined
                        : cell.column.columnDef.meta?.title;
                      const isTitle = columnId === titleColumnId;

                      return (
                        <TableCell
                          role="cell"
                          key={cell.id}
                          data-label={isTitle ? undefined : label}
                          data-expanded={row.getIsExpanded()}
                          className={cn(
                            "py-2 text-sm leading-tight",
                            mobileCellClass(columnId, label, isTitle),
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {renderSubRow && row.getIsExpanded() && (
                    <TableRow
                      role="row"
                      className="hover:bg-transparent motion-safe:max-md:animate-reveal max-md:-mt-3 max-md:block max-md:overflow-hidden max-md:rounded-b-xl max-md:border max-md:border-t-0 max-md:border-slate-200 dark:max-md:border-slate-700/60 max-md:bg-white dark:max-md:bg-slate-900/60"
                    >
                      <TableCell
                        role="cell"
                        colSpan={columns.length}
                        className="p-0 border-b border-border/40 max-md:block max-md:border-b-0"
                      >
                        <div className="pl-10 pr-4 py-3 bg-slate-50/40 dark:bg-slate-900/20 border-l-2 border-blue-300 dark:border-blue-400 max-md:pl-3 max-md:pr-3">
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
        <div
          data-tour={tour("pagination")}
          className={cn(rows.length === 0 && "max-md:hidden")}
        >
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}
