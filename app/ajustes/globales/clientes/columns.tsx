"use client"

import WarehouseDropdownActions from "@/components/misc/WarehouseDropdownActions"
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { Client } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nombre" />
    ),
    meta: { title: 'Nombre' },
    cell: ({ row }) =>
      <>
        <Link href={`/ajustes/clientes/${row.original.id}`} className='font-bold flex justify-center hover:scale-110 transition-all ease-in '>{row.original.name ?? "N/A"}</Link>
      </>
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo Electronico" />
    ),
    meta: { title: 'Email' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.email}</span>
      </>
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. de TLF" />
    ),
    meta: { title: 'Nro. de TLF' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.phone}</span>
      </>
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubiación" />
    ),
    meta: { title: 'Ubicacion' },
    cell: ({ row }) =>
      <>
        <span className='text-muted-foreground flex justify-center italic'>{row.original.address}</span>
      </>
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <WarehouseDropdownActions id={id.toString()} />
      )
    },
  },
]
