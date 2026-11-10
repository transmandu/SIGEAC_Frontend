"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  type RowData,
  SortingState,
  useTable,
  ColumnVisibilityState,
} from "@tanstack/react-table";
import { appTableFeatures, type AppColumnDef, type AppRow } from "@/lib/table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AlertTriangle, SearchX } from "lucide-react";
import { MobileSortControl } from "@/components/tables/MobileSortControl";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/misc/EmptyState";
import { CursorPagination } from "@/components/tables/CursorPagination";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { cn } from "@/lib/utils";
import { useComprasPageSize } from "./use-compras-page-size";

const SKELETON_ROWS = 6;

/** Referencia estable: un `[]` nuevo en cada render reiniciaría el row model. */
const NO_SORTING: SortingState = [];

/**
 * Debajo de `md` cada fila se redibuja como tarjeta, solo con CSS: el DOM es el
 * mismo, así que no se duplican diálogos ni menús. Cada celda toma su rótulo de
 * `meta.title`. A diferencia de la tabla de ajustes, la de compras trae
 * columnas anchas (justificaciones, motivos), una vista previa y estados con
 * borrador, de modo que la tarjeta tiene su propia distribución:
 * título + vista previa y acciones arriba, campos en dos columnas, textos
 * largos a todo el ancho y, si hay detalle, una franja al pie.
 */
const MOBILE_ROW =
  "max-md:relative max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-3 max-md:rounded-xl max-md:border! max-md:border-slate-200 max-md:bg-white max-md:p-4 dark:max-md:border-slate-700/60 dark:max-md:bg-slate-900/60";

const MOBILE_ENTER = "motion-safe:max-md:animate-card-in";

/**
 * `:active` sube a los ancestros: sin el `:has`, pulsar un botón de la fila
 * también hundiría la tarjeta entera.
 */
const MOBILE_PRESS =
  "max-md:touch-manipulation max-md:[-webkit-tap-highlight-color:transparent] max-md:transition-[background-color,border-color,scale] max-md:duration-150 max-md:[&:active:not(:has(:is(button,a,[role=button]):active))]:bg-slate-50 dark:max-md:[&:active:not(:has(:is(button,a,[role=button]):active))]:bg-slate-800/60";

const MOBILE_PRESS_SCALE =
  "max-md:[&:active:not(:has(:is(button,a,[role=button]):active))]:scale-[0.985]";

/** Las celdas vienen centradas para la tabla; en la tarjeta se leen a la izquierda. */
const MOBILE_LEFT =
  "max-md:wrap-anywhere max-md:[&_.justify-center]:justify-start max-md:[&_.text-center]:text-left max-md:[&_.flex-col.items-center]:items-start";

const MOBILE_FIELD_LABEL =
  "max-md:before:content-[attr(data-label)] max-md:before:text-[11px] max-md:before:font-semibold max-md:before:uppercase max-md:before:tracking-wide max-md:before:text-muted-foreground";

const CHROME_IDS = new Set([
  "expander",
  "preview",
  "actions",
  "edit_info",
  "history",
]);

