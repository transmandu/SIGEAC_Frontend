"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { Checkbox } from "@/components/ui/checkbox";
import { MitigationTable } from "@/types";

export const columns: ColumnDef<MitigationTable>[] = [
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
    accessorKey: "report_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Reporte" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
        </div>
      );
    },
  },
  {
    accessorKey: "incident_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha del Incidente" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">

        </p>
      );
    },
  },
  {
    accessorKey: "report_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha del reporte" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">

        </p>
      );
    },
  },
  {
    accessorKey: "danger_area",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Area de identificacion" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">{row.original.danger_area}</p>
      );
    },
  },
  {
    accessorKey: "danger_location",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Localización del peligro" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {row.original.danger_location}
        </p>
      );
    },
  },

  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion del peligro" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.original.description}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const voluntaryReport = row.original;
      // return <VoluntaryReportDropdownActions voluntaryReport={voluntaryReport} />;
    },
  },
];
