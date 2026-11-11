"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Inbox, Plus, Search, X } from "lucide-react";
import {
  type ColumnFiltersState,
  flexRender,
  type RowData,
  type SortingState,
  useTable,
} from "@tanstack/react-table";

import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions";
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
import { appTableFeatures, type AppColumnDef } from "@/lib/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  /** Ruta del botón "Nueva solicitud". Si no se indica, no se muestra. */
  createHref?: string;
  createLabel?: string;
  searchPlaceholder?: string;
  /** Texto que se usa para la búsqueda global. */
  getSearchText?: (row: TData) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  createHref,
  createLabel = "Nueva solicitud",
  searchPlaceholder = "Buscar...",
  getSearchText,
  emptyTitle = "No se encontró ningún resultado",
  emptyDescription = "Ajuste la búsqueda o cree una nueva solicitud con el botón de arriba.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || !getSearchText) return data;
    return data.filter((row) =>
      getSearchText(row).toLowerCase().includes(term),
    );
  }, [data, getSearchText, search]);

  const table = useTable({
    features: appTableFeatures,
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "h-9 rounded-md pl-9 text-sm",
              "border-border bg-background shadow-xs",
              "transition-all duration-200",
              "hover:border-primary/40 hover:shadow-sm",
              "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
              search ? "pr-9" : undefined,
            )}
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            >
              <X className="size-4 text-muted-foreground" />
            </Button>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <DataTableViewOptions table={table} />
          {createHref ? (
            <Button asChild size="sm" className="h-8">
              <Link href={createHref}>
                <Plus className="mr-2 size-4" />
                {createLabel}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-xl border border-border/70 shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-muted/40 font-semibold"
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
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                      <Inbox className="size-5" />
                    </span>
                    <p className="text-sm font-medium text-muted-foreground">
                      {emptyTitle}
                    </p>
                    <p className="max-w-sm text-xs text-muted-foreground/70">
                      {emptyDescription}
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
