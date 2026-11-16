"use client";

import { type AppColumnDef } from "@/lib/table";
import { ChevronRight } from "lucide-react";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import SmsTrainingGroupDropdownActions from "@/components/dropdowns/general/SmsTrainingGroupDropdownActions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SmsTrainingGroup } from "@/types";

export const columns: AppColumnDef<SmsTrainingGroup>[] = [
  {
    id: "expander",
    size: 40,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
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
    accessorKey: "name",
    size: 220,
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
    accessorKey: "pattern",
    size: 260,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Patrón" />
      </div>
    ),
    meta: { title: "Patrón" },
    cell: ({ row }) => (
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium">
          {row.original.pattern?.name ?? "Sin patrón"}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.initial_total_hours ?? 0}h inicial /{" "}
          {row.original.recurrent_total_hours ?? 0}h recurrente
        </span>
      </div>
    ),
  },
  {
    accessorKey: "job_titles",
    size: 380,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Cargos incluidos" />
      </div>
    ),
    meta: { title: "Cargos incluidos" },
    cell: ({ row }) => (
      <div className="flex flex-wrap justify-center gap-1.5">
        {row.original.job_titles.length > 0 ? (
          row.original.job_titles.map((jobTitle) => (
            <Badge key={jobTitle.id} variant="secondary">
              {jobTitle.name}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Sin cargos</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "active_employees_count",
    size: 150,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Empleados activos" />
      </div>
    ),
    meta: { title: "Empleados activos" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm font-medium">
          {row.original.active_employees_count ?? 0}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    size: 320,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Descripción" />
      </div>
    ),
    meta: { title: "Descripción" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <span className="text-sm text-muted-foreground text-center">
          {row.original.description || "—"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    meta: { title: "Acciones" },
    cell: ({ row }) => (
      <div className="flex justify-center w-full">
        <SmsTrainingGroupDropdownActions group={row.original} />
      </div>
    ),
  },
];
