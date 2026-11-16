"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import SmsTrainingModuleDropdownActions from "@/components/dropdowns/general/SmsTrainingModuleDropdownActions";
import { Badge } from "@/components/ui/badge";
import { SmsTrainingModule } from "@/types";

export const moduleColumns: AppColumnDef<SmsTrainingModule>[] = [
  {
    accessorKey: "number",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="N.º" />
      </div>
    ),
    meta: { title: "N.º" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold">{row.original.number}</span>
      </div>
    ),
  },
  {
    accessorKey: "name",
    size: 260,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium text-center">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    size: 360,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-muted-foreground text-center">
          {row.original.description || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    size: 120,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Estado" />
      </div>
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <SmsTrainingModuleDropdownActions module={row.original} />
      </div>
    ),
  },
];
