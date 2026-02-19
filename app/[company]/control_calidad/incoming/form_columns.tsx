"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { IncomingArticle } from "./IncomingTypes";

export const form_columns: ColumnDef<IncomingArticle>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Seleccionar todos"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Seleccionar fila"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "batch.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <p className="text-center flex justify-center font-bold">
        {row.original.batch ? row.original.batch.name : "-"}
      </p>
    ),
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Parte" />
    ),
    cell: ({ row }) => (
      <p className="text-center flex justify-center font-bold">
        {row.original.part_number}
      </p>
    ),
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Serie" />
    ),
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.serial}</p>
    ),
  },
];
