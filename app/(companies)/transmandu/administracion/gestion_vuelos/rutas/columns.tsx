"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Route } from "@/types";
import RouteDropdownActions from "@/components/misc/RouteDropdownActions";

export const columns: ColumnDef<Route>[] = [
  {
    accessorKey: "from",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Desde" />
    ),
    meta: { title: "Desde" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.from}</div>
    ),
  },
  {
    accessorKey: "layover",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Escala" />
    ),
    meta: { title: "Escala" },
    cell: ({ row }) => {
      const layovers = row.original.layovers;

      if (!layovers || layovers.length === 0) {
        return (
          <div className="flex justify-center font-bold">
            <span className="text-muted-foreground font-bold">-</span>
          </div>
        );
      }
      return (
        <div className="flex justify-center font-bold">
          <span className="text-muted-foreground font-bold">
            {layovers}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "to",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Hasta" />
    ),
    meta: { title: "Hasta" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold">{row.original.to}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return <RouteDropdownActions id={row.original.id.toString()} />;
    },
  },
];
