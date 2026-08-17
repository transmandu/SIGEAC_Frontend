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
import { AlertTriangle, CheckCircle2, Clock, Eye } from "lucide-react";
import { Chip, STATUS_CHIP } from "@/app/sistema/reportes/_components/errorReportChips";

const STATUS_ICON: Record<ErrorReport["status"], typeof AlertTriangle> = {
  OPEN: AlertTriangle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle2,
};

export const getColumns = (
  onViewDetail: (report: ErrorReport) => void
): ColumnDef<ErrorReport>[] => [
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
    accessorKey: "module",
    header: "Módulo",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.module ?? "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estatus",
    cell: ({ row }) => {
      const { label, tone } = STATUS_CHIP[row.original.status];
      const Icon = STATUS_ICON[row.original.status];
      return (
        <div className="flex justify-center">
          <Chip tone={tone} icon={<Icon className="h-3 w-3" />}>
            {label}
          </Chip>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Detalle</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onViewDetail(row.original)}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalle del reporte</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver detalle</TooltipContent>
        </Tooltip>
      </div>
    ),
    enableSorting: false,
  },
];
