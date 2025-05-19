"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import ObligatoryReportDropdownActions from "@/components/misc/ObligatoryReportDropdownActions";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ObligatoryReport } from "@/types";
import { format, parse } from "date-fns";
import { dateFormat, timeFormat } from "@/lib/utils";

export const columns: ColumnDef<ObligatoryReport>[] = [
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
    accessorKey: "report_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Reporte" />
    ),
    meta: { title: "Nro. de Reporte" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.report_number ? (
            <p>ROS-{row.original.report_number}</p>
          ) : (
            "N/A"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "report_date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha del reporte" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {dateFormat(row.original.report_date, "PPP")}
        </p>
      );
    },
  },
  {
    accessorKey: "flight_time",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Hora del Vuelo" />
    ),
    cell: ({ row }) => {
      const flight_time = timeFormat(row.original.flight_time);
      return <p className="font-medium text-center">{flight_time} </p>;
    },
  },
  {
    accessorKey: "incident_time",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Hora del suceso" />
    ),
    cell: ({ row }) => {
      const timeString = row.original.incident_time.toString();
      const parsedTime = parse(timeString, "HH:mm:ss", new Date());
      const incident_time = format(parsedTime, "HH:mm");
      return <p className="font-medium text-center">{incident_time} </p>;
    },
  },

  {
    accessorKey: "flight_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Numero de vuelo" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">
        {row.original.flight_number}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={`justify-center items-center text-center font-bold font-sans 
      ${
        row.original.status === "CERRADO"
          ? "bg-green-400"
          : row.original.status === "PROCESO"
          ? "bg-gray-500" // Color gris oscuro (puedes ajustar el tono)
          : "bg-red-400"
      }`}
        >
          {row.original.status}
        </Badge>
      </div>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const obligatoryReport = row.original;
      return (
        <ObligatoryReportDropdownActions
          obligatoryReport={obligatoryReport}
        ></ObligatoryReportDropdownActions>
      );
    },
  },
];
