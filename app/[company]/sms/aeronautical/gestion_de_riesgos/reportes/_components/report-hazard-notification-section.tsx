"use client";

import { Calendar, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DetailGrid } from "../../_components/detail-grid";

import {
    buildDangerIdentificationDetails,
    formatDisplayDate,
} from "./report-detail-helpers";
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
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <ShieldAlert className="h-5 w-5" />
                        Notificación de peligro
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {notification.danger_type ? (
                            <Badge className="uppercase text-xs">
                                {String(notification.danger_type)}
                            </Badge>
                        ) : null}
                        {notification.information_source?.type ? (
                            <Badge variant="outline" className="text-xs">
                                {String(notification.information_source.type)}
                            </Badge>
                        ) : null}
                    </div>
                </div>
                <CardDescription className="flex flex-wrap gap-4 text-sm">
                    <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDisplayDate(notification.reception_date)}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-sm">Fuente:</span>{" "}
                        {notification.information_source?.name ?? "N/A"}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DetailGrid items={buildDangerIdentificationDetails(notification)} />
            </CardContent>
        </Card>
    );
}
