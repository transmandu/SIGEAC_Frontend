"use client";

import { type AppColumnDef } from "@/lib/table";
import { ChevronRight } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import { cn } from "@/lib/utils";
import { Vendor } from "@/types";
import VendorDropdownActions from "@/components/dropdowns/general/VendorDropdownActions";

export const getColumns = (selectedCompany?: {
  slug: string;
}): AppColumnDef<Vendor>[] => [
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
    accessorKey: "email",
    size: 240,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Correo" />
      </div>
    ),
    meta: { title: "Correo" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center">
          {row.original.email ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Teléfono" />
      </div>
    ),
    meta: { title: "Teléfono" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-slate-600 dark:text-slate-300 text-center tabular-nums">
          {row.original.phone ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 160,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Tipo" />
      </div>
    ),
    meta: { title: "Tipo" },
    cell: ({ row }) => {
      const isVendor = row.original.type === "VENDOR";
      return (
        <div className="flex justify-center w-full">
          <TagBadge tone={isVendor ? "blue" : "emerald"}>
            {isVendor ? "Proveedor" : "Beneficiario"}
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
        <VendorDropdownActions vendor={row.original} />
      </div>
    ),
  },
];
