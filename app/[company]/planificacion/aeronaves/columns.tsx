"use client";

import { type AppColumnDef } from "@/lib/table";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompanyLink } from "@/components/misc/CompanyLink";
import { AeronauticalAircraft } from "@/types";
import MaintenanceAircraftDropdownActions from "@/components/dropdowns/mantenimiento/ordenes_trabajo/MaintenanceAircraftDropdownActions";
import { formatNumber } from "@/lib/formatNumber";

const fmtNumber = (n: unknown) =>
  formatNumber(n, { maxDecimals: 3, fallback: "0" });

export const columns: AppColumnDef<AeronauticalAircraft>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "acronym",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Matricula" />
    ),
    cell: ({ row }) => (
      <CompanyLink
        to="planificacion/aeronaves"
        className="flex justify-center font-bold italic"
      >
        {row.original.acronym}
      </CompanyLink>
    ),
  },
  {
    accessorKey: "manufacturer.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fabricante" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-medium">
        {row.original.manufacturer.name}
      </p>
    ),
  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cliente" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">
        {row.original.client.name}
      </p>
    ),
  },
  {
    accessorKey: "flight_hours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Horas de Vuelo" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-semibold">
        {fmtNumber(row.original.flight_hours)} hrs.
      </p>
    ),
  },
  {
    accessorKey: "flight_cycles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ciclos de Vuelo" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-semibold">
        {fmtNumber(row.original.flight_cycles)} cyc.
      </p>
    ),
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">
        {row.original.location.address}
      </p>
    ),
  },
  {
    accessorKey: "comments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comentarios" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground text-center">
        {row.original.comments}
      </p>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return <MaintenanceAircraftDropdownActions acronym={item.acronym} />;
    },
  },
];
