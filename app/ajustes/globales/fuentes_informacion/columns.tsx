"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { Checkbox } from "@/components/ui/checkbox";
import { InformationSource, Manufacturer, Pilot, Vendor } from "@/types";
import InformationSourceDropdownActions from "@/components/misc/InformationSourceDropDownMenu";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<InformationSource>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Nombre de la Fuente"
      />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Tipo de Fuente" />
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={`justify-center items-center text-center font-bold font-sans ${
            row.original.type === "PROACTIVO" ? "bg-green-400" : "bg-red-400"
          }`}
        >
          <p>{row.original.type}</p>
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const informationSource = row.original;
      return (
        <InformationSourceDropdownActions
          informationSource={informationSource}
        />
      );
    },
  },
];
