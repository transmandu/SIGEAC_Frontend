"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { dateFormat } from "@/lib/utils";
import { ChangeRequest, ChangeStatus } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<
  ChangeStatus,
  { label: string; className: string }
> = {
  BORRADOR: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-border",
  },
  EN_REVISION: {
    label: "En Revisión",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  APROBADO: {
    label: "Aprobado",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
  },
  RECHAZADO: {
    label: "Rechazado",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  },
  EN_EJECUCION: {
    label: "En Ejecución",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  CERRADO: {
    label: "Cerrado",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  },
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  facilities: "Instalaciones",
  documentary: "Documental",
  staff: "Personal",
  equipment: "Equipamiento",
  procedures: "Procedimientos",
  technology: "Tecnología",
  other: "Otro",
};

export const columns: ColumnDef<ChangeRequest>[] = [
  {
    accessorKey: "request_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    meta: { title: "Fecha" },
    cell: ({ row }) => (
      <div className="flex justify-center font-medium">
        {dateFormat(row.original.request_date, "PPP")}
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Depto." />
    ),
    meta: { title: "Depto." },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.department?.acronym}
      </div>
    ),
  },
  {
    accessorKey: "requestedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solicitante" />
    ),
    meta: { title: "Solicitante" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.requestedBy?.first_name}{" "}
        {row.original.requestedBy?.last_name}
      </div>
    ),
  },
  {
    accessorKey: "change_type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {CHANGE_TYPE_LABELS[row.original.change_type] ??
          row.original.change_type}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-center">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => {
      const style = STATUS_STYLES[row.original.status];
      return (
        <Badge variant="outline" className={style.className}>
          {style.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_temporary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Temporal" />
    ),
    meta: { title: "Temporal" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.is_temporary ? "Sí" : "No"}
      </div>
    ),
  },
];
