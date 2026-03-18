"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import RequisitionsDropdownActions from "@/components/dropdowns/mantenimiento/compras/RequisitionDropdownActions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Batch, Requisition } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
interface BatchesWithCountProp extends Batch {
  article_count: number
}

export const getColumns = (selectedCompany?: { slug: string }): ColumnDef<Requisition>[] => [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nro. Req." />
      </div>
    ),
    meta: { title: "Nro. Req." },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          href={`/${selectedCompany?.slug}/compras/requisiciones/${row.original.order_number}`}
          className="font-bold text-center"
        >
          {row.original.order_number}
        </Link>
      </div>
    )
  },
  {
    accessorKey: "justification",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Justificación" />
      </div>
    ),
    meta: { title: "Justificación" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-muted-foreground italic text-center max-w-xs truncate">
          {row.original.justification}
        </p>
      </div>
    )
  },
  {
    accessorKey: "requested_by",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Solicitado por" />
      </div>
    ),
    meta: { title: "Solicitado por" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="font-bold text-center">
          {row.original.requested_by}
        </p>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Status" />
      </div>
    ),
    meta: { title: "Status" },
    cell: ({ row }) => {
      const process =
        row.original.status === "PROCESO" ||
        row.original.status === "COTIZADO"

      const approved = row.original.status === "APROBADO"

      return (
        <div className="flex justify-center">
          <Badge
            className={cn(
              process
                ? "bg-yellow-500"
                : approved
                ? "bg-green-500"
                : "bg-red-500"
            )}
          >
            {row.original.status.toUpperCase()}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "submission_date",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Fecha de Creación" />
      </div>
    ),
    meta: { title: "Fecha de Creación" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-center">
          {format(row.original.submission_date, "PPP", { locale: es })}
        </p>
      </div>
    )
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo de Req." />
      </div>
    ),
    meta: { title: "Tipo de Req." },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <p className="text-center">{row.original.type}</p>
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
        <RequisitionsDropdownActions req={row.original} />
      </div>
    )
  }
]