"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import RequisitionsDropdownActions from "@/components/dropdowns/mantenimiento/compras/RequisitionDropdownActions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Requisition } from "@/types/purchase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Plane } from "lucide-react"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// interface BatchesWithCountProp extends Batch {
//   article_count: number,
// }

export const getColumns = (
  selectedCompany?: { slug: string }
): ColumnDef<Requisition>[] => [
  {
    accessorKey: "order_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. Req." />
    ),
    meta: { title: "Nro. Req." },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center items-center">
          <Link href={`/${selectedCompany?.slug}/general/requisiciones/${row.original.order_number}`} className="text-center font-bold">{row.original.order_number}</Link>
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
      <p className="flex text-center justify-center items-center font-bold">{row.original.requested_by ?? "-"}</p>
    )
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => {
      const status = row.original.status?.toUpperCase();

      const isProcess = status === "PROCESO" || status === "COTIZADO";
      const isApproved = status === "APROBADO";

      return (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "text-[11px] px-2 py-0 h-5 leading-none font-medium",
              isProcess
                ? "bg-yellow-500 text-white"
                : isApproved
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            )}
          >
            {status}
          </Badge>
        </div>
      );
    },
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
    meta: { title: "Tipo de Req." },
    cell: ({ row }) => (
      <p className="text-center">{row.original.type}</p>
    )
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioridad" />
    ),
    meta: { title: "Prioridad" },
    cell: ({ row }) => {
      const priority = row.original.priority?.toUpperCase();

      const config = {
        ALTA: { label: "Alta", dot: "bg-red-500" },
        HIGH: { label: "Alta", dot: "bg-red-500" },
        MEDIA: { label: "Media", dot: "bg-yellow-500" },
        MEDIUM: { label: "Media", dot: "bg-yellow-500" },
        BAJA: { label: "Baja", dot: "bg-green-500" },
        LOW: { label: "Baja", dot: "bg-green-500" },
      } as const;

      const value = config[priority as keyof typeof config] ?? {
        label: "N/A",
        dot: "bg-gray-400",
      };

      return (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", value.dot)} />
            <span>{value.label}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "aircraft",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aeronave" />
    ),
    meta: { title: "Aeronave" },
    cell: ({ row }) => {
      const aircraft = row.original.aircraft;
      const acronym = aircraft?.acronym;

      const hasAircraft = Boolean(acronym);

      return (
        <div className="flex items-center justify-center gap-2 font-medium">
          {hasAircraft && (
            <Plane className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{acronym ?? "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "submission_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Creación" />
    ),
    meta: { title: "Fecha de Creación" },
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
