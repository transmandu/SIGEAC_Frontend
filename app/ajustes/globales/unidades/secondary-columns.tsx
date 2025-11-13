"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import SecondaryUnitDropdownActions from "@/components/dropdowns/ajustes/SecondaryUnitDropdownActions";
import { Convertion } from "@/types";
import { Calculator } from "lucide-react";

export const secondary_columns: ColumnDef<Convertion>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => (
      <div className="flex items-center gap-2 justify-center">
        <Calculator className="h-4 w-4" />
        <DataTableColumnHeader column={column} title="Valor por U." />
      </div>
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
      <DataTableColumnHeader column={column} title="Unidad Primaria" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <span className="font-bold text-center">
          {row.original.primary_unit.label}
        </span>
        <span className="font-light text-center items-center text-xs ml-1 ">
          ({row.original.primary_unit.value})
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
          {row.original.secondary_unit?.label ?? "N/A"}
        </span>
        <span className="font-light text-center text-xs ml-1">
          ({row.original.secondary_unit?.value ?? ""})
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
