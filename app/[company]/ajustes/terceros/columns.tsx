"use client";

import { type AppColumnDef } from "@/lib/table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import ThirdPartyDropdownActions from "@/components/dropdowns/general/ThirdPartyDropdownActions";
import { ThirdParty } from "@/types";
import { getThirdPartyTypeLabel } from "@/lib/utils";
import { TagBadge, type TagTone } from "@/components/misc/TagBadge";

/** Un color por tipo: se distingue de un vistazo sin leer el texto. */
export const THIRD_PARTY_TYPE_TONES: Record<string, TagTone> = {
  CLIENT_COMPANY: "sky",
  CLIENT_PERSON: "violet",
  OTHER: "slate",
  SIN_TIPO: "amber",
};

export const THIRD_PARTY_TYPES = [
  "CLIENT_COMPANY",
  "CLIENT_PERSON",
  "OTHER",
  "SIN_TIPO",
] as const;

export const columns: AppColumnDef<ThirdParty>[] = [
  {
    accessorKey: "name",
    size: 320,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),

    meta: {
      title: "Nombre",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name ?? "—"}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "type",
    size: 200,

    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Tipo" />
      </div>
    ),

    meta: {
      title: "Tipo",
    },

    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <TagBadge tone={THIRD_PARTY_TYPE_TONES[row.original.type] ?? "slate"}>
          {getThirdPartyTypeLabel(row.original.type)}
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

    meta: {
      title: "Acciones",
    },

    cell: ({ row }) => (
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <ThirdPartyDropdownActions thirdParty={row.original} />
      </div>
    ),
  },
];
