"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ErrorReport } from "@/types";
import { format } from "date-fns";
import { getErrorReportSeverityLabel } from "@/lib/errorReportSeverity";
import ErrorReportActionsDropdown from "./_components/ErrorReportActionsDropdown";

const STATUS_LABEL: Record<ErrorReport["status"], string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En progreso",
  RESOLVED: "Resuelto",
};

const STATUS_VARIANT: Record<ErrorReport["status"], "default" | "secondary" | "destructive" | "warning"> = {
  OPEN: "destructive",
  IN_PROGRESS: "warning",
  RESOLVED: "default",
};

export const columns: ColumnDef<ErrorReport>[] = [
  {
    accessorKey: "reported_at",
    header: "Fecha",
    cell: ({ row }) => {
      const date = row.original.reported_at;
      return <p className="whitespace-nowrap">{date ? format(new Date(date), "dd/MM/yyyy HH:mm") : "—"}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <p className="max-w-[280px] truncate">{description}</p>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm whitespace-pre-wrap">
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "module",
    header: "Módulo",
    cell: ({ row }) => row.original.module ?? "—",
  },
  {
    accessorKey: "severity",
    header: "Severidad",
    cell: ({ row }) => {
      const severityLabel = getErrorReportSeverityLabel(row.original.severity);
      return severityLabel ? (
        <Badge variant="outline">{severityLabel}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Sin clasificar</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estatus",
    cell: ({ row }) => {
      const status = row.original.status;
      const duplicateCount = row.original.duplicate_count;
      return (
        <div className="flex items-center gap-1">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          {duplicateCount > 0 && (
            <Badge variant="secondary" title="Reportes duplicados">
              x{duplicateCount + 1}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "http_status_label",
    header: "Código HTTP",
    cell: ({ row }) => {
      const label = row.original.http_status_label;
      return label ? (
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="whitespace-nowrap">
                {row.original.http_status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm whitespace-pre-wrap">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "reported_by",
    header: "Reportado por",
  },
  {
    id: "actions",
    cell: ({ row }) => <ErrorReportActionsDropdown report={row.original} />,
  },
];
