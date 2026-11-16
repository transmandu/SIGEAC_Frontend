"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import MeetingMinuteDropDownActions from "@/components/dropdowns/sms/aeronautical/MeetingMinuteDropDownActions";
import { TagBadge } from "@/components/misc/TagBadge";
import { dateFormat } from "@/lib/utils";
import type { AeronauticalMeetingMinute } from "@/types/sms/aeronautical/meeting-minute";
import { type AppColumnDef } from "@/lib/table";

const timeLabel = (value?: string | null) =>
  value ? String(value).slice(0, 5) : "";

export const aeronauticalColumns: AppColumnDef<AeronauticalMeetingMinute>[] = [
  {
    accessorKey: "minute_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro de Minuta" />
    ),
    meta: { title: "Nro de Minuta" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">
        {row.original.minute_number}
      </div>
    ),
  },
  {
    accessorKey: "place",
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
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha" />
    ),
    meta: { title: "Fecha" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.date ? (
          <p className="font-medium text-center">
            {dateFormat(row.original.date, "PPP")}
          </p>
        ) : (
          <p className="font-medium text-center">N/A</p>
        )}
      </div>
    ),
  },
  {
    id: "schedule",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Horario" />
    ),
    meta: { title: "Horario" },
    cell: ({ row }) => {
      const start = timeLabel(row.original.start_time);
      const end = timeLabel(row.original.end_time);
      if (!start && !end) {
        return <div className="text-center text-muted-foreground">—</div>;
      }
      return (
        <div className="flex justify-center text-center">
          {start || "—"} - {end || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => {
      const status = row.original.status ?? "ABIERTA";
      return (
        <div className="flex justify-center">
          <TagBadge tone={status === "CERRADA" ? "emerald" : "amber"}>
            {status}
          </TagBadge>
        </div>
      );
    },
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
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <MeetingMinuteDropDownActions meetingMinute={row.original} />
    ),
  },
];
