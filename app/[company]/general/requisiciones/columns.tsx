"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import RequisitionsDropdownActions from "@/components/dropdowns/mantenimiento/compras/RequisitionDropdownActions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Batch, Requisition } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// interface BatchesWithCountProp extends Batch {
//   article_count: number,
// }

export const columns: ColumnDef<Requisition>[] = [
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
    accessorKey: "order_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. Req." />
    ),
    meta: { title: "Nro. Req." }, // 👈 Agrega el título aquí
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Link href={`/hangar74/general/requisiciones/${row.original.order_number}`} className="text-center font-bold">{row.original.order_number}</Link>
        </div>
      )
    }
  },
  {
    accessorKey: "requested_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solicitado por" />
    ),
    meta: { title: "Solicitado por" },
    cell: ({ row }) => (
      <p className="flex text-center font-bold">{row.original.requested_by}</p>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => {
      const process = row.original.status === 'PROCESO' || row.original.status === 'COTIZADO'
      const aproved = row.original.status === 'APROBADO'
      return (
        <Badge className={cn("flex justify-center", process ? "bg-yellow-500" : aproved ? "bg-green-500" : "bg-red-500")} > {row.original.status.toUpperCase()}</Badge >
      )
    }
  },
  {
    accessorKey: "justification",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Justificación" />
    ),
    meta: { title: "Justificación" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center text-muted-foreground italic">{row.original.justification?? 'N/A'}</p>
    )
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Req." />
    ),
    meta: { title: "Fecha de c." },
    cell: ({ row }) => (
      <p className="text-center">{row.original.type}</p>
    )
  },
  {
    id: "aircraft",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aeronave" />
    ),
    cell: ({ row }) => {
      const aircraft =
        row.original.batch
          ?.flatMap(b => b.batch_articles)
          ?.find(a => a.aircraft)?.aircraft ?? "N/A"

      return (
        <p className="text-center font-medium">
          {aircraft}
        </p>
      )
    },
  },
  {
    accessorKey: "submission_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Creación" />
    ),
    meta: { title: "Fecha de c." },
    cell: ({ row }) => (
      <p className="text-center">{format(row.original.submission_date, "PPP", { locale: es })}</p>
    )
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RequisitionsDropdownActions req={row.original} />
      </div>
    )
  },
]
