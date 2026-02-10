"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { dateFormat } from "@/lib/utils";
import { FlightControl } from "@/types";

export const columns: ColumnDef<FlightControl>[] = [
  {
    accessorKey: "flight_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Vuelo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.flight_number}
        </div>
      );
    },
  },
  {
    accessorKey: "flight_date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha de Vuelo" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {dateFormat(row.original.flight_date, "PPP")}
        </p>
      );
    },
  },
  {
    accessorKey: "flight_hours",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Horas"
      />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.flight_hours}</p>
      );
    },
  },
  {
    accessorKey: "flight_cycles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclos" />
    ),
    cell: ({ row }) => (
      <div className="text-center line-clamp-4">
        {row.original.flight_cycles}
      </div>
    ),
  },
];
