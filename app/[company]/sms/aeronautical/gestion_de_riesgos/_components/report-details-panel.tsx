"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

import CreateHazardNotification from "@/components/forms/mantenimiento/sms/CreateHazardNotification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { useOnChange } from "@/hooks/useOnChange";

import { DetailGrid } from "./detail-grid";
import { DetailItem, REPORT_LABELS, ReportType } from "./report-helpers";
import { HazardNotification } from "@/types/sms/mantenimiento";

type ReportDetailsPanelProps = {
  currentReport: {
    id: number;
    report_number?: string | null;
    report_date: string | Date;
    description: string;
    status: string;
  };
  currentReportType: ReportType;
  currentReportCode: string;
  currentNotification: HazardNotification | null;
  reportLocationLabel: string;
  reportDetails: DetailItem[];
  onChangeReport: () => void;
};

export function ReportDetailsPanel({
  currentReport,
  currentReportType,
  currentReportCode,
  currentNotification,
  reportLocationLabel,
  reportDetails,
  onChangeReport,
}: ReportDetailsPanelProps) {
  const hasNotification = Boolean(currentNotification);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useOnChange([currentReport.id, currentReportType], () => {
    setIsDetailsOpen(false);
  });

  return (
    <Card className="min-w-0">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg tabular-nums">
                {currentReportCode}
              </CardTitle>
              {hasNotification && (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Notificación registrada
                </Badge>
              )}
            </div>

            <CardDescription className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    currentReport.status === "ABIERTO"
                      ? "bg-red-500"
                      : currentReport.status === "CERRADO"
                        ? "bg-emerald-500"
                        : "bg-amber-500",
                  )}
                />
                {currentReport.status}
              </span>
              <span>·</span>
              <span>{REPORT_LABELS[currentReportType]}</span>
              <span>·</span>
              <span>{formatDate(currentReport.report_date)}</span>
              <span>·</span>
              <span className="truncate">
                {reportLocationLabel || "Sin ubicación asociada"}
              </span>
            </CardDescription>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsOpen((value) => !value)}
              aria-expanded={isDetailsOpen}
            >
              <FileText className="mr-2 h-4 w-4" />
              Datos del reporte
              {isDetailsOpen ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onChangeReport}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Cambiar reporte
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {isDetailsOpen && (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">
                Información completa del reporte
              </p>
              <p className="text-xs text-muted-foreground">
                Datos registrados por quien reportó el peligro.
              </p>
            </div>
            <DetailGrid items={reportDetails} />
          </div>
        )}

        <CreateHazardNotification
          key={`${currentReportType}-${currentReport.id}-${
            hasNotification ? "edit" : "create"
          }`}
          reportType={currentReportType}
          reportId={currentReport.id.toString()}
          initialData={currentNotification || undefined}
          isEditing={hasNotification}
        />
      </CardContent>
    </Card>
  );
}
