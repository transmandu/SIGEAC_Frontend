"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { AdministrationCompany } from "@/types";
import AdministrationCompanyDropdownActions from "@/components/misc/AdministrationCompanyDropdownActions";

export const columns: ColumnDef<AdministrationCompany>[] = [
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
    accessorKey: "rif",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="RIF" />
    ),
    meta: { title: "RIF" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.rif}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "fiscal_address",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Dirección Fiscal" />
    ),
    meta: { title: "Dirección Fiscal" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.fiscal_address}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Número de Teléfono" />
    ),
    meta: { title: "Número de Teléfono" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.phone_number}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return <AdministrationCompanyDropdownActions id={row.original.id.toString()} />;
    },
  },
];