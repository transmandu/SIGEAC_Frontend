"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import SmsTrainingModulePatternDropdownActions from "@/components/dropdowns/general/SmsTrainingModulePatternDropdownActions";
import { Badge } from "@/components/ui/badge";
import { SmsTrainingModulePattern } from "@/types";

export const patternColumns: AppColumnDef<SmsTrainingModulePattern>[] = [
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
    accessorKey: "modules",
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Módulos" />
      </div>
    ),
    meta: { title: "Módulos" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm">{row.original.modules.length}</span>
      </div>
    ),
  },
  {
    accessorKey: "initial_total_hours",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Total inicial" />
      </div>
    ),
    meta: { title: "Total inicial" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold">
          {row.original.initial_total_hours}h
        </span>
      </div>
    ),
  },
  {
    accessorKey: "recurrent_total_hours",
    size: 170,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Total recurrente" />
      </div>
    ),
    meta: { title: "Total recurrente" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold">
          {row.original.recurrent_total_hours}h
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
        <SmsTrainingModulePatternDropdownActions pattern={row.original} />
      </div>
    ),
  },
];
