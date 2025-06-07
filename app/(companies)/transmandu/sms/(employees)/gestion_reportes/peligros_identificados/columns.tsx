"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import DangerIdentificationDropdownActions from "@/components/misc/DangerIdentificationDropdownActions";
import { Badge } from "@/components/ui/badge";
import { DangerIdentification } from "@/types";

export const columns: ColumnDef<DangerIdentification>[] = [
  {
    accessorKey: "voluntary_report",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nº de Reporte" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.voluntary_report &&
          row.original.voluntary_report.report_number ? (
            <p>RVP-{row.original.voluntary_report.report_number}</p>
          ) : row.original.obligatory_report &&
            row.original.obligatory_report.report_number ? (
            <p>ROS-{row.original.obligatory_report.report_number}</p>
          ) : (
            <p>-</p> // Or any other placeholder if both are missing
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
      <DataTableColumnHeader filter column={column} title="Consecuencia a Evaluar" />
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
      <DataTableColumnHeader filter column={column} title="Fuente de Informacion" />
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
