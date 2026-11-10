"use client";

import { ChevronRight } from "lucide-react";

import PilotDropdownActions from "@/components/misc/PilotDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { type AppColumnDef } from "@/lib/table";
import { cn } from "@/lib/utils";
import type { Pilot } from "@/types";

const center = "flex w-full justify-center";

export const columns: AppColumnDef<Pilot>[] = [
  {
    id: "expander",
    size: 40,
    header: () => null,
    cell: ({ row }) => (
      <div className={center}>
        <ChevronRight
          className={cn(
            "size-3.5 text-muted-foreground/50 transition-transform",
            row.getIsExpanded() && "rotate-90 text-blue-600 dark:text-blue-400",
          )}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "dni",
    size: 160,
    accessorFn: (pilot) =>
      `${pilot.employee?.dni_type ?? "V"}-${pilot.employee_dni}`,
    meta: { title: "Cédula" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Cédula" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-sm font-medium text-slate-700 tabular-nums dark:text-slate-200">
          {row.original.employee?.dni_type ?? "V"}-{row.original.employee_dni}
        </span>
      </div>
    ),
  },
  {
    id: "name",
    size: 280,
    accessorFn: (pilot) =>
      `${pilot.employee?.first_name ?? ""} ${pilot.employee?.last_name ?? ""}`.trim(),
    meta: { title: "Piloto", mobileTitle: true },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Piloto" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
          {row.original.employee?.first_name} {row.original.employee?.last_name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "license_number",
    size: 200,
    meta: { title: "Nro. de licencia" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Nro. de licencia" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-sm text-slate-600 tabular-nums dark:text-slate-300">
          {row.original.license_number || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    enableSorting: false,
    enableHiding: false,
    meta: { title: "Acciones" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center} onClick={(event) => event.stopPropagation()}>
        <PilotDropdownActions pilot={row.original} />
      </div>
    ),
  },
];
