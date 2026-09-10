"use client";

import { useMemo, useState } from "react";
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
import { BookOpen, PlusCircle } from "lucide-react";

import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { DataTableFilterPopover, FilterOption } from "@/components/tables/DataTableFilterPopover";
import { DataTableSearchInput } from "@/components/tables/DataTableSearchInput";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManualDialog } from "@/components/dialogs/mantenimiento/catalogo/ManualDialog";
import { STATUS_LABELS } from "@/lib/maintenanceCatalogLabels";
import { CatalogManual } from "@/types/maintenanceCatalog";
import { manualGlobalFilter } from "./columns";

interface DataTableProps<TValue> {
  columns: ColumnDef<CatalogManual, TValue>[];
  data: CatalogManual[];
}

export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const statusOptions: FilterOption[] = useMemo(
    () => Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value })),
    [],
  );

  const supportOptions: FilterOption[] = useMemo(
    () => [
      { label: "Digital", value: "DIGITAL" },
      { label: "Solo físico", value: "PHYSICAL" },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: manualGlobalFilter,
    initialState: { columnVisibility: { support: false } },
    state: { sorting, columnFilters, globalFilter },
  });

  return (
    <div>
      <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
        <ActionTriggerButton type="button" onClick={() => setOpenCreate(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Manual
        </ActionTriggerButton>

        <div className="flex items-center gap-2">
          <DataTableFilterPopover
            groups={[
              { title: "Estado", column: table.getColumn("status"), options: statusOptions },
              { title: "Soporte", column: table.getColumn("support"), options: supportOptions },
            ]}
          />

          <DataTableSearchInput
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Buscar manual..."
            className="w-full sm:w-72"
          />
        </div>
      </div>
      <div className="mb-4 overflow-hidden rounded-xl border border-slate-400/50 shadow-sm dark:border-slate-600/50">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted/40 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="transition-colors hover:bg-primary/[0.03]">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                {/* Las columnas ocultas (support es solo-filtro) no se
                    renderizan: el colSpan sale de las visibles, no de todas. */}
                <TableCell colSpan={table.getVisibleFlatColumns().length} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium text-muted-foreground">Sin manuales registrados</p>
                    <p className="text-xs text-muted-foreground/70">Cree uno con el botón de arriba.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      <ManualDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
