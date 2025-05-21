"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdministrationVendor } from "@/types";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import AdministrationVendorDropdownActions from "@/components/misc/AdministrationVendorDropdownAtions";

export const columns: ColumnDef<AdministrationVendor>[] = [
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Email" />
    ),
    meta: { title: "Email" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.email}</div>
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
      const id = row.original.id;
      return <AdministrationVendorDropdownActions id={row.original.id.toString()} />;
    },
  },
];
