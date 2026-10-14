"use client";

import { type AppColumnDef } from "@/lib/table";
import { ChevronRight } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import { cn } from "@/lib/utils";
import { ShippingAgency } from "@/types";
import ShippingAgencyDropdownActions from "@/components/dropdowns/general/ShippingAgencyDropdownActions";

export const getColumns = (selectedCompany?: {
  slug: string;
}): AppColumnDef<ShippingAgency>[] => [
  {
    id: "expander",
    size: 40,
    header: () => null,
    cell: ({ row }) => {
      const canExpand = row.getCanExpand();
      return (
        <div className="flex justify-center w-full">
          {canExpand ? (
            <ChevronRight
              className={cn(
                `size-3.5 text-muted-foreground/50 transition-transform`,
                row.getIsExpanded() &&
                  `rotate-90 text-blue-600 dark:text-blue-400`,
              )}
            />
          ) : (
            <div className="size-3.5" />
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    size: 260,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader filter column={column} title="Nombre" />
      </div>
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "code",
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Código" />
      </div>
    ),
    meta: { title: "Código" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.code ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    size: 420,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span
          className="block max-w-95 text-sm text-slate-600 dark:text-slate-300 text-center whitespace-normal wrap-break-word leading-snug"
          title={row.original.description ?? ""}
        >
          {row.original.description ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 180,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => {
      const isNational = row.original.type === "NATIONAL";
      return (
        <div className="flex justify-center w-full">
          <TagBadge tone={isNational ? "blue" : "violet"}>
            {isNational ? "Nacional" : "Internacional"}
          </TagBadge>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 120,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div
        className="flex justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <ShippingAgencyDropdownActions agency={row.original} />
      </div>
    ),
  },
];
