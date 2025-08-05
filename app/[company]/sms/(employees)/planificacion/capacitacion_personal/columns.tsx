"use client";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { dateFormat } from "@/lib/utils";
import { SMSTraining } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

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
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.expiration ? ( // <--- Aquí la condición
          <p className="font-medium text-center">
            {dateFormat(row.original.expiration, "PPP")}
          </p>
        ) : (
          <p className="font-medium text-center">N/A</p> // O un mensaje alternativo si no existe
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          className={`justify-center items-center text-center font-bold font-sans
          ${
            row.original.status === "PENDIENTE" ? "bg-red-400" : "bg-green-500" // Color gris oscuro (puedes ajustar el tono)
          }`}
        >
          {row.original.status}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div></div>
      // <SMSActivityDropDownActions smsActivity={row.original} />
    ),
  },
];
