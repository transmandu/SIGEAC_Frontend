"use client"

import { ColumnDef } from "@tanstack/react-table"

import PermissionsDialog from "@/components/dialogs/general/PermissionsDialog"
import RolesDropdownActions from "@/components/dropdowns/ajustes/RolesDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Role } from "@/types"
import Image from "next/image"



export const columns: ColumnDef<Role>[] = [
    {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) =>
      <div className="flex items-center justify-center">
        <Badge className="text-base">{row.original.label}</Badge>
      </div>
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Compañia" />
    ),
    cell: ({ row }) =>
      <div className="flex flex-col items-center">{row.original.company?.map((c) => <div key={c.description} className="flex gap-2 items-center"><p className="text-muted-foreground">{c.description}</p></div>)}</div>
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <RolesDropdownActions id={id} />
      )
    },
  },
]
