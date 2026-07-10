"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MeetingMinuteDropDownActions from "@/components/dropdowns/aerolinea/sms/MeetingMinuteDropDownActions";
import { dateFormat } from "@/lib/utils";
import { MeetingMinutes } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<MeetingMinutes>[] = [
  {
    accessorKey: "Numero",
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
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Lugar" />
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
        title="Fecha"
      />
    ),
    meta: { title: "Fecha" },
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
    accessorKey: "objective",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Objetivo" />
    ),
    meta: { title: "Objetivo" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.objective}
      </div>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <MeetingMinuteDropDownActions meetingMinute={row.original} />
    ),
  },
];
