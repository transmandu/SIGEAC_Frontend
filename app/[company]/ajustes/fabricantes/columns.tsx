"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import ManufacturerDropdownActions from "@/components/dropdowns/general/ManufacturerDropdownActions";
import { Manufacturer } from "@/types";
import { MANUFACTURER_TYPE_LABELS } from "@/components/forms/general/manufacturerSchema";

export { MANUFACTURER_TYPE_LABELS };

/** Un color por tipo: se distingue de un vistazo sin leer el texto. */
export const MANUFACTURER_TYPE_TONES: Record<Manufacturer["type"], TagTone> = {
  AIRCRAFT: "sky",
  ENGINE: "orange",
  APU: "violet",
  PROPELLER: "emerald",
  GENERAL: "slate",
  PART: "amber",
  TOOL: "rose",
};

export const columns: AppColumnDef<Manufacturer>[] = [
  {
    accessorKey: "name",
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Abrev." />
      </div>
    ),
    meta: { title: "Abrev." },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    size: 360,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-muted-foreground text-center uppercase">
          {row.original.description || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 200,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <TagBadge tone={MANUFACTURER_TYPE_TONES[row.original.type] ?? "slate"}>
          {MANUFACTURER_TYPE_LABELS[row.original.type] ?? row.original.type}
        </TagBadge>
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <ManufacturerDropdownActions manufacturer={row.original} />
      </div>
    ),
  },
];
