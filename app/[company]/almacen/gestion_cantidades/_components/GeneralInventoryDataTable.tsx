"use client";

import React from "react";
import { flexRender, type RowData } from "@tanstack/react-table";
import { type AppTable } from "@/lib/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CursorPagination } from "@/components/tables/CursorPagination";
import type { CursorPaginationState } from "@/hooks/helpers/useCursorListing";
import { cn } from "@/lib/utils";

type Props<TData extends RowData> = {
  table: AppTable<TData>;
  colSpan: number;
  isFetching: boolean;
  pagination: CursorPaginationState & { summary?: string };
};

export function GeneralInventoryDataTable<TData extends RowData>({
  table,
  colSpan,
  isFetching,
  pagination,
}: Props<TData>) {
  return (
    <div className="relative rounded-md border mb-4">
      {isFetching && (
        <div className="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-muted">
          <div className="h-full w-1/4 animate-indeterminate bg-primary" />
        </div>
      )}
      <Table className={cn("transition-opacity", isFetching && "opacity-60")}>
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
              <TableCell
                colSpan={colSpan}
                className="h-24 text-center text-muted-foreground"
              >
                No se ha encontrado ningún resultado...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CursorPagination {...pagination} />
    </div>
  );
}
