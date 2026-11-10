"use client";

import { ChevronRight } from "lucide-react";

import EmployeesDropdownActions from "@/components/dropdowns/general/EmployeesDropdownActions";
import { TagBadge } from "@/components/misc/TagBadge";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { formatCalendarDate } from "@/lib/date";
import { locationLabel } from "@/lib/locations";
import { type AppColumnDef } from "@/lib/table";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types";
import { EmployeeAvatar, employeeFullName } from "./_components/EmployeeAvatar";

type EmployeeMode = "active" | "inactive";

const center = "flex w-full justify-center";

const textCell = (value?: string | null) => (
  <div className={center}>
    {value ? (
      <span className="text-center text-sm text-slate-600 dark:text-slate-300">
        {value}
      </span>
    ) : (
      <span className="text-sm text-muted-foreground">—</span>
    )}
  </div>
);

export const getEmployeeColumns = (
  mode: EmployeeMode,
): AppColumnDef<Employee>[] => [
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
    id: "employee",
    size: 320,
    // La cédula va en el texto que se filtra: es lo que más se busca.
    accessorFn: (employee) =>
      `${employeeFullName(employee)} ${employee.dni_type}-${employee.dni}`,
    meta: { title: "Empleado", mobileTitle: true },
    header: ({ column }) => (
      <div className="flex w-full justify-start">
        <DataTableColumnHeader filter column={column} title="Empleado" />
      </div>
    ),
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <div className="flex w-full items-center justify-start gap-3">
          <div className="shrink-0">
            <EmployeeAvatar employee={employee} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold wrap-anywhere text-slate-700 dark:text-slate-200 max-md:text-base">
              {employeeFullName(employee)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums max-md:text-[13px]">
              {employee.dni_type}-{employee.dni}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "job_title",
    size: 190,
    accessorFn: (employee) => employee.job_title?.name ?? "",
    meta: { title: "Cargo" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Cargo" />
      </div>
    ),
    cell: ({ row }) => textCell(row.original.job_title?.name),
  },
  {
    id: "department",
    size: 190,
    accessorFn: (employee) => employee.department?.name ?? "",
    meta: { title: "Departamento" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Departamento" />
      </div>
    ),
    cell: ({ row }) => textCell(row.original.department?.name),
  },
  {
    id: "location",
    size: 130,
    accessorFn: (employee) =>
      employee.location ? locationLabel(employee.location) : "",
    meta: { title: "Sede" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader filter column={column} title="Sede" />
      </div>
    ),
    cell: ({ row }) => {
      const { location } = row.original;

      return (
        <div className={center}>
          {location ? (
            <TagBadge tone="slate" title={locationLabel(location)}>
              {location.cod_iata || locationLabel(location)}
            </TagBadge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  mode === "active"
    ? {
        accessorKey: "start_date",
        size: 130,
        meta: { title: "Ingreso" },
        header: ({ column }) => (
          <div className={center}>
            <DataTableColumnHeader column={column} title="Ingreso" />
          </div>
        ),
        cell: ({ row }) => (
          <div className={center}>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatCalendarDate(row.original.start_date, "date", "—")}
            </span>
          </div>
        ),
      }
    : {
        accessorKey: "end_date",
        size: 130,
        meta: { title: "Egreso" },
        header: ({ column }) => (
          <div className={center}>
            <DataTableColumnHeader column={column} title="Egreso" />
          </div>
        ),
        cell: ({ row }) => (
          <div className={center}>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatCalendarDate(row.original.end_date, "date", "—")}
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
      <div className={center} onClick={(e) => e.stopPropagation()}>
        <EmployeesDropdownActions employee={row.original} />
      </div>
    ),
  },
];
