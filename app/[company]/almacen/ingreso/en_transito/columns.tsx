"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import InTransitArticleDropdownActions from "@/components/dropdowns/mantenimiento/almacen/InTransitArticleDropdownActions"
import { Checkbox } from "@/components/ui/checkbox"
import { Manufacturer } from "@/types"

interface IArticlesInTransit {
  id?: number,
  part_number: string,
  serial?: string,
  name: string,
  description?: string,
  name_manufacturer?: string,
  condition?: string,
  image?: File | string,
}


export const columns: ColumnDef<IArticlesInTransit>[] = [
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
    accessorKey: "batch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <p className="flex justify-center font-bold uppercase">
          {row.original.name}
        </p>
      )
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      return (
        <p className="flex justify-center font-bold uppercase">
          {row.original.description}
        </p>
      )
    }
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. de Parte" />
    ),
    cell: ({ row }) => {
      return (
        <p className="font-medium flex justify-center hover:scale-105 hover:text-blue-600 transition-all ease-in cursor-pointer duration-150">{row.original.part_number}</p>
      )
    }
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Serial" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center text-muted-foreground italic">{row.original.serial ?? "N/A"}</p>
    )
  },
  {
    accessorKey: "name_manufacturer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fabricante" />
    ),
    cell: ({ row }) => (
      <p className="flex justify-center font-bold">{row.original.name_manufacturer ?? "N/A"}</p>
    )
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => (
      <p className="text-center font-medium italic">{row.original.condition}</p>
    )
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <p className="text-center font-medium italic">En USA - TEST</p>
    )
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      return (
        <InTransitArticleDropdownActions id={row.original.id!} />
      )
    },
  },
]
