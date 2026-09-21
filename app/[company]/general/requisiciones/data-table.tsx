"use client";

import {
  ColumnFiltersState,
  flexRender,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import {
  appTableFeatures,
  type AppColumn,
  type AppColumnDef,
} from "@/lib/table";

import { CursorPagination } from "@/components/tables/CursorPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { GeneralModuleRequisitionDialog } from "@/components/dialogs/general/GeneralModuleRequisitionDialog";
import { DownloadRequisitionsByStatusDialog } from "@/components/dialogs/general/DownloadRequisitionsByStatusDialog";
import { useAuth } from "@/contexts/AuthContext";
import type { MyRequisition } from "@/types/purchase";

// El reporte es de almacén: solo su gente y el SUPERUSER lo descargan. El
// backend aplica el mismo criterio y además acota lo que cada uno puede ver.
const REPORT_ROLES = ["JEFE_ALMACEN", "ANALISTA_ALMACEN", "SUPERUSER"];

// .table-sticky-right (globals.css) ya resuelve el fondo opaco, el tono exacto
// del hover via color-mix y el z-index del thead. Repetirlo con utilidades
// sueltas superponia dos capas translucidas y la celda quedaba mas oscura.
const isSticky = (column: AppColumn<MyRequisition, unknown>) =>
  column.columnDef.meta?.sticky === "right";

interface DataTableProps {
  columns: AppColumnDef<MyRequisition>[];
  data: MyRequisition[];
  search: string;
  onSearchChange: (value: string) => void;
  isFetching?: boolean;
  /** Primera carga: el shell se mantiene y solo el cuerpo muestra el estado. */
  loading?: boolean;
  /**
   * Cambio de página en curso: las filas visibles son todavía las de la página
   * anterior. Se atenúan para que se vea que están por reemplazarse, en vez de
   * quedar idénticas durante ~1s y parecer que la navegación no respondió.
   */
  isTransitioning?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  pageIndex: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function DataTable({
  columns,
  data,
  search,
  onSearchChange,
  isFetching = false,
  loading = false,
  isTransitioning = false,
  isError = false,
  onRetry,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
  pageIndex,
  pageSize,
  onPageSizeChange,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // La búsqueda y la paginación corren en el servidor (ver useGetMyRequisitions):
  // la tabla solo ordena y filtra por columna sobre la página ya traída.
  //
  // manualPagination: sin esto, paginatedRowModel —activo en appTableFeatures
  // para las tablas que sí paginan en cliente— recortaría la página del
  // servidor a su pageSize por defecto, mostrando 10 de las 15 filas que ya
  // llegaron.
  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination: { pageIndex: 0, pageSize },
    },
  });

  const { user } = useAuth();

  const canDownloadReport = (user?.roles ?? []).some((role) =>
    REPORT_ROLES.includes(role.name),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pt-2 pb-3">
        <GeneralModuleRequisitionDialog />

        {canDownloadReport && <DownloadRequisitionsByStatusDialog />}

        <div className="relative w-full sm:w-90 sm:ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por Nro. de solicitud, justificación o solicitante..."
            className="h-8 rounded-md border-border pl-8 pr-8 text-xs"
          />
          {isFetching ? (
            <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : search.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* aria-busy y la atenuación marcan que las filas visibles son las de la
          página anterior; pointer-events-none evita abrir el detalle de una
          fila que está a punto de ser sustituida por otra. */}
      <div
        aria-busy={isTransitioning}
        className={cn(
          "rounded-md border mb-4 transition-opacity duration-200",
          isTransitioning ? "opacity-50 pointer-events-none" : "opacity-100",
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ minWidth: header.getSize() }}
                    className={cn(
                      isSticky(header.column) && "table-sticky-right",
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
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando solicitudes...
                  </span>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-y-2">
                    <span className="text-sm text-muted-foreground">
                      Ha ocurrido un error al cargar las solicitudes de compra.
                    </span>
                    {onRetry && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                      >
                        Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ minWidth: cell.column.getSize() }}
                      className={cn(
                        isSticky(cell.column) && "table-sticky-right",
                      )}
                    >
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No se ha encontrado ningún resultado...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CursorPagination
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        isTransitioning={isTransitioning}
      />
    </div>
  );
}