function mobileCellClass({
  columnId,
  role,
  isTitle,
  hasLabel,
  hasOrder,
  center,
  hasCorner,
}: {
  columnId: string;
  role?: "wide" | "hidden" | "action" | "preview" | "corner";
  isTitle: boolean;
  hasLabel: boolean;
  hasOrder: boolean;
  center: boolean;
  /** La tarjeta lleva un dato en la esquina: el título le deja sitio. */
  hasCorner: boolean;
}) {
  if (role === "action") {
    return "max-md:order-last max-md:col-span-2 max-md:p-0 max-md:[&>div]:w-full max-md:[&_button]:w-full";
  }
  // La franja de detalle cierra la tarjeta: va después del botón de acción
  // (`order-last`), que en el DOM viene después del expansor.
  if (columnId === "expander") {
    return "max-md:hidden max-md:data-[can-expand=true]:flex max-md:order-10000 max-md:col-span-2 max-md:items-center max-md:gap-1 max-md:border-t max-md:border-slate-200/70 max-md:p-0 max-md:pt-3 dark:max-md:border-slate-700/50 max-md:before:text-xs max-md:before:font-medium max-md:before:text-muted-foreground max-md:before:content-[attr(data-label)] max-md:[&>div]:w-auto";
  }
  if (
    columnId === "actions" ||
    columnId === "edit_info" ||
    columnId === "history"
  ) {
    return "max-md:absolute max-md:right-2 max-md:top-2 max-md:p-0 max-md:[&>div]:w-auto";
  }
  if (columnId === "preview" || role === "preview") {
    return "max-md:absolute max-md:right-11 max-md:top-2.5 max-md:p-0 max-md:[&>div]:w-auto";
  }
  if (role === "corner") {
    return "max-md:absolute max-md:right-3 max-md:top-3.5 max-md:p-0 max-md:[&>div]:w-auto";
  }
  if (role === "hidden") return "max-md:hidden";
  if (isTitle) {
    return cn(
      "max-md:col-span-2 max-md:p-0 max-md:text-base max-md:font-semibold",
      hasCorner ? "max-md:pr-36" : "max-md:pr-24",
      MOBILE_LEFT,
    );
  }
  return cn(
    "max-md:flex max-md:min-w-0 max-md:flex-col max-md:gap-1 max-md:p-0",
    role === "wide" && "max-md:col-span-2",
    hasOrder && "max-md:order-(--mobile-order)",
    hasLabel && MOBILE_FIELD_LABEL,
    center ? "max-md:items-center max-md:text-center" : MOBILE_LEFT,
  );
}

export interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData, any>[];
  data: TData[];
  loading?: boolean;
  /** La consulta falló: se muestra el error en vez de "sin resultados". */
  error?: boolean;
  errorText?: string;
  disablePagination?: boolean;
  renderSubRow?: (row: AppRow<TData>) => React.ReactNode;
  canExpandRow?: (row: AppRow<TData>) => boolean;
  /**
   * Marca una fila como la que se está revisando ("active"), la última que se
   * revisó ("recent") o la que está dejando de estarlo ("fading"): fondo suave
   * y una barra en el borde izquierdo, que en "fading" se apagan poco a poco.
   */
  getRowMark?: (original: TData) => "active" | "recent" | "fading" | undefined;
  /** Pass arbitrary meta to the table instance (e.g. { costDrafts }) */
  meta?: Record<string, unknown>;
  /** Custom slot rendered above the table (e.g. toolbar buttons) */
  toolbar?: React.ReactNode;
  /** Text shown while loading */
  loadingText?: string;
  /** Text shown when data is empty */
  emptyText?: string;
  /** Whether the table container uses overflow-visible instead of overflow-hidden */
  overflowVisible?: boolean;
  /** Default page size */
  pageSize?: number;
  /** When set, the selected page size is persisted per-user (localStorage) under this key and restored on future visits, overriding `pageSize` */
  persistKey?: string;
  // ── Manual (server‑side) pagination ──────────────────────────
  /** Enable manual pagination – page / row count are controlled externally */
  manualPagination?: boolean;
  /** Total number of rows across all pages (required when manualPagination) */
  totalRows?: number;
  /** Total number of pages (required when manualPagination) */
  pageCount?: number;
  /** Current page index (0‑based), required when manualPagination */
  pageIndex?: number;
  /** Called when the user changes page or page size */
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  // ── Cursor (server‑side) pagination ──────────────────────────
  /**
   * Navegación por cursor en vez de por número de página. Un cursor solo sabe
   * moverse un paso adelante o atrás y no conoce el total, así que sustituye a
   * DataTablePagination por CursorPagination en lugar de convivir con ella.
   */
  cursorPagination?: {
    onNextPage: () => void;
    onPrevPage: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    pageIndex: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    /**
     * La página pedida aún no llega y se ven las filas de la anterior: se
     * atenúan para que la navegación no parezca no haber respondido.
     */
    isTransitioning?: boolean;
    /** Total bajo los filtros vigentes, contado por el servidor. */
    summary?: string;
  };
}

