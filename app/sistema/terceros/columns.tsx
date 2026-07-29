"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import ThirdPartyDropdownActions from "@/components/dropdowns/general/ThirdPartyDropdownActions"
import { ThirdParty } from "@/types"
import { getThirdPartyTypeLabel } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<ThirdParty>[] = [
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
        <Badge
          className="
            rounded-md
            border
            border-blue-500/20
            bg-blue-500/10
            text-blue-700
            dark:text-blue-300
            hover:bg-blue-500/10
          "
        >
          {getThirdPartyTypeLabel(row.original.type)}
        </Badge>
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
]
