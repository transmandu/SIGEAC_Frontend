"use client";

import { Eye } from "lucide-react";

import { DataTableColumnHeader } from "@/components/tables/DataTableHeader";
import { TagBadge } from "@/components/misc/TagBadge";
import { SettingsRowActions } from "@/components/dropdowns/SettingsRowActions";
import { formatInstant } from "@/lib/date";
import { type AppColumnDef } from "@/lib/table";
import type { ErrorReport } from "@/types";

import { ERROR_REPORT_MODULES } from "@/lib/errorReportModules";

import { REPORT_STATUS } from "./_components/reportStatus";

const STATUS_OPTIONS = Object.entries(REPORT_STATUS).map(
  ([value, { label }]) => ({ value, label }),
);

const center = "flex justify-center w-full";

export const getColumns = (
  onViewDetail: (report: ErrorReport) => void,
  timeZone: string,
): AppColumnDef<ErrorReport>[] => [
  {
    accessorKey: "reported_at",
    size: 170,
    meta: { title: "Fecha" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader dateRangeFilter column={column} title="Fecha" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
          {formatInstant(row.original.reported_at, timeZone, "dateTime", "—")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    size: 420,
    meta: { title: "Descripción", mobileTitle: true },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader
          filter
          column={column}
          title="Descripción"
          filterHint="Busque el texto en la descripción de sus reportes."
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span
          className="line-clamp-2 max-w-95 text-center text-sm leading-snug text-slate-600 wrap-break-word max-md:text-base max-md:font-semibold max-md:text-slate-700 dark:text-slate-300 dark:max-md:text-slate-200"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "module",
    size: 180,
    meta: { title: "Módulo" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader
          column={column}
          title="Módulo"
          filterOptions={ERROR_REPORT_MODULES}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.original.module ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    size: 160,
    meta: { title: "Estatus" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader
          column={column}
          title="Estatus"
          filterOptions={STATUS_OPTIONS}
        />
      </div>
    ),
    cell: ({ row }) => {
      const { label, tone, icon } = REPORT_STATUS[row.original.status];

      return (
        <div className={center}>
          <TagBadge tone={tone} icon={icon}>
            {label}
          </TagBadge>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 100,
    enableSorting: false,
    meta: { title: "Acciones" },
    header: ({ column }) => (
      <div className={center}>
        <DataTableColumnHeader column={column} title="Acciones" />
      </div>
    ),
    cell: ({ row }) => (
      <div className={center}>
        <SettingsRowActions
          actions={[
            {
              key: "detail",
              label: "Ver detalle",
              icon: Eye,
              tone: "blue",
              onSelect: () => onViewDetail(row.original),
            },
          ]}
        />
      </div>
    ),
  },
];
