"use client"

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

// import { CreateBatchDialog } from "@/components/dialogs/mantenimiento/almacen/CreateBatchDialog"
import { DataTablePagination } from "@/components/tables/DataTablePagination"
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
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"
// import { RegisterDispatchRequestDialog } from "@/components/dialogs/mantenimiento/almacen/RegisterDispatchRequestDialog"
import { GeneralModuleRequisitionDialog } from "@/components/dialogs/general/GeneralModuleRequisitionDialog"
import { DownloadRequisitionsByStatusDialog } from "@/components/dialogs/general/DownloadRequisitionsByStatusDialog"
import { useAuth } from "@/contexts/AuthContext"
import type { Requisition } from "@/types/purchase"
import { requisitionGlobalFilter } from "./_lib/global-filter"

// El reporte es de almacén: solo su gente y el SUPERUSER lo descargan. El
// backend aplica el mismo criterio y ademas acota lo que cada uno puede ver.
const REPORT_ROLES = ["JEFE_ALMACEN", "ANALISTA_ALMACEN", "SUPERUSER"]

// .table-sticky-right (globals.css) ya resuelve el fondo opaco, el tono exacto
// del hover via color-mix y el z-index del thead. Repetirlo con utilidades
// sueltas superponia dos capas translucidas y la celda quedaba mas oscura.
const isSticky = (column: Column<Requisition, unknown>) =>
  column.columnDef.meta?.sticky === "right"

interface DataTableProps<TValue> {
  columns: ColumnDef<Requisition, TValue>[]
  data: Requisition[]
  loading?: boolean
}

export function DataTable<TValue>({
  columns,
  data,
  loading = false,
}: DataTableProps<TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: requisitionGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    }
  })

  const router = useRouter();
  const { user } = useAuth();

  const canDownloadReport = (user?.roles ?? []).some((role) =>
    REPORT_ROLES.includes(role.name)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pt-2 pb-3">
        <GeneralModuleRequisitionDialog />

        {canDownloadReport && <DownloadRequisitionsByStatusDialog />}

        <div className="relative w-full sm:w-[360px] sm:ml-auto">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por artículo, N/P, lote o Nro. de solicitud..."
            className="h-8 rounded-md border-border pl-8 pr-8 text-xs"
          />
          {globalFilter.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => setGlobalFilter("")}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ minWidth: header.getSize() }}
                      className={cn(isSticky(header.column) && "table-sticky-right")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Cargando datos...
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
                      className={cn(isSticky(cell.column) && "table-sticky-right")}
                    >
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
      <DataTablePagination table={table} />
    </div>
  )
}
