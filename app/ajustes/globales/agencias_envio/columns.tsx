"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ShippingAgency } from "@/types"
import { ShippingAgencyDropdownActions } from "@/components/dropdowns/general/ShippingAgencyDropdownActions"

export const getColumns = (selectedCompany?: { slug: string }): ColumnDef<ShippingAgency>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="font-bold text-center">{row.original.name}</p>
      </div>
    )
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Código" />
      </div>
    ),
    meta: { title: "Código" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-center">{row.original.code}</p> {/* font-mono removido */}
      </div>
    )
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-muted-foreground italic text-center max-w-xs truncate">
          {row.original.description ?? "-"}
        </p>
      </div>
    )
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={cn(
            row.original.type === "NATIONAL" 
              ? "bg-green-500 text-white" 
              : "bg-orange-500 text-white"
          )}
        >
          {row.original.type === "NATIONAL" ? "Nacional" : "Internacional"}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Teléfono" />
      </div>
    ),
    meta: { title: "Teléfono" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-center">{row.original.phone ?? "-"}</p>
      </div>
    )
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Email" />
      </div>
    ),
    meta: { title: "Email" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-center">{row.original.email ?? "-"}</p>
      </div>
    )
  },
  {
    id: "actions",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ShippingAgencyDropdownActions agency={row.original} />
      </div>
    )
  }
]