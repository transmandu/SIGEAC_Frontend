"use client";

import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  ColumnFiltersState,
  flexRender,
  type RowData,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { appTableFeatures, type AppColumnDef } from "@/lib/table";
import { PlaneTakeoff, PlusCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MaintenanceControl } from "@/types";
import { MaintenanceControlSnapshotDialog } from "@/components/dialogs/mantenimiento/planificacion/MaintenanceControlSnapshotDialog";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
}

// Busca a la vez en aeronave, título y descripción: más rápido que abrir el
// filtro de cada columna por separado para encontrar un control.
function globalMaintenanceControlFilter(row: { original: MaintenanceControl }, term: string) {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [row.original.aircraft?.acronym, row.original.title, row.original.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function DataTable<TData extends RowData>({
  columns,
  data,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalMaintenanceControlFilter as any,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const { selectedCompany } = useCompanyStore();

  return (
    <div>
      <div className="flex items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-2">
          <ActionTriggerButton asChild>
            <Link href={`/${selectedCompany?.slug}/planificacion/control_mantenimiento/crear`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Control de Mantenimiento
            </Link>
          </ActionTriggerButton>

          <MaintenanceControlSnapshotDialog />
        </div>

        {/* Mismo lenguaje visual que los ActionTriggerButton de al lado
            (h-10, borde y sombra estándar, realce azul al apuntar/enfocar):
            antes era un input suelto h-9 que rompía la línea de la fila. */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por aeronave, título o descripción..."
            className={cn(
              "h-10 rounded-md pl-9 text-sm",
              "border-border bg-background shadow-sm",
              "transition-all duration-200",
              "hover:border-primary/40 hover:shadow-md",
              "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
              globalFilter ? "pr-9" : undefined,
            )}
          />
          {globalFilter ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setGlobalFilter("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-400/50 shadow-sm dark:border-slate-600/50">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="bg-muted/40 font-semibold">
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
                  className="transition-colors hover:bg-primary/[0.03]"
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                      <PlaneTakeoff className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium text-muted-foreground">
                      No se encontró ningún control de mantenimiento
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Ajuste la búsqueda o cree uno nuevo con el botón de arriba.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
