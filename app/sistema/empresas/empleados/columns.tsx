"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Employee } from "@/types";
import { CarnetCell } from "@/app/sistema/empresas/empleados/_components/CarnetCell";
import EmployeesDropdownActions from "@/components/dropdowns/general/EmployeesDropdownActions";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";


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
    {
      accessorKey: "gender",
      header: () => null,
      size: 40,
      enableSorting: false,
      cell: ({ row }) => {
        const gender = row.original.gender;

        const isMale = gender === "MALE";
        const isFemale = gender === "FEMALE";
        const isUnknown = !gender;

        const label = isMale
          ? "Hombre"
          : isFemale
          ? "Mujer"
          : "No definido";

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border",
                      isMale &&
                        "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      isFemale &&
                        "bg-pink-500/10 text-pink-500 border-pink-500/20",
                      isUnknown &&
                        "bg-muted/40 text-muted-foreground border-muted"
                    )}
                  >
                    {isMale ? "♂" : isFemale ? "♀" : "—"}
                  </div>
                </div>
              </TooltipTrigger>

              <TooltipContent>
                {label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
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