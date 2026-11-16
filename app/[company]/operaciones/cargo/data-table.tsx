"use client";
import * as React from "react";
import {
  ColumnFiltersState,
  flexRender,
  type RowData,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { appTableFeatures, type AppColumnDef, type AppRow } from "@/lib/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/tables/DataTablePagination";
import { DataTableViewOptions } from "@/components/tables/DataTableViewOptions";

interface DataTableProps<TData extends RowData> {
  columns: AppColumnDef<TData>[];
  data: TData[];
  renderSubComponent?: (props: { row: AppRow<TData> }) => React.ReactElement;
  getRowCanExpand?: (row: AppRow<TData>) => boolean;
  /**
   * Render alternativo para pantallas chicas. Cuando se provee, la tabla se
   * oculta en móvil y cada fila se muestra como tarjeta.
   */
  renderMobileCard?: (props: { row: AppRow<TData> }) => React.ReactNode;
}
export function DataTable<TData extends RowData>({
  columns,
  data,
  renderSubComponent,
  getRowCanExpand,
  renderMobileCard,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const table = useTable({
    features: appTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: getRowCanExpand,
    state: {
      sorting,
      columnFilters,
    },
  });
  const mobileCard = renderMobileCard;
  return (
    <div data-tour="cargo-guia-tabla">
      <div className="flex items-center py-4 gap-2">
        <Input
          data-tour="cargo-guia-tabla-search"
          placeholder="Filtrar por N° de guía"
          value={
            (table.getColumn("manifest_number")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("manifest_number")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-center"
        />
        <div className={mobileCard ? "hidden md:block" : undefined}>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div
        className={
          renderMobileCard
            ? "hidden rounded-md border bg-background md:block"
            : "rounded-md border bg-background"
        }
      >
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
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow>
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="p-0 border-b"
                      >
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay registros creados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {mobileCard && (
        <div className="flex flex-col gap-3 md:hidden">
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => <div key={row.id}>{mobileCard({ row })}</div>)
          ) : (
            <div className="rounded-md border bg-background py-10 text-center text-sm text-muted-foreground">
              No hay registros creados.
            </div>
          )}
        </div>
      )}
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
