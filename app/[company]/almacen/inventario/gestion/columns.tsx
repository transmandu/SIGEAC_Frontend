"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import BatchDropdownActions from "@/components/dropdowns/mantenimiento/almacen/BatchDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import { cn, generateSlug } from "@/lib/utils"
import { Batch } from "@/types"
import Link from "next/link"

interface BatchesWithCountProp extends Batch {
  article_count: number,
}

export const columns: ColumnDef<BatchesWithCountProp>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <Link href={`/hangar74/almacen/inventario/gestion/${row.original.slug}`} className="font-medium flex justify-center hover:scale-105 hover:text-blue-600 transition-all ease-in cursor-pointer duration-150 text-center text-base">{row.original.name}</Link>
      )
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Descripción" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground text-center">{row.original.description}</p>
    )
  },
  {
    accessorKey: "ata_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Código ATA" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center">{row.original.ata_code}</p>
    )
  },
  {
    accessorKey: "min_quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad Mínima" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center">{row.original.min_quantity}/<span className="font-bold">{row.original.unit.label}</span></p>
    )
  },
  {
    accessorKey: "article_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad de Stock" />
    ),
    cell: ({ row }) => (
      <p className={cn("flex justify-center rounded-lg", Number(row.original.min_quantity) > Number(row.original.article_count) ? "bg-red-300 text-white" : "bg-green-200")}>{row.original.article_count} {row.original.unit.label}</p>
    )
  },
  {
    accessorKey: "warehouse_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Ubicacion" />
    ),
    cell: ({ row }) => (
      <p className="flex text-center font-medium">{row.original.warehouse_name}</p>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <BatchDropdownActions id={row.original.id} />
      )
    },
  },
]
