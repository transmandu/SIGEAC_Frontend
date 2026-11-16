"use client";

import { ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { buildDangerIdentificationDetails } from "./report-detail-helpers";
import { ReportDataGrid } from "./report-data-grid";
import { ReportSection } from "./report-section";
import { HazardNotificationLike } from "./report-detail-types";

type ReportHazardNotificationSectionProps = {
  notification: HazardNotificationLike | null;
};

export function ReportHazardNotificationSection({
  notification,
}: ReportHazardNotificationSectionProps) {
  if (!notification) {
    return null;
  }

  return (
    <ReportSection
      icon={ShieldAlert}
      title="Notificación de peligro"
      description="Clasificación y análisis inicial del peligro reportado."
      action={
        notification.report_number ? (
          <Badge variant="outline" className="tabular-nums">
            {notification.report_number}
          </Badge>
        ) : null
      }
    >
      <ReportDataGrid items={buildDangerIdentificationDetails(notification)} />
    </ReportSection>
  );
}
