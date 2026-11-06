"use client";

import { ArrowLeftRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { HazardNotification } from "@/types/sms/mantenimiento";

import { getNotificationSource, getWorkflowStatus } from "./workflow-helpers";

type EvaluationWorkflowHeaderProps = {
  selectedNotification: HazardNotification;
  onChangeNotification: () => void;
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  RVP: "Reporte voluntario",
  ROS: "Reporte obligatorio",
};

export function EvaluationWorkflowHeader({
  selectedNotification,
  onChangeNotification,
}: EvaluationWorkflowHeaderProps) {
  const workflowStatus = getWorkflowStatus(selectedNotification);

  return (
    <CardHeader className="border-b">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">
              {getNotificationSource(selectedNotification)}
            </CardTitle>
            <Badge className={cn("border", workflowStatus.className)}>
              {workflowStatus.label}
            </Badge>
          </div>

          <CardDescription>
            {REPORT_TYPE_LABELS[selectedNotification.report_type] ||
              selectedNotification.report_type}
            <span className="mx-1.5">·</span>
            Recepción {formatDate(selectedNotification.reception_date)}
            {selectedNotification.identification_area ? (
              <>
                <span className="mx-1.5">·</span>
                {selectedNotification.identification_area}
              </>
            ) : null}
          </CardDescription>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {selectedNotification.description}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onChangeNotification}
        >
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Cambiar notificación
        </Button>
      </div>
    </CardHeader>
  );
}
