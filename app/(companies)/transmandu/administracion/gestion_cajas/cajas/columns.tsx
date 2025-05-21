"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Cash } from "@/types";
import CashDropdownActions from "@/components/misc/CashDropdownActions";
import { formatCurrencyJ, getCurrencySymbol } from "@/lib/utils";

export const columns: ColumnDef<Cash>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Total" />
    ),
    meta: { title: "Total" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {formatCurrencyJ(row.original.total_amount, row.original.coin)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "coin",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Moneda" />
    ),
    meta: { title: "Moneda" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.coin}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Transacción" />
    ),
    meta: { title: "Transacción" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.type}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <CashDropdownActions
          cash={row.original}
          id={row.original.id.toString()}
        />
      );
    },
  },
];
