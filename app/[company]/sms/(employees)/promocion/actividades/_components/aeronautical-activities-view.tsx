"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  type ColumnFiltersState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions";
import { appTableFeatures } from "@/lib/table";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAeronauticalActivities } from "@/hooks/sms/aeronautical/useGetAeronauticalActivities";
import { aeronauticalActivityColumns } from "./aeronautical-columns";

export function AeronauticalActivitiesView() {
  const router = useRouter();
  const { selectedCompany } = useCompanyStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    data: activities,
    isLoading,
    isError,
  } = useGetAeronauticalActivities(selectedCompany?.slug);

  const table = useTable({
    features: appTableFeatures,
    data: activities ?? [],
    columns: aeronauticalActivityColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Actividades SMS registradas para la compañía.
        </p>

        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              router.push(
                `/${selectedCompany?.slug}/sms/promocion/actividades/nueva_actividad`,
              )
            }
            size="sm"
            className="h-8"
          >
            <Plus className="mr-2 size-4" />
            Nueva Actividad
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Ha ocurrido un error al cargar las actividades...
        </p>
      ) : (
        <>
          <div className="rounded-md border">
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
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      colSpan={aeronauticalActivityColumns.length}
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
        </>
      )}
    </div>
  );
}
