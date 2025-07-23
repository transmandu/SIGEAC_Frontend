"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Accountant } from "@/types";
import AccountantDropdownActions from "@/components/dropdowns/aerolinea/administracion/AccountDropdownActions";

export const columns: ColumnDef<Accountant>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cuenta" />
    ),
    meta: { title: "Cuenta" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.name}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const accountant = row.original;
      return <AccountantDropdownActions accountant={accountant} />;
    },
  },
];
