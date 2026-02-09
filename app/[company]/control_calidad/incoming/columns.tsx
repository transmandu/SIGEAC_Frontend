"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Checkbox } from "@/components/ui/checkbox"
import { Batch } from "@/types"
import { ClipboardCheck } from "lucide-react"


interface IncomingArticle {
  id: number
  batch: Batch,
  part_number: string
  alt_part_number?: string[]
  serial: string,
  ata_code: string,
  condition: string,
  fabricant: string,
  fabrication_date: Date,
  expiration_date: Date,
  life_limit_part_cycles: number | string,
  life_limit_part_hours: number | string,
  life_limit_part_calendar: Date,
  hard_time_cycles: number | string,
  hard_time_hours: number | string,
  hard_time_calendar: Date,
  observations: string,
}

export const columns: ColumnDef<IncomingArticle>[] = [
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
    accessorKey: "ata_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. Req." />
    ),
    meta: { title: "Nro. Req." }, // 👈 Agrega el título aquí
    cell: ({ row }) => {
      return (
        <p className="text-center">{row.original.ata_code}</p>
      )
    }
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Parte" />
    ),
    meta: { title: "Nro. Parte" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center text-muted-foreground italic">{row.original.part_number}</p>
    )
  },
  {
    accessorKey: "alt_part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Parte Alternativo" />
    ),
    meta: { title: "Nro. Parte Alternativo" },
    cell: ({ row }) => (
      <p className="text-center">{row.original.alt_part_number?.join('/ ')}</p>
    )
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Serie" />
    ),
    meta: { title: "Nro. Serie" },
    cell: ({ row }) => (
      <p className="text-center">{row.original.serial}</p>
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
        <ClipboardCheck />
      </div>
    )
  },
]
