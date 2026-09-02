"use client"

import { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader"

import RequisitionsDropdownActions from "@/components/dropdowns/mantenimiento/compras/RequisitionDropdownActions"

import { cn } from "@/lib/utils"
import { DEFAULT_TIMEZONE, formatInstant, instantToCalendarDay } from "@/lib/date"
import type { Requisition } from "@/types/purchase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Plane, ClipboardList, Building2, Handshake } from "lucide-react"

import RequisitionArticlesPopover from "./_components/RequisitionArticlesPopover"
import RequisitionStatusCell from "./_components/RequisitionStatusCell"
import RequisitionDateFilter, { type DateFilterValue } from "./_components/RequisitionDateFilter"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// interface BatchesWithCountProp extends Batch {
//   article_count: number,
// }

export const getColumns = (
  selectedCompany?: { slug: string },
  timeZone: string = DEFAULT_TIMEZONE
): ColumnDef<Requisition>[] => [
  {
    accessorKey: "order_number",
    size: 210,
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Nro. Req." />
    ),
    meta: { title: "Nro. Req." },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center items-center">
          <Link
            href={`/${selectedCompany?.slug}/general/requisiciones/${row.original.order_number}`}
            className="text-center font-bold"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.order_number}
          </Link>
        </div>
      )
    }
  },
  {
    accessorKey: "requested_by",
    size: 120,
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
    // Cabe el badge de ancho fijo (6.5rem) mas el hueco del icono de compra.
    size: 150,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <RequisitionStatusCell requisition={row.original} />
    ),
  },
  {
    accessorKey: "justification",
    size: 220,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Justificación" />
    ),
    meta: { title: "Justificación" },
    cell: ({ row }) => (
      <p className="text-center flex justify-center text-muted-foreground italic">{row.original.justification?? 'N/A'}</p>
    )
  },
  {
    id: "articles",
    size: 20,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center px-0" onClick={(e) => e.stopPropagation()}>
        <RequisitionArticlesPopover requisition={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    size: 80,
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
    size: 60,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioridad" />
    ),
    meta: { title: "Prioridad" },
    cell: ({ row }) => {
      const priority = row.original.priority?.toUpperCase();

      const config = {
        HIGH: { label: "ALTA", dot: "bg-red-500" },
        MEDIUM: { label: "MEDIA", dot: "bg-yellow-500" },
        LOW: { label: "BAJA", dot: "bg-green-500" },
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
    size: 140,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Destino" />
    ),
    meta: { title: "Destino" },
    cell: ({ row }) => {
      const { aircraft, work_order, department, third_party } = row.original;

      const entries = [
        aircraft?.acronym && {
          key: "aircraft",
          label: "Aeronave",
          value: aircraft.acronym,
          icon: Plane,
        },
        work_order?.order_number && {
          key: "work_order",
          label: "O.T.",
          value: work_order.order_number,
          icon: ClipboardList,
        },
        department?.name && {
          key: "department",
          label: "Dpto",
          value: department.acronym || department.name,
          icon: Building2,
        },
        third_party?.name && {
          key: "third_party",
          label: "Tercero",
          value: third_party.name,
          icon: Handshake,
        },
      ].filter(Boolean) as {
        key: string;
        label: string;
        value: string;
        icon: typeof Plane;
      }[];

      if (entries.length === 0) {
        return (
          <div className="flex items-center justify-center font-medium">
            <span>N/A</span>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center gap-1.5">
          {entries.map(({ key, label, value, icon: Icon }) => (
            <div key={key} className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 border border-border/60 rounded px-1 leading-4">
                {label}
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm">{value}</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "submission_date",
    size: 150,
    header: ({ column }) => (
      <RequisitionDateFilter column={column} title="Fecha de Creación" />
    ),
    meta: { title: "Fecha de Creación" },
    filterFn: (row, columnId, filterValue: DateFilterValue) => {
      if (!filterValue?.from && !filterValue?.to) return true;

      const raw = row.getValue<string>(columnId);
      if (!raw) return false;

      // Se compara en texto ISO (yyyy-MM-dd) contra el día en la zona de la
      // compañía: filtrar por el día del navegador movería el rango.
      const value = instantToCalendarDay(raw, timeZone);

      if (!value) return false;

      if (filterValue.from && value < filterValue.from) return false;
      if (filterValue.to && value > filterValue.to) return false;

      return true;
    },
    cell: ({ row }) => (
      <p className="text-center text-sm text-slate-600 dark:text-slate-300 font-medium tracking-wide uppercase">
        {formatInstant(row.original.submission_date, timeZone, "short")}
      </p>
    )
  },
  {
    id: 'actions',
    // El minWidth inline pisa el de .table-sticky-right (100px), asi que el
    // ancho de la columna anclada se fija aqui.
    size: 100,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    // La tabla no cabe a lo ancho; anclar acciones evita tener que scrollear
    // hasta el final para abrir el menu de cada fila.
    meta: { title: "Acciones", sticky: "right" },
    cell: ({ row }) => (
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <RequisitionsDropdownActions req={row.original} />
      </div>
    )
  },
]
