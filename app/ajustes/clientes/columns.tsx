"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/types";
import ClientDropdownActions from "@/components/dropdowns/general/ClientDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Client>[] = [
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
    accessorKey: "dni",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="RIF / C.I" />
    ),
    meta: { title: "RIF / C.I" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.dni_type}-{row.original.dni}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. TLF" />
    ),
    meta: { title: "Nro. TLF" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.phone}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ubicacion" />
    ),
    meta: { title: "Ubicacion" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.address}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "debt",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Saldo" />
    ),
    meta: { title: "Saldo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={cn(
            "",
            row.original.balance < 0 ? "bg-red-500" : "bg-green-500"
          )}
        >
          {formatCurrency(row.original.balance)}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "pay_credit_days",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Días de Crédito" />
    ),
    meta: { title: "Días de Crédito" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.pay_credit_days}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return <ClientDropdownActions client={client} />;
    },
  },
];
