"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";

import { Checkbox } from "@/components/ui/checkbox";
import { Pilot } from "@/types";
import PilotDropdownActions from "@/components/misc/PilotDropdownActions";

export const columns: ColumnDef<Pilot>[] = [
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
    accessorKey: "dni",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cedula" />
    ),
    meta: { title: "Cedula" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.dni}</span>
      </div>
    ),
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">{row.original.first_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Apellido" />
    ),
    meta: { title: "Apellido" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.last_name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "license_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Licencia" />
    ),
    meta: { title: "Nro. Licencia" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.license_number}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Telefono" />
    ),
    meta: { title: "Telefono" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.phone}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Correo Electronico" />
    ),
    meta: { title: "Email" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="text-muted-foreground italic">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pilot = row.original;
      return <PilotDropdownActions pilot={pilot} />;
    },
  },
];
