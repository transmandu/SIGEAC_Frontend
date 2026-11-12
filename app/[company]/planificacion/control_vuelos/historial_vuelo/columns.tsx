"use client";

import { type AppColumnDef } from "@/lib/table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { dateFormat } from "@/lib/utils";
import { formatNumber } from "@/lib/formatNumber";
import { FlightControl } from "@/types";

export const columns: AppColumnDef<FlightControl>[] = [
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
        <p className="font-medium text-center tabular-nums">
          {formatNumber(row.original.flight_hours ?? 0, {
            minDecimals: 3,
            maxDecimals: 3,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "flight_cycles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclos" />
    ),
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {formatNumber(row.original.flight_cycles ?? 0)}
      </div>
    ),
  },
];
