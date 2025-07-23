"use client";

import AircraftResumeDialog from "@/components/dialogs/AircraftResumeDialog";
import ClientResumeDialog from "@/components/dialogs/ClientResumeDialog";
import FlightDropdownActions from "@/components/dropdowns/aerolinea/administracion/FlightDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AdministrationFlight } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale/es";

export const columns: ColumnDef<AdministrationFlight>[] = [
  {
    accessorKey: "guide_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="# Guía" />
    ),
    meta: { title: "# Guía" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground font-bold">
          {row.original.guide_code ? row.original.guide_code : "N/A"}
        </span>
      </div>
    ),
  },
    {
    accessorKey: "aircraft.acronym",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Aeronave" />
    ),
    meta: { title: "Aeronave" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <AircraftResumeDialog aircraft={row.original.flight.aircraft} />
      </div>
    )
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    meta: { title: "Fecha" },
    cell: ({ row }) => {
      return (
        <p className="text-center text-muted-foreground">
          {format(addDays(row.original.date, 1), "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    meta: { title: "Cliente" },
    cell: ({ row }) => <ClientResumeDialog client={row.original.client} />,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.type}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Costo" />
    ),
    meta: { title: "Costo" },
    cell: ({ row }) => {
      const isPayed = row.original.debt_status === "PAGADO";
      const badgeVariant = isPayed ? "default" : "destructive";
      const formattedAmount = formatCurrency(Number(row.original.total_amount));
      return (
        <div className="flex justify-center">
          <Badge
            className={
              isPayed
                ? "bg-green-700 hover:bg-green-700"
                : "bg-red-700 hover:bg-red-700"
            }
            variant={badgeVariant}
          >
            {formattedAmount}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detalles" />
    ),
    meta: { title: "Detalles" },
    cell: ({ row }) => (
      <div className="flex justify-center font-bold text-center">
        {row.original.details}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <FlightDropdownActions flight={row.original} />;
    },
  },
];