function DataTableInner<TData extends RowData>({
  columns,
  data,
  loading = false,
  error = false,
  errorText = "Intente de nuevo en unos instantes.",
  disablePagination = false,
  renderSubRow,
  canExpandRow,
  getRowMark,
  meta,
  toolbar,
  loadingText = "Cargando datos...",
  emptyText = "No se encontraron resultados",
  overflowVisible = false,
  pageSize = 10,
  persistKey,
  manualPagination = false,
  totalRows,
  pageCount,
  pageIndex,
  onPaginationChange,
  cursorPagination,
}: DataTableProps<TData>) {
  const persistedSorting = useComprasPageSize((s) =>
    persistKey ? s.sortings?.[persistKey] : undefined,
  );
  const setPersistedSorting = useComprasPageSize((s) => s.setSorting);
  const [localSorting, setLocalSorting] = useState<SortingState>([]);

  // Con `persistKey` el orden vive en el almacén y no en el estado de esta
  // tabla: así todas las instancias de la misma pantalla (p. ej. los grupos de
  // una vista agrupada) comparten un único orden, y sobrevive a recargas y al
  // cambio entre escritorio y móvil.
  const sorting = persistKey ? (persistedSorting ?? NO_SORTING) : localSorting;

  const setSorting = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (persistKey) setPersistedSorting(persistKey, next);
      else setLocalSorting(next);
    },
    [sorting, persistKey, setPersistedSorting],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const persistedPageSize = useComprasPageSize((s) =>
    persistKey ? s.pageSizes[persistKey] : undefined,
  );
  const setPersistedPageSize = useComprasPageSize((s) => s.setPageSize);

  const [localPagination, setLocalPagination] = useState({
    pageIndex: 0,
    pageSize: persistedPageSize ?? pageSize,
  });

  // El cursor también es paginación de servidor: sin declararlo, el row model
  // recortaría la página recibida a su propio pageSize por defecto y se verían
  // 10 de las 15 filas que ya llegaron.
  const isCursor = !!cursorPagination;
  const isManual = manualPagination === true || isCursor;

  // Stable reference to prevent useCallback dependency changes on every render
  const paginationState = useMemo(() => {
    // Con cursor el tamaño lo manda el hook, no el valor persistido: es el que
    // se usó para pedir la página que ya está en pantalla.
    if (isCursor) {
      return { pageIndex: 0, pageSize: cursorPagination.pageSize };
    }

    return isManual
      ? { pageIndex: pageIndex ?? 0, pageSize: persistedPageSize ?? pageSize }
      : localPagination;
  }, [
    isCursor,
    cursorPagination,
    isManual,
    pageIndex,
    pageSize,
    persistedPageSize,
    localPagination,
  ]);

  const handlePaginationChange = useCallback(
    (updater: any) => {
      if (isManual) {
        const next =
          typeof updater === "function" ? updater(paginationState) : updater;
        if (persistKey && next.pageSize !== paginationState.pageSize) {
          setPersistedPageSize(persistKey, next.pageSize);
        }
        onPaginationChange?.(next.pageIndex, next.pageSize);
      } else {
        setLocalPagination((prev: typeof localPagination) => {
          const next = typeof updater === "function" ? updater(prev) : updater;
          if (persistKey && next.pageSize !== prev.pageSize) {
            setPersistedPageSize(persistKey, next.pageSize);
          }
          return next;
        });
      }
    },
    [
      isManual,
      paginationState,
      onPaginationChange,
      persistKey,
      setPersistedPageSize,
    ],
  );

  const stableData = useMemo(() => data, [data]);

  const table = useTable({
    features: appTableFeatures,
    data: stableData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      pagination: paginationState,
    },
    meta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    onPaginationChange: handlePaginationChange,
    // v9 trae el row model en el bundle de features: la paginación de
    // servidor se declara, no se logra omitiéndolo.
    manualPagination: isManual,
    rowCount: isManual ? (totalRows ?? 0) : undefined,
    pageCount: isManual ? (pageCount ?? 0) : undefined,
    getRowCanExpand: (row) => {
      if (!renderSubRow) return false;
      return canExpandRow?.(row) ?? true;
    },
  });

  const rows = table.getRowModel().rows;
  const isEmpty = rows.length === 0;

  // Encabeza la tarjeta móvil: la columna marcada con `mobileTitle` o, si no
  // hay, la primera visible con rótulo que no sea de controles.
  const visibleColumns = table.getVisibleLeafColumns();
  const titleColumnId = (
    visibleColumns.find((column) => column.columnDef.meta?.mobileTitle) ??
    visibleColumns.find(
      (column) =>
        !CHROME_IDS.has(column.id) &&
        column.columnDef.meta?.title &&
        column.columnDef.meta?.mobile !== "hidden" &&
        column.columnDef.meta?.mobile !== "preview" &&
        column.columnDef.meta?.mobile !== "corner",
    )
  )?.id;
  const hasCorner = visibleColumns.some(
    (column) => column.columnDef.meta?.mobile === "corner",
  );

  // El encabezado (y con él el menú de orden) no existe en móvil: sin este
  // selector el orden elegido en escritorio seguiría aplicándose sin poder
  // verlo ni quitarlo.
  const sortableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanSort() && column.columnDef.meta?.title);

  return (
    <div className="flex flex-col gap-4">
      {toolbar && (
        <div className="flex items-center justify-between gap-2">{toolbar}</div>
      )}

      {/* aria-busy y la atenuación marcan que las filas visibles son las de la
          página anterior; pointer-events-none evita desplegar una fila que está
          a punto de ser sustituida por otra. */}
      {sortableColumns.length > 0 && (
        <div className="md:hidden">
          <MobileSortControl
            options={sortableColumns.map((column) => ({
              id: column.id,
              title: column.columnDef.meta?.title ?? column.id,
            }))}
            value={sorting[0]}
            onChange={(next) => setSorting(next ? [next] : [])}
          />
        </div>
      )}

      <div
        aria-busy={cursorPagination?.isTransitioning ?? false}
        className={`
          rounded-xl border
          ${overflowVisible ? "overflow-visible" : "overflow-hidden"}
          bg-white dark:bg-slate-900/60
          border-slate-200 dark:border-slate-700/60
          max-md:overflow-visible max-md:border-0 max-md:bg-transparent dark:max-md:bg-transparent
          transition-opacity duration-200
          ${cursorPagination?.isTransitioning ? "opacity-50 pointer-events-none" : "opacity-100"}
        `}
      >
        <Table role="table" className="table-fixed max-md:block">
          <TableHeader role="rowgroup" className="sticky top-0 max-md:hidden">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="
                  bg-slate-50 dark:bg-slate-800/70
                  border-b border-slate-200 dark:border-slate-700/60
                "
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="py-3 font-semibold text-muted-foreground"
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
            className="max-md:flex max-md:flex-col max-md:gap-3"
          >
            {loading ? (
              Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
                <TableRow
                  role="row"
                  key={rowIndex}
                  className={cn(
                    "border-b border-slate-200/70 hover:bg-transparent dark:border-slate-700/50",
                    MOBILE_ROW,
                  )}
                >
                  {columns.map((_, columnIndex) => (
                    <TableCell
                      role="cell"
                      key={columnIndex}
                      className={cn(
                        "py-3 max-md:col-span-2 max-md:p-0",
                        columnIndex >= 3 && "max-md:hidden",
                      )}
                    >
                      {rowIndex === 0 && columnIndex === 0 && (
                        <span className="sr-only" role="status">
                          {loadingText}
                        </span>
                      )}
                      <Skeleton className="h-4 w-3/4 max-md:w-2/3" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow role="row" className="max-md:block max-md:w-full">
                <TableCell
                  role="cell"
                  colSpan={columns.length}
                  className="h-40 max-md:flex max-md:h-[max(12rem,calc(100dvh-30rem))] max-md:items-center max-md:justify-center"
                >
                  <EmptyState
                    icon={AlertTriangle}
                    tone="error"
                    title="No se pudo cargar la información"
                    description={errorText}
                  />
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow
                role="row"
                className="hover:bg-transparent max-md:block max-md:w-full"
              >
                <TableCell
                  role="cell"
                  colSpan={columns.length}
                  className="h-40 max-md:flex max-md:h-[max(12rem,calc(100dvh-30rem))] max-md:items-center max-md:justify-center"
                >
                  <EmptyState icon={SearchX} title={emptyText} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => {
                const canExpand = row.getCanExpand();

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      role="row"
                      data-state={row.getIsSelected() && "selected"}
                      data-mark={getRowMark?.(row.original)}
                      style={{
                        animationDelay: `${Math.min(rowIndex, 6) * 45}ms`,
                      }}
                      onClick={() => {
                        if (canExpand) {
                          row.toggleExpanded();
                        }
                      }}
                      className={cn(
                        `border-b border-slate-200/70 dark:border-slate-700/50
                        hover:bg-slate-50 dark:hover:bg-slate-800/60
                        transition-colors
                        [&>td:first-child]:transition-shadow [&>td:first-child]:duration-500
                        data-[mark=active]:bg-primary/6 data-[mark=active]:hover:bg-primary/6
                        data-[mark=recent]:bg-primary/3 data-[mark=recent]:hover:bg-primary/5
                        md:data-[mark=active]:[&>td:first-child]:shadow-[inset_2px_0_0_0_var(--color-primary)]
                        md:data-[mark=recent]:[&>td:first-child]:shadow-[inset_2px_0_0_0_color-mix(in_oklab,var(--color-primary)_45%,transparent)]
                        data-[mark=fading]:bg-transparent data-[mark=fading]:duration-2500
                        md:data-[mark=fading]:[&>td:first-child]:shadow-[inset_2px_0_0_0_transparent] data-[mark=fading]:[&>td:first-child]:duration-2500
                        max-md:data-[mark=active]:border-primary/50! max-md:data-[mark=recent]:border-primary/30!`,
                        canExpand && "cursor-pointer select-none",
                        canExpand && MOBILE_PRESS,
                        canExpand && !row.getIsExpanded() && MOBILE_PRESS_SCALE,
                        MOBILE_ROW,
                        MOBILE_ENTER,
                        canExpand &&
                          row.getIsExpanded() &&
                          "max-md:rounded-b-none max-md:border-b-0!",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const columnId = cell.column.id;
                        const meta = cell.column.columnDef.meta;
                        const label =
                          CHROME_IDS.has(columnId) ||
                          meta?.mobile === "preview" ||
                          meta?.mobile === "corner"
                            ? undefined
                            : meta?.title;
                        const isTitle = columnId === titleColumnId;

                        return (
                          <TableCell
                            role="cell"
                            key={cell.id}
                            data-label={
                              columnId === "expander"
                                ? `${row.getIsExpanded() ? "Ocultar" : "Ver"} ${meta?.title ?? "detalle"}`
                                : isTitle
                                  ? undefined
                                  : label
                            }
                            data-can-expand={row.getCanExpand()}
                            data-expanded={row.getIsExpanded()}
                            style={
                              {
                                "--col-w": `${cell.column.getSize()}px`,
                                "--mobile-order": meta?.mobileOrder,
                              } as React.CSSProperties
                            }
                            className={cn(
                              "py-2 text-sm leading-tight md:w-(--col-w)",
                              mobileCellClass({
                                columnId,
                                role: meta?.mobile,
                                isTitle,
                                hasLabel: !!label,
                                hasOrder: meta?.mobileOrder !== undefined,
                                center: meta?.mobileAlign === "center",
                                hasCorner,
                              }),
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

                    {row.getIsExpanded() && renderSubRow && (
                      <TableRow
                        role="row"
                        className="hover:bg-transparent motion-safe:max-md:animate-reveal max-md:-mt-3 max-md:block max-md:overflow-hidden max-md:rounded-b-xl max-md:border max-md:border-t-0 max-md:border-slate-200 dark:max-md:border-slate-700/60 max-md:bg-white dark:max-md:bg-slate-900/60"
                      >
                        <TableCell
                          role="cell"
                          colSpan={columns.length}
                          className="p-0 border-b border-border/40 max-md:block max-md:border-b-0"
                        >
                          <div className="pl-10 pr-4 py-3 bg-muted/20 border-l-2 border-primary/40 max-md:pl-3 max-md:pr-3">
                            {renderSubRow(row)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!disablePagination &&
        (cursorPagination ? (
          <CursorPagination
            onPrevPage={cursorPagination.onPrevPage}
            onNextPage={cursorPagination.onNextPage}
            hasPrevPage={cursorPagination.hasPrevPage}
            hasNextPage={cursorPagination.hasNextPage}
            pageIndex={cursorPagination.pageIndex}
            pageSize={cursorPagination.pageSize}
            onPageSizeChange={cursorPagination.onPageSizeChange}
            isTransitioning={cursorPagination.isTransitioning}
            summary={cursorPagination.summary}
          />
        ) : (
          <DataTablePagination table={table} />
        ))}
    </div>
  );
}

export const DataTable = React.memo(DataTableInner) as <TData extends RowData>(
  props: DataTableProps<TData>,
) => React.ReactElement;
