"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Category } from "@/types";
import CategoryDropdownActions from "@/components/misc/CategoryDropdownActions";

export const columns: ColumnDef<Category>[] = [
  {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader filter column={column} title="Categoría" />
      ),
      meta: { title: "Categoría" },
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="text-muted-foreground italic">
            {row.original.name}
          </span>
        </div>
      ),
  },
  {
    accessorKey: "accountant.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cuenta" />
    ),
    meta: { title: "Cuenta" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.accountant.name}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return <CategoryDropdownActions id={row.original.id.toString()} />;
    },
  },
];

