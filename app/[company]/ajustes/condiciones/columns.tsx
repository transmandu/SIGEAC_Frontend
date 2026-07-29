"use client";

import ClientDropdownActions from "@/components/dropdowns/general/ClientDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Condition } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Condition>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.description}</div>
    ),
  },

];
