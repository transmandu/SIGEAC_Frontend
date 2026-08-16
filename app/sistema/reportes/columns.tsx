"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ErrorReport } from "@/types";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock, Stethoscope } from "lucide-react";
import { getErrorReportSeverityLabel } from "@/lib/errorReportSeverity";
import { Chip, STATUS_CHIP, httpStatusTone } from "./_components/errorReportChips";
import ErrorReportActionsDropdown from "./_components/ErrorReportActionsDropdown";

const STATUS_ICON: Record<ErrorReport["status"], typeof AlertTriangle> = {
  OPEN: AlertTriangle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
};

export function getColumns(
  onViewDiagnosis: (report: ErrorReport) => void,
  isSuperUser: boolean
): ColumnDef<ErrorReport>[] {
  const columns: ColumnDef<ErrorReport>[] = [
    {
      accessorKey: "reported_at",
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.original.reported_at;
        return (
          <p className="whitespace-nowrap text-sm">
            {date ? format(new Date(date), "dd/MM/yyyy HH:mm") : "—"}
          </p>
        );
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
                <p className="max-w-[280px] truncate text-sm">{description}</p>
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
      accessorKey: "company_slug",
      header: "Empresa",
      cell: ({ row }) => {
        const company = row.original.company_slug;
        return (
          <div className="flex justify-center">
            {company ? (
              <Chip tone="slate">{company.toUpperCase()}</Chip>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "module",
      header: "Módulo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.module ?? "—"}</span>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severidad",
      cell: ({ row }) => {
        const severityLabel = getErrorReportSeverityLabel(row.original.severity);
        return (
          <div className="flex justify-center">
            {severityLabel ? (
              <Chip tone="indigo">{severityLabel}</Chip>
            ) : (
              <span className="text-xs text-muted-foreground">Sin clasificar</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estatus",
      cell: ({ row }) => {
        const status = row.original.status;
        const duplicateCount = row.original.duplicate_count;
        const { label, tone } = STATUS_CHIP[status];
        const Icon = STATUS_ICON[status];
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Chip tone={tone} icon={<Icon className="h-3 w-3" />}>
              {label}
            </Chip>
            {duplicateCount > 1 && (
              <span
                title="Reportes duplicados"
                className="select-none rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                ×{duplicateCount}
              </span>
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
        return (
          <div className="flex justify-center">
            {label ? (
              <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span>
                      <Chip tone={httpStatusTone(row.original.http_status)}>
                        {row.original.http_status}
                      </Chip>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm whitespace-pre-wrap">{label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "reported_by",
      header: "Reportado por",
      cell: ({ row }) => <span className="text-sm">{row.original.reported_by}</span>,
    },
  ];

  if (isSuperUser) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border-slate-200/80 text-xs font-medium shadow-none dark:border-slate-800/80"
            onClick={() => onViewDiagnosis(row.original)}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Ver diagnóstico
          </Button>
          <div className="w-8 shrink-0">
            <ErrorReportActionsDropdown report={row.original} />
          </div>
        </div>
      ),
    });
  }

  return columns;
}
