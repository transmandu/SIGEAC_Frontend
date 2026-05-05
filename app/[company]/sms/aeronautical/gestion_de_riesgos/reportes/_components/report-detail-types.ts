"use client";

import { DangerIdentification, Location, ObligatoryReport } from "@/types";
import {
    Analysis as MaintenanceAnalysis,
    FollowUpControl as MaintenanceFollowUpControl,
    HazardNotification as MaintenanceHazardNotification,
    MitigationMeasure as MaintenanceMitigationMeasure,
    MitigationPlan as MaintenanceMitigationPlan,
    VoluntaryReport as MaintenanceVoluntaryReport,
} from "@/types/sms/mantenimiento";

export type RiskAnalysisLike = Partial<MaintenanceAnalysis> & {
    hazard_notification?: number;
    mitigation_plan_id?: number;
};

export type FollowUpControlLike = Partial<MaintenanceFollowUpControl> & {
    date?: string | Date;
    mitigation_measure_id?: number | string;
};

export type MitigationMeasureLike = Partial<MaintenanceMitigationMeasure> & {
    estimated_date?: string | Date;
    execution_date?: string | Date | null;
    follow_up_controls?: FollowUpControlLike[];
    follow_up_control?: FollowUpControlLike[];
};

export type MitigationPlanLike = Partial<MaintenanceMitigationPlan> & {
    responsible?: string;
    start_date?: string | Date;
    measures?: MitigationMeasureLike[];
    analysis?: RiskAnalysisLike | null;
};

export type HazardNotificationLike = Partial<MaintenanceHazardNotification> &
    Partial<DangerIdentification> & {
        location?: Location | null;
        mitigation_plan?: MitigationPlanLike | null;
        analysis?: RiskAnalysisLike | null;
    };

export type ReportBaseLike = {
    id: number;
    report_number?: string | null;
    status: string;
    report_date: string | Date;
    imageUrl?: string | null;
    documentUrl?: string | null;
    hazard_notification?: unknown;
    danger_identification?: unknown;
};

export type VoluntaryReportView = ReportBaseLike &
    Partial<MaintenanceVoluntaryReport> & {
        identification_date?: string | Date;
        location?: Location | null;
        identification_area?: string;
        danger_location?: string;
        danger_area?: string;
        airport_location?: string;
        danger_identification_id?: number | null;
        reporter_name?: string;
        reporter_last_name?: string;
        reporter_phone?: string;
        reporter_email?: string;
        description: string;
        possible_consequences: string;
    };

export type ObligatoryReportView = ObligatoryReport & ReportBaseLike;

export type ReportDetailViewProps =
    | {
        kind: "RVP";
        report: VoluntaryReportView | null;
        backHref: string;
        title: string;
    }
    | {
        kind: "ROS";
        report: ObligatoryReportView | null;
        backHref: string;
        title: string;
    };

export type ReportAnalysisEntry = {
    key: "hazard-notification-analysis" | "mitigation-plan-analysis";
    title: string;
    description: string;
    analysis: RiskAnalysisLike;
};
