"use client";

import CourseDropdownActions from "@/components/dropdowns/aerolinea/sms/CourseDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => {
      return <div className="flex justify-center">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha de Inicio" />
    ),
    meta: { title: "Fecha de Inicio" },
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {format(row.original.start_date, "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Fecha Finalizacion"
      />
    ),
    meta: { title: "Fecha Finalizacion" },
    cell: ({ row }) => {
      return (
        <p className="font-medium text-center">
          {format(row.original.end_date, "PPP", {
            locale: es,
          })}
        </p>
      );
    },
  },
  {
    accessorKey: "Hora",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => {
      return <div className="flex justify-center">{row.original.time}</div>;
    },
  },
  {
    accessorKey: "instructor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instructor" />
    ),
    meta: { title: "Nombre" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {row.original.instructor ?? "N/A"}
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
    cell: ({ row }) => {
      const color =
        row.original.status === "PENDIENTE"
          ? "bg-red-500 hover:bg-red-700"
          : row.original.status === "TERMINADO"
            ? "bg-green-500 hover:bg-green-700"
            : "bg-gray-200"; // Agrega una clase por defecto para otros estados
      return (
        <div className="flex justify-center">
          <Badge className={`flex justify-center ${color}`}>
            {row.original.status}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original;
      return <CourseDropdownActions course={course} />;
    },
  },
];
