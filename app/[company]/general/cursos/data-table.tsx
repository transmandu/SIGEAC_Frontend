"use client";

import CreateCourseDialog from "@/components/dialogs/general/CreateCourseDialog";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { cursosIndexSteps } from "@/components/tour/steps/general/cursos/cursos";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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
      columnFilters,
    },
  });

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour("cursos-index", "Cursos", cursosIndexSteps);
    return () => unregisterTour("cursos");
  }, [registerTour, unregisterTour]);

  return (
    <>
      <div className="flex flex-col gap-2 mb-4" data-tour="cursos-header">
        <h1 className="text-5xl font-bold text-center">Cursos</h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Aquí se pueden visualizar los cursos registrados hasta el momento.
        </p>
      </div>

      <div className="flex justify-between items-center py-4">
        <div data-tour="cursos-create-btn">
          <CreateCourseDialog title="Nuevo" />
        </div>
        <div data-tour="cursos-columns">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className="rounded-md border mb-4" data-tour="cursos-table">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
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

      <div data-tour="cursos-pagination">
        <DataTablePagination table={table} />
      </div>
    </>
  );
}
