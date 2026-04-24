"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useState } from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ListRestart } from "lucide-react"
import { DataTablePagination } from "@/components/tables/DataTablePagination"
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions"
import { CreateEmployeeDialog } from "@/components/dialogs/general/CreateEmployeeDialog"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [expandedRowId, setExpandedRowId] = useState<string | false>(false)

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),

    getRowCanExpand: () => true,
  })

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div>

      <div className="flex items-center justify-between py-4">

        <div className="flex items-center gap-2">

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

          <CreateEmployeeDialog />
        </div>

        <DataTableViewOptions table={table} />
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>

            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {

                const isExpanded = expandedRowId === row.id

                return (
                  <>
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/30",
                        isExpanded && "bg-muted/50 border-l-4"
                      )}
                      onClick={() =>
                        setExpandedRowId(
                          isExpanded ? false : row.id
                        )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {isExpanded && renderSubComponent && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={row.getVisibleCells().length}>
                          {renderSubComponent({ row })}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
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

      <DataTablePagination table={table} />

    </div>
  )
}