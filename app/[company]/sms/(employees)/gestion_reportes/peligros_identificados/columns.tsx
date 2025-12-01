"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import DangerIdentificationDropdownActions from "@/components/dropdowns/aerolinea/sms/DangerIdentificationDropdownActions";
import { Badge } from "@/components/ui/badge";
import { DangerIdentification } from "@/types";

export const columns: ColumnDef<DangerIdentification>[] = [
  {
    accessorFn: (row) => {
      if (row.voluntary_report?.report_number) {
        return `RVP-${row.voluntary_report.report_number}`;
      }
      if (row.obligatory_report?.report_number) {
        return `ROS-${row.obligatory_report.report_number}`;
      }
      return "N/A";
    },
    accessorKey: "report_number", // IMPORTANTE: usar id único
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nº de Reporte" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.voluntary_report?.report_number ? (
            <p className="font-bold">
              RVP-{row.original.voluntary_report.report_number}
            </p>
          ) : row.original.obligatory_report?.report_number ? (
            <p className="font-bold">
              ROS-{row.original.obligatory_report.report_number}
            </p>
          ) : (
            <p>N/A</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "danger",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Peligro" />
    ),
    cell: ({ row }) => {
      return <div className="flex justify-center">{row.original.danger}</div>;
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

  {
    accessorKey: "consequence_to_evaluate",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Consecuencia a Evaluar"
      />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {row.original.consequence_to_evaluate}
        </p>
      );
    },
  },
  {
    accessorKey: "information_source",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Fuente de Informacion"
      />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {row.original.information_source &&
            row.original.information_source.name}
        </p>
      );
    },
  },
  {
    accessorKey: "information_source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Fuente" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.information_source && (
            <Badge
              className={`justify-center items-center text-center font-bold font-sans ${
                row.original.information_source.type === "PROACTIVO"
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
            >
              {row.original.information_source.type}
            </Badge>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const dangerIdentification = row.original;
      return (
        <DangerIdentificationDropdownActions
          dangerIdentification={dangerIdentification}
        />
      );
    },
  },
];
