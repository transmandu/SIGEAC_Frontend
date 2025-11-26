"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import ObligatoryReportDropdownActions from "@/components/dropdowns/aerolinea/sms/ObligatoryReportDropdownActions";
import { Badge } from "@/components/ui/badge";
import { dateFormat } from "@/lib/utils";
import { ObligatoryReport } from "@/types";

export const columns: ColumnDef<ObligatoryReport>[] = [
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
        {row.original.report_date
          ? dateFormat(row.original.report_date, "PPP")
          : "N/A"}
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
        return <p className="font-medium text-center">{row.original.flight_time}</p>;
    },
  },
  {
    accessorKey: "incident_time",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Hora del suceso" />
    ),
    cell: ({ row }) => {
        const incident_time = row.original.incident_time;
        return <p className="font-medium text-center">{incident_time}</p>;
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
