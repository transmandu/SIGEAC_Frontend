"use client"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"
import { ColumnDef } from "@tanstack/react-table"
import { ClipboardCheck } from "lucide-react"
import Link from "next/link"
import { IncomingArticle } from "./[id]/IncomingTypes"
import IncomingArticleDropdownActions from "@/components/dropdowns/mantenimiento/control_calidad/IncomingArticleDropdownActions"

export const columns: ColumnDef<IncomingArticle>[] = [
    {
    accessorKey: "batch.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center font-bold">{row.original.batch ? row.original.batch.name : "-"}</p>
    )
  },
  {
    accessorKey: "part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Parte" />
    ),
    meta: { title: "Nro. Parte" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center font-bold">{row.original.part_number}</p>
    )
  },
  {
    accessorKey: "alternative_part_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Parte Alternativo" />
    ),
    meta: { title: "Nro. Parte Alternativo" },
    cell: ({ row }) => (
      <p className="text-center italic text-muted-foreground">{row.original.alternative_part_number?.join('/ ') ?? "-"}</p>
    )
  },
  {
    accessorKey: "serial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nro. Serie" />
    ),
    meta: { title: "Nro. Serie" },
    cell: ({ row }) => (
      <p className="text-center font-medium">{row.original.serial}</p>
    )
  },
    {
    accessorKey: "ata_code",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Cod. ATA" />
    ),
    meta: { title: "Cod. ATA" }, // 👈 Agrega el título aquí
    cell: ({ row }) => {
      return (
        <p className="text-center">{row.original.ata_code ?? "-"}</p>
      )
    }
  },
  {
    accessorKey: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <IncomingArticleDropdownActions article={row.original} />
      </div>
    )
  },
]
