"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Flight } from "@/types";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale/es";
import FlightDropdownActions from "@/components/misc/FlightDropdownActions";
import { Badge } from "@/components/ui/badge";
import ClientResumeDialog from "@/components/dialogs/ClientResumeDialog";
import { formatCurrency } from "@/lib/utils";
import AircraftResumeDialog from "@/components/dialogs/AircraftResumeDialog";

export const columns: ColumnDef<Flight>[] = [
  {
    accessorKey: "guide_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="# Guía" />
    ),
    meta: { title: "# Guía" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.guide_code ? row.original.guide_code : "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha" />
    ),
    meta: { title: "Fecha" },
    cell: ({ row }) => {
      return (
        <p>
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
      <DataTableColumnHeader filter column={column} title="Cliente" />
    ),
    meta: { title: "Cliente" },
    cell: ({ row }) => <ClientResumeDialog client={row.original.client} />,
  },
  {
    accessorKey: "route",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ruta" />
    ),
    meta: { title: "Ruta" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.route.from} - {row.original.route.to}
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
        <AircraftResumeDialog aircraft={row.original.aircraft} />
      </div>
    )
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo" />
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
//  {
//    accessorKey: "fee",
//    header: ({ column }) => (
//      <DataTableColumnHeader filter column={column} title="Tarifa" />
//    ),
//    meta: { title: "Tarifa" },
//    cell: ({ row }) => (
//      <div className="flex justify-center">
//        <span className="text-muted-foreground italic">{formatCurrency(row.original.fee)}</span>
//      </div>
//    ),
//  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Costo" />
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
//  {
//    accessorKey: "payed_amount",
//    header: ({ column }) => (
//      <DataTableColumnHeader filter column={column} title="Total Pagado" />
//    ),
//    meta: { title: "Total Pagado" },
//    cell: ({ row }) => (
//      <div className="flex justify-center">
//        <span className="text-muted-foreground italic">
//          {formatCurrency(row.original.payed_amount)}
//        </span>
//      </div>
//    ),
//  },
//  {
//    accessorKey: "debt_status",
//    header: ({ column }) => (
//      <DataTableColumnHeader filter column={column} title="Estado Actual" />
//    ),
//    meta: { title: "Estado actual" },
//    cell: ({ row }) => {
//      const status = row.original.debt_status;
//      const backgroundColor =
//        status === "PENDIENTE" ? "bg-red-500" : "bg-green-500";

//      return (
//        <div>
//          <div className="flex justify-center">
//            <Badge className={backgroundColor}>
//              {row.original.debt_status}
//            </Badge>
//          </div>
//        </div>
//      );
//    },
//  },
  {
    accessorKey: "details",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Detalles" />
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
      const id = row.original.id;
      return <FlightDropdownActions flight={row.original} />;
    },
  },
];
