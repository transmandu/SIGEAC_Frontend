"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import VoluntaryReportDropdownActions from "@/components/dropdowns/aerolinea/sms/VoluntaryReportDropDownMenu";
import { Badge } from "@/components/ui/badge";
import { dateFormat } from "@/lib/utils";
import { VoluntaryReport } from "@/types";

export const columns: ColumnDef<VoluntaryReport>[] = [
  {
    accessorKey: "report_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Reporte" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.report_number ? (
            <p>RVP-{row.original.report_number}</p>
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
    accessorKey: "danger_area",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Area de identificacion"
      />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.danger_area}</p>
      );
    },
  },
 /* {
    accessorKey: "danger_location",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Localización del peligro"
      />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {row.original.danger_location}
        </p>
      );
    },
  }, */
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion del peligro" />
    ),
    cell: ({ row }) => (
      <div className="w-64 text-center line-clamp-4">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado del Reporte" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={`justify-center items-center text-center font-bold font-sans pointer-events-none
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
      const voluntaryReport = row.original;
      return (
        <VoluntaryReportDropdownActions voluntaryReport={voluntaryReport} />
      );
    },
  },
];
