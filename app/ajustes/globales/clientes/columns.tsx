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
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return <ClientDropdownActions client={client} />;
    },
  },
];
