"use client";

import { useState } from "react";
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onOpenModal: () => void;
  user?: any;
}

export function DataTableCertificates<TData, TValue>({
  columns,
  data,
  onOpenModal,
  user,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  /**
   * LÓGICA DE PERMISOS
   * Richard, al ser SUPERUSER según su JSON, ahora verá el botón correctamente.
   */
  const rolesPermitidos = ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"];
  
  const canCreate = user?.roles?.some((role: any) => {
    // Richard tiene objetos en roles, extraemos 'name' y comparamos en mayúsculas
    const roleName = typeof role === "string" ? role : role?.name;
    return rolesPermitidos.includes(roleName?.toUpperCase());
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-5xl font-bold text-center">
          Certificados SMS
        </h1>
        <p className="text-sm italic text-muted-foreground text-center">
          Aquí se pueden visualizar los certificados de capacitación técnica cargados en el sistema
        </p>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {/* Solo renderiza el botón si el usuario tiene los roles necesarios */}
          {canCreate && (
            <Button
              onClick={onOpenModal}
              variant="outline"
              size="sm"
              className="flex h-8 items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Certificado
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar certificados..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <DataTableViewOptions table={table} />
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
                        cell.getContext()
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
                  No se ha encontrado ningún certificado...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <DataTablePagination table={table} />
    </>
  );
}