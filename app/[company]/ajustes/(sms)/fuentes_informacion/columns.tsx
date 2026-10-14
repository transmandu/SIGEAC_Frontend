"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";
import InformationSourceDropdownActions from "@/components/dropdowns/aerolinea/sms/InformationSourceDropDownActions";
import { InformationSource } from "@/types";

const TYPE_TONES: Record<InformationSource["type"], TagTone> = {
  PROACTIVO: "green",
  REACTIVO: "rose",
  PREDICTIVO: "blue",
};

export const columns: AppColumnDef<InformationSource>[] = [
  {
    accessorKey: "name",
    size: 360,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader
          filter
          column={column}
          title="Nombre de la Fuente"
        />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 220,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Tipo de Fuente" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <TagBadge tone={TYPE_TONES[row.original.type] ?? "slate"}>
          {row.original.type}
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
        <InformationSourceDropdownActions informationSource={row.original} />
      </div>
    ),
  },
];
