"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { SMSActivity } from "@/types";

// Columnas de la tabla
export const columns: ColumnDef<SMSActivity>[] = [
  {
    accessorKey: "analysis",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Analisis" />
    ),
    meta: { title: "Analisis" },
    cell: ({ row }) =>
      <div className="flex justify-center text-center">
        {row.original.activity_number ?? "N/A"}
      </div>,
  },
  {
    accessorKey: "mitigation_plan",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Consecuencia a Evaluar"
      />
    ),
    meta: { title: "Consecuencia a Evaluar" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.activity_name ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion del Plan" />
    ),
    meta: { title: "Descripcion" },
    cell: ({ row }) => (
      <p className="font-medium text-center">
        {row.original.description ?? "N/A"}
      </p>
    ),
  },
  {
    accessorKey: "measures",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agregar Medidas" />
    ),
    cell: ({ row }) => <div className="flex justify-center text-center">
        {row.original.duration ?? "N/A"}
      </div>,
  },
  {
    accessorKey: "mitigation_plan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Post-Mitigacion" />
    ),
    cell: ({ row }) =>
      <div className="flex justify-center text-center">
        {row.original.place ?? "N/A"}
      </div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <p></p>
      // <MitigationTableDropdownActions mitigationTable={row.original} />
    ),
  },
];
