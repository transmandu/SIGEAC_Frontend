"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { dateFormat } from "@/lib/utils";
import { SMSTrainingExpiring } from "@/hooks/sms/useGetSMSTrainingExpiring";
import { type AppColumnDef } from "@/lib/table";
import { TrainingStatusBadge } from "@/components/sms/TrainingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";

function fullNameOf(row: SMSTrainingExpiring): string {
  return `${row.employee?.first_name ?? ""} ${row.employee?.last_name ?? ""}`.trim();
}

function daysLeftOf(row: SMSTrainingExpiring): number | null {
  return row.days_left;
}

export const columns: AppColumnDef<SMSTrainingExpiring>[] = [
  {
    accessorFn: (row) => fullNameOf(row),
    id: "employee_name",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Empleado" />
    ),
    meta: { title: "Empleado" },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-blue-200 shadow-xs shrink-0">
          <AvatarImage
            src={row.original.employee?.photo_url ?? ""}
            alt="Avatar"
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-500 text-white font-bold text-xs">
            {row.original.employee?.first_name?.[0]}
            {row.original.employee?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-sm uppercase text-foreground leading-tight">
            {fullNameOf(row.original) || "N/A"}
          </span>
          <span className="select-none text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-sm w-fit mt-1 border border-blue-200 dark:border-blue-900/30">
            {row.original.employee_dni}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorFn: (row) => row.course?.name ?? "",
    id: "course_name",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Curso / Capacitación"
      />
    ),
    meta: { title: "Curso / Capacitación" },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.course?.name ?? "Sin curso asignado"}
      </div>
    ),
  },
  {
    accessorKey: "expiration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de expiración" />
    ),
    meta: { title: "Fecha de expiración" },
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.expiration
          ? dateFormat(row.original.expiration, "dd/MM/yyyy")
          : "N/A"}
      </div>
    ),
  },
  {
    accessorFn: (row) => daysLeftOf(row) ?? Infinity,
    id: "days_left",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Días restantes" />
    ),
    meta: { title: "Días restantes" },
    cell: ({ row }) => {
      const days = daysLeftOf(row.original);
      const isUrgent = days !== null && days <= 10;

      return (
        <div className="flex justify-center">
          {days === null ? (
            <span className="text-muted-foreground">N/A</span>
          ) : (
            <Badge
              variant={isUrgent ? "destructive" : "outline"}
              className={isUrgent ? "gap-1" : undefined}
            >
              {isUrgent && <AlertTriangle className="h-3 w-3" />}
              {days} {days === 1 ? "día" : "días"}
            </Badge>
          )}
        </div>
      );
    },
    sortDescFirst: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TrainingStatusBadge status={row.original.status} />
      </div>
    ),
  },
];
