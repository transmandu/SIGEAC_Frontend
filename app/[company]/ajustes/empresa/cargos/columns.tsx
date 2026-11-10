"use client";

import JobTitleDropdownActions from "@/components/dropdowns/general/JobTitleDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { type AppColumnDef } from "@/lib/table";
import { JobTitle } from "@/types";

const center = "flex w-full justify-center";

export const columns: AppColumnDef<JobTitle>[] = [
  {
    accessorKey: "name",
    size: 280,
    meta: { title: "Cargo", mobileTitle: true },
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader filter column={column} title="Cargo" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    size: 420,
    meta: { title: "Descripción" },
    header: ({ column }) => (
      <div className="flex w-full justify-center">
        <DataTableColumnHeader filter column={column} title="Descripción" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-full justify-center">
        {row.original.description ? (
          <span className="line-clamp-2 text-center text-sm text-slate-600 dark:text-slate-300">
            {row.original.description}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "employees_count",
    size: 130,
    meta: { title: "Empleados" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Empleados" />
      </div>
    ),
    cell: ({ row }) => {
      const count = row.original.employees_count ?? 0;

      return (
        <div className={center}>
          <span
            className={
              count > 0
                ? "text-sm text-slate-700 tabular-nums dark:text-slate-200"
                : "text-sm text-muted-foreground tabular-nums"
            }
          >
            {count}
          </span>
        </div>
      );
    },
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
      <div className={center}>
        <JobTitleDropdownActions jobTitle={row.original} />
      </div>
    ),
  },
];
