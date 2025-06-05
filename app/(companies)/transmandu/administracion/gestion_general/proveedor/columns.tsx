"use client";

import AdministrationVendorDropdownActions from "@/components/misc/AdministrationVendorDropdownAtions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Vendor } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Vendor>[] = [
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
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
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
      return <AdministrationVendorDropdownActions vendor={row.original} />;
    },
  },
];
