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

import { CreateUserDialog } from "@/components/dialogs/ajustes/CreateUserDialog"
import { DataTableFacetedFilter } from "@/components/tables/DataTableFacetedFilter"
import { DataTablePagination } from "@/components/tables/DataTablePagination"
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetRoles } from "@/hooks/sistema/usuario/useGetRoles"
import { Role } from "@/types"
import { ListRestart } from "lucide-react"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

interface TableProps {
  label: string;
  value: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const { data: roles, isLoading } = useGetRoles();

  function formatData(roles: Role[] | undefined): TableProps[] {
    if (!roles) {
      return []
    }
    return roles.map(item => ({
      label: item.name,
      value: item.name,
    }));
  }

  const formattedRoles = formatData(roles);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    }
  })

  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div>
      <div className="flex items-center py-4">
        <div className="flex gap-x-2 items-center">
          {table.getColumn("roles") && !isLoading && (
            <DataTableFacetedFilter
              column={table.getColumn("roles")}
              title="Rol"
              options={formattedRoles}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reiniciar
              <ListRestart className="ml-2 h-4 w-4" />
            </Button>
          )}
          <CreateUserDialog />
        </div>
        <DataTableViewOptions table={table} />
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
