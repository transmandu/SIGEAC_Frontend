"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { dateFormat } from "@/lib/utils";
import { SMSTraining } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { TrainingStatusBadge } from "@/components/sms/TrainingStatusBadge";
import { TrainingHistoryDialog } from "@/components/sms/TrainingHistoryDialog";

/**
 * Cuando el estado es PENDING (el recurrente venció y hay que repetir el
 * INICIAL), la expiración actual es null. Si hay histórico, mostramos la
 * última fecha en que efectivamente venció.
 */
function lastExpiration(row: SMSTraining): Date | null {
  if (row.expiration) return new Date(row.expiration);
  const lastExpired = row.history
    ?.filter((h) => h.event_type === "EXPIRED" && h.expiration)
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];
  return lastExpired?.expiration ? new Date(lastExpired.expiration) : null;
}

export const columns: ColumnDef<SMSTraining>[] = [
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Empleado" />
    ),
    meta: { title: "Empleado" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.employee?.first_name ?? "N/A"}{" "}
        {row.original.employee?.last_name ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "base_course_id",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Fecha de Curso Inicial"
      />
    ),
    meta: { title: "Fecha de Curso Inicial" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.course?.end_date ? ( // <--- Aquí la condición
          <p className="font-medium text-center">
            {dateFormat(row.original.course?.end_date, "PPP")}
          </p>
        ) : (
          <p className="font-medium text-center">N/A</p> // O un mensaje alternativo si no existe
        )}
      </div>
    ),
  },
  {
    accessorKey: "last_enrollment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ultimo curso" />
    ),
    meta: { title: "Ultimo curso" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.last_enrollment?.course?.end_date ? ( // <--- Aquí la condición
          <p className="font-medium text-center">
            {dateFormat(row.original.last_enrollment.course.end_date, "PPP")}
          </p>
        ) : (
          <p className="font-medium text-center">N/A</p> // O un mensaje alternativo si no existe
        )}
      </div>
    ),
  },
  {
    accessorKey: "Fecha de Expiracion",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Expiracion" />
    ),
    meta: { title: "Fecha de Expiracion" },
    cell: ({ row }) => {
      const exp = lastExpiration(row.original);
      return (
        <div className="flex justify-center text-center">
          {exp ? (
            <p className="font-medium text-center">
              {dateFormat(exp, "PPP")}
            </p>
          ) : (
            <p className="font-medium text-center">N/A</p>
          )}
        </div>
      );
    },
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
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TrainingHistoryDialog training={row.original} />
      </div>
    ),
  },
];
