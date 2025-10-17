"use client"

import {
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
import { DataTablePagination } from "@/components/tables/DataTablePagination"
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CreateMaintenanceAircraftDialog } from "@/components/dialogs/mantenimiento/aeronaves/CreateMaintenanceAircraftDialog"
import { CreateFlightControlDialog } from "@/components/dialogs/aerolinea/administracion/CreateFlightControl"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import Link from "next/link"
import { useCompanyStore } from "@/stores/CompanyStore"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  })

  const router = useRouter();
  const { selectedCompany } = useCompanyStore();

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <CreateFlightControlDialog />
        <div className="flex items-center gap-2">
          <Link href={`/${selectedCompany?.slug}/planificacion/control_vuelos/historial_vuelo`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial de Vuelos
            </Button>
          </Link>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
      <DataTablePagination table={table} />
    </div>
  )
}
