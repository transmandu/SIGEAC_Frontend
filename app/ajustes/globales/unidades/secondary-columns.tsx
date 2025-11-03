"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import SecondaryUnitDropdownActions from "@/components/dropdowns/ajustes/SecondaryUnitDropdownActions";
import { Convertion } from "@/types";

export const secondary_columns: ColumnDef<Convertion>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Seleccionar todos"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Seleccionar fila"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad Primaria" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.primary_unit.label}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Simbolo" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.primary_unit.value}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor por U." />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.equivalence}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad Secundaria" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.secondary_unit.label}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Simbolo" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.secondary_unit.value}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <SecondaryUnitDropdownActions id={row.original.id} />
      </div>
    ),
  },
];
