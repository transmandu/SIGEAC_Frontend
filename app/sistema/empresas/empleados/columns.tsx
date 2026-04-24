"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Employee } from "@/types";
import { CarnetCell } from "@/app/sistema/empresas/empleados/_components/CarnetCell";
import EmployeesDropdownActions from "@/components/dropdowns/general/EmployeesDropdownActions";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type EmployeeMode = "active" | "inactive";

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(year, month - 1, day));
};

export const getEmployeeColumns = (
  mode: EmployeeMode,
  expandedRowId: string | false,
  setExpandedRowId: (id: string | false) => void
): ColumnDef<Employee>[] => {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const isExpanded = expandedRowId === row.id;
        return (
          <ChevronRight
            className={cn(
              "size-3.5 text-muted-foreground/50 transition-transform duration-200 cursor-pointer",
              isExpanded && "rotate-90 text-amber-600 dark:text-amber-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedRowId(isExpanded ? false : row.id);
            }}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "first_name",
      meta: { title: "Nombre" },
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Nombre" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center font-bold">
          {row.original.first_name}
        </div>
      ),
    },
    {
      accessorKey: "middle_name",
      meta: { title: "Segundo Nombre" },
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader column={column} title="Segundo Nombre" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center text-muted-foreground">
          {row.original.middle_name ?? "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "last_name",
      meta: { title: "Apellido" },
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Apellido" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center font-bold">
          {row.original.last_name}
        </div>
      ),
    },
    {
      accessorKey: "second_last_name",
      meta: { title: "Segundo Apellido" },
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Segundo Apellido" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center text-muted-foreground">
          {row.original.second_last_name ?? "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "dni",
      meta: { title: "Cédula" },
      header: ({ column }) => (
        <div className="flex justify-center w-full">
          <DataTableColumnHeader filter column={column} title="Cédula" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center font-semibold italic text-muted-foreground">
          {row.original.dni_type}-{row.original.dni}
        </div>
      ),
    },
    mode === "active"
      ? {
          accessorKey: "start_date",
          meta: { title: "Fecha Ingreso" },
          header: ({ column }) => (
            <div className="flex justify-center w-full">
              <DataTableColumnHeader filter column={column} title="Ingreso" />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex justify-center text-sm text-muted-foreground">
              {formatDate(row.original.start_date)}
            </div>
          ),
        }
      : {
          accessorKey: "end_date",
          meta: { title: "Fecha Egreso" },
          header: ({ column }) => (
            <div className="flex justify-center w-full">
              <DataTableColumnHeader filter column={column} title="Egreso" />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex justify-center text-sm text-muted-foreground">
              {formatDate(row.original.end_date)}
            </div>
          ),
        },
    {
      id: "carnet",
      meta: { title: "Img. Carnet" },
      header: () => (
        <div className="flex justify-center w-full">Img. Carnet</div>
      ),
      cell: ({ row }) => (
        <CarnetCell photoUrl={row.original.photo_url} />
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <EmployeesDropdownActions employee={row.original} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }
  ];
};