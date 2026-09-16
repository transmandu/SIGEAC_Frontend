"use client"

import {
  ColumnFiltersState,
  flexRender,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { appTableFeatures, type AppColumnDef } from "@/lib/table";

import { RegisterWorkshopDispatchDialog } from "@/components/dialogs/mantenimiento/almacen/RegisterWorkshopDispatchDialog"
import { CursorPagination } from "@/components/tables/CursorPagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Search, X } from "lucide-react"
import { useState } from "react"
import type { WorkshopDispatch } from "@/hooks/mantenimiento/almacen/salida_taller/useGetWorkshopDispatches"

interface DataTableProps {
  columns: AppColumnDef<WorkshopDispatch>[]
  data: WorkshopDispatch[]
  search: string
  onSearchChange: (value: string) => void
  isFetching?: boolean
  /** Primera carga: el shell (cabecera, buscador, acciones) se mantiene y solo el cuerpo de la tabla muestra el estado de carga. */
  isLoading?: boolean
  /** El fallo también se muestra dentro del cuerpo: el buscador sigue en pantalla para corregir la consulta. */
  isError?: boolean
  onRetry?: () => void
  onNextPage: () => void
  onPrevPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
  pageIndex: number
  pageSize: number
  onPageSizeChange: (size: number) => void
}

export function DataTable({
  columns,
  data,
  search,
  onSearchChange,
  isFetching,
  isLoading = false,
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // La búsqueda y la paginación corren en el servidor (ver
  // useGetWorkshopDispatches): la tabla solo ordena/filtra por columna sobre
  // la página ya traída.
  //
  // manualPagination: sin esto, paginatedRowModel recorta la página del
  // servidor a su pageSize por defecto (10) — se mostrarían 10 de las 50
  // filas ya traídas aunque el selector dijera 50.
  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters, pagination: { pageIndex: 0, pageSize } },
  })

  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-5xl font-bold text-center">Salidas a Taller</h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Seguimiento de artículos enviados a talleres externos hasta su reingreso a inventario.
        </p>
      </div>
      <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-x-2">
          <RegisterWorkshopDispatchDialog />
        </div>

        <div className="relative w-full sm:ml-auto sm:w-90">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por artículo, N/P, serial o Nro. de solicitud..."
            className="h-10 pl-9 pr-9"
          />
          {isFetching ? (
            <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : search.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando salidas a taller...
                  </span>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-y-2">
                    <span className="text-sm text-muted-foreground">
                      Ha ocurrido un error al cargar las salidas a taller.
                    </span>
                    {onRetry && (
                      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                        Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
      <CursorPagination
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  )
}
