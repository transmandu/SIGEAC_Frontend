"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { SMSActivity } from "@/types";
import { dateFormat } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import SMSActivityDropDownActions from "@/components/dropdowns/aerolinea/sms/SMSActivityDropDownActions";
import { useCompanyStore } from "@/stores/CompanyStore";
import Link from "next/link";

export type SMSActivityTableRow = SMSActivity & {
  display_activity_number?: string;
};

const ActivityNumberLink = ({ value }: { value?: string }) => {
  const { selectedCompany } = useCompanyStore();

  if (!value) {
    return (
      <div className="flex justify-center text-center text-muted-foreground">
        N/A
      </div>
    );
  }

  return (
    <div className="flex justify-center text-center">
      <Link
        href={`/${selectedCompany?.slug}/sms/promocion/actividades/${value}`}
        className="font-mono text-sm tracking-wide text-primary hover:underline underline-offset-4"
      >
        {value}
      </Link>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusClassName: Record<string, string> = {
    ABIERTO:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800",
    CERRADO:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
    PROCESO:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    PENDIENTE:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  };

  return (
    <Badge
      variant="outline"
      className={`justify-center items-center text-center font-medium font-sans text-[11px] px-2.5 py-0.5 border ${
        statusClassName[status] ??
        "bg-muted text-muted-foreground border-border/60"
      }`}
    >
      {status}
    </Badge>
  );
};

// Columnas de la tabla
export const columns: ColumnDef<SMSActivityTableRow>[] = [
  {
    accessorKey: "activity_number",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Numero de actividad" />
    ),
    meta: { title: "Numero de actividad" },
    cell: ({ row }) => <ActivityNumberLink value={row.original.activity_number} />,
  },
  {
    accessorKey: "activity_name",
    header: ({ column }) => (
      <DataTableColumnHeader
        filter
        column={column}
        title="Nombre de la actividad"
      />
    ),
    meta: { title: "Nombre de la actividad" },
    cell: ({ row }) => (
      <div className="flex justify-center text-center">
        {row.original.activity_name ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Título" />
    ),
    meta: { title: "Título" },
    cell: ({ row }) => (
      <p className="font-medium text-center italic">
        {row.original.title ?? "N/A"}
      </p>
    ),
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <DataTableColumnHeader filter column={column} title="Fecha de Inicio" />
    ),
    meta: { title: "Duracion de la Actividad" },
    cell: ({ row }) =>
      <div className="flex justify-center text-center">
        <p className="font-medium text-center">
          {dateFormat(row.original.start_date, "PPP")}
        </p>
      </div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    meta: { title: "Estado" },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <SMSActivityDropDownActions smsActivity={row.original} />
    ),
  },
];
