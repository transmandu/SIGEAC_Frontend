"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { type AppColumnDef } from "@/lib/table";
import type {
  ChangeRequest,
  ChangeStatus,
  ChangeType,
} from "@/types/sms/aeronautical/change-request";
import { AeronauticalChangeRequestActions } from "./_components/aeronautical-change-request-actions";

const STATUS_STYLES: Record<
  ChangeStatus,
  { label: string; className: string }
> = {
  BORRADOR: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-border",
  },
  EN_REVISION: {
    label: "En revisión",
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
    label: "En ejecución",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  CERRADO: {
    label: "Cerrado",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  },
};

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  INTERNO: "Interno",
  EXTERNO: "Externo",
};

function fullName(changeRequest: ChangeRequest) {
  return [
    changeRequest.requested_by?.first_name,
    changeRequest.requested_by?.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export const columns: AppColumnDef<ChangeRequest>[] = [
  {
    accessorKey: "request_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correlativo" />
    ),
    meta: { title: "Correlativo" },
    cell: ({ row }) => (
      <div className="text-center font-semibold">
        {row.original.request_number}
      </div>
    ),
  },
  {
    accessorKey: "requested_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solicitante" />
    ),
    meta: { title: "Solicitante" },
    cell: ({ row }) => (
      <div className="text-center">{fullName(row.original)}</div>
    ),
  },
  {
    accessorKey: "change_type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="text-center">
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
      <div
        className="mx-auto max-w-72 truncate"
        title={row.original.description}
      >
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "hazards_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peligros" />
    ),
    meta: { title: "Peligros" },
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.hazards_count ?? 0}
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
        <div className="flex justify-center">
          <Badge variant="outline" className={style.className}>
            {style.label}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AeronauticalChangeRequestActions changeRequest={row.original} />
      </div>
    ),
  },
];
