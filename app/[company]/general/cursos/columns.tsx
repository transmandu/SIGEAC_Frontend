"use client";

import CourseDropdownActions from "@/components/dropdowns/aerolinea/sms/CourseDropdownActions";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { Badge } from "@/components/ui/badge";
import { formatCalendarDate } from "@/lib/date";
import { Course } from "@/types";
import { type AppColumnDef } from "@/lib/table";
import { courseStatusLabelEsUpper } from "@/lib/cursos/statuses";

export const columns: AppColumnDef<Course>[] = [
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
          {formatCalendarDate(row.original.start_date, "long")}
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
          {formatCalendarDate(row.original.end_date, "long")}
        </p>
      );
    },
  },
  {
    accessorKey: "hora de iniciio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hora" />
    ),
    meta: { title: "Hora de Inicio" },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">{row.original.start_time}</div>
      );
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
      const status = row.original.status;
      const badgeClass =
        status === "CLOSED"
          ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
          : status === "OPEN"
            ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
            : "bg-muted text-muted-foreground border-border/60";
      return (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={`justify-center items-center text-center font-medium text-[11px] px-2.5 py-0.5 border ${badgeClass}`}
          >
            {courseStatusLabelEsUpper(status)}
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
