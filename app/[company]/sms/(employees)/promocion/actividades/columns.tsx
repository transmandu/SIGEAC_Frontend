"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { SMSActivity } from "@/types";
import { dateFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import SMSActivityDropDownActions from "@/components/dropdowns/aerolinea/sms/SMSActivityDropDownActions";

export type SMSActivityTableRow = SMSActivity & {
  display_activity_number?: string;
};

// Columnas de la tabla
export const columns: ColumnDef<SMSActivityTableRow>[] = [
  {
    id: "activity_number",
    accessorFn: (row) => {
      const value = row.display_activity_number ?? row.activity_number ?? "";
      const match = String(value).match(/^(\d{3})-(\d{4})$/);

      if (!match) return Number.NEGATIVE_INFINITY;

      const sequence = Number(match[1]);
      const year = Number(match[2]);

      return -year * 1000 + sequence;
    },
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Numero de actividad" />
    ),
    meta: { title: "Numero de actividad" },
    cell: ({ row }) =>
      <div className="flex justify-center text-center">
        {row.original.display_activity_number ?? row.original.activity_number ?? "N/A"}
      </div>,
  },
  {
    accessorKey: "activity_name",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Nombre de la actividad"
      />
    ),
    meta: { title: "Nombre de la actividad" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.activity_name ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Título" />
    ),
    meta: { title: "Título" },
    cell: ({ row }) => (
      <p className="font-medium text-center italic">
        {row.original.title ?? "N/A"}
      </p>
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha de Inicio" />
    ),
    meta: { title: "Duracion de la Actividad" },
    cell: ({ row }) =>
      <div className="flex justify-center text-center">
       <p className="font-medium text-center">
           {dateFormat(row.original.start_date, "PPP")}
       </p>
      </div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) =>
    <div className="flex justify-center">
            <Badge
              className={`justify-center items-center text-center font-bold font-sans
          ${
            row.original.status === "CERRADO"
              ? "bg-red-400"
              : "bg-green-500" 
          }`}
            >
              {row.original.status}
            </Badge>
      </div>
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <SMSActivityDropDownActions smsActivity={row.original} />
    ),
  },
];
