"use client";

import { SlidersHorizontal } from "lucide-react";
import { type RowData } from "@tanstack/react-table";
import { type AppTable } from "@/lib/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData extends RowData> {
  table: AppTable<TData>;
}

export function DataTableViewOptions<TData extends RowData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 flex"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Ver
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Mostrar / Ocultar</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            const title =
              column.columnDef.meta?.title ??
              (typeof column.columnDef.header === "string"
                ? column.columnDef.header
                : column.id);

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) =>
                  column.toggleVisibility(!!value)
                }
              >
                {title}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
