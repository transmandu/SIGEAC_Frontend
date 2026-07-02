"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { dateFormat } from "@/lib/utils";
import { MeetingMinutes } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<MeetingMinutes>[] = [
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Empleado" />
    ),
    meta: { title: "Lugar" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.place}
      </div>
    ),
  },
  {
    accessorKey: "base_course_id",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Fecha de Curso Inicial"
      />
    ),
    meta: { title: "Fecha de Curso Inicial" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.date ? ( // <--- Aquí la condición
          <p className="font-medium text-center">
            {dateFormat(row.original.date, "PPP")}
          </p>
        ) : (
          <p className="font-medium text-center">N/A</p> // O un mensaje alternativo si no existe
        )}
      </div>
    ),
  },
  {
    accessorKey: "last_enrollment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ultimo curso" />
    ),
    meta: { title: "Objetivo" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.objective}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <div className="flex justify-center">
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div></div>
      // <SMSActivityDropDownActions smsActivity={row.original} />
    ),
  },
];
