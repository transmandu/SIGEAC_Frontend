"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Route } from "@/types";
import RouteDropdownActions from "@/components/misc/RouteDropdownActions";
import { ChevronRight } from "lucide-react";

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
    <DataTableColumnHeader filter column={column} title="Escalas" />
  ),
  meta: { title: "Escalas" },
  cell: ({ row }) => {
    const layovers = row.original.layover;

    if (!layovers || layovers.length === 0) {
      return (
        <div className="text-center">
          <span className="text-muted-foreground italic">Sin escalas</span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1 justify-center items-center">
        {layovers.map((layover, index) => (
          <div key={index} className="flex items-center">
            <span className="px-2 py-1 bg-accent rounded-md text-sm cursor-pointer hover:bg-accent/80 transition-colors">
              {layover}
            </span>
            {index < layovers.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    );
  }
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
