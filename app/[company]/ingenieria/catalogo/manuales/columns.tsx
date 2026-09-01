"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CatalogManual } from "@/types/maintenanceCatalog";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { ManualRowActions } from "./_components/ManualRowActions";

export const columns: ColumnDef<CatalogManual>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <p className="text-center font-medium">{row.original.name}</p>,
  },
  {
    accessorKey: "manual_code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.manual_code || <span className="text-muted-foreground">—</span>}
      </div>
    ),
  },
  {
    accessorKey: "revision",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Revisión" />,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.revision || <span className="text-muted-foreground">—</span>}
      </div>
    ),
  },
  {
    accessorKey: "services_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Servicios" />,
    cell: ({ row }) => <div className="text-center">{row.original.services_count ?? 0}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <ManualRowActions manual={row.original} />
      </div>
    ),
  },
];
