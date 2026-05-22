"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { SMSActivity } from "@/types";
import { dateFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import SMSActivityDropDownActions from "@/components/dropdowns/aerolinea/sms/SMSActivityDropDownActions";

// Columnas de la tabla
export const columns: ColumnDef<SMSActivity>[] = [
  {
    id: "activity_number",
    accessorFn: (row) => {
      const v = (row as any).activity_number;
      if (v === null || v === undefined || v === "") return NaN;
      const str = String(v).trim();
      const digits = str.match(/\d+/);
      if (digits) return Number(digits[0]);
      // Fallback to plain Number conversion (handles pure numeric strings)
      const n = Number(str);
      return isNaN(n) ? NaN : n;
    },
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Numero de actividad" />
    ),
    meta: { title: "Numero de actividad" },
    cell: ({ row }) =>
      <div className="flex justify-center text-center">
        {row.original.activity_number ?? "N/A"}
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