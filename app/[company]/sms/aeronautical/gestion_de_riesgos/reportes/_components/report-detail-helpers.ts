"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { DetailItem, formatLocationLabel as sharedFormatLocationLabel } from "../../_components/report-helpers";

import {
    FollowUpControlLike,
    HazardNotificationLike,
    MitigationMeasureLike,
    MitigationPlanLike,
    ObligatoryReportView,
    ReportAnalysisEntry,
    ReportBaseLike,
    RiskAnalysisLike,
    VoluntaryReportView,
} from "./report-detail-types";

export const formatDisplayDate = (value?: string | Date | null) =>
    value
        ? (() => {
            const date = value instanceof Date ? value : new Date(value);
            return Number.isNaN(date.getTime()) ? "N/A" : format(date, "PPP", { locale: es });
        })()
        : "N/A";

export const formatLocationLabel = sharedFormatLocationLabel;

export const getAny = (obj: any, ...keys: string[]) => {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
};

export const normalizeControls = (measure?: MitigationMeasureLike | null): FollowUpControlLike[] =>
    (getAny(
        measure,
        "follow_up_controls",
        "follow_up_control",
        "followupcontrols",
        "followup_controls",
        "followupControl",
        "followup_control",
    ) ?? []) as FollowUpControlLike[];

export const normalizeHazardNotification = (raw: any): HazardNotificationLike | null => {
    if (!raw) return null;

    const informationSource = getAny(raw, "information_source", "informationsource", "informationSource");
    const location = getAny(raw, "location", "location_id");
    const mitigation = getAny(raw, "mitigation_plan", "mitigationplan", "mitigationPlan");

    const normalizedMitigation: MitigationPlanLike | null = mitigation
        ? {
            ...mitigation,
            measures: (mitigation.measures ?? mitigation.Measures ?? mitigation.measures_list ?? []).map(
                (measure: any) => ({
                    ...measure,
                    follow_up_controls:
                        getAny(
                            measure,
                            "follow_up_controls",
                            "follow_up_control",
                            "followupcontrols",
                            "followup_controls",
                        ) ?? [],
                    follow_up_control:
                        getAny(
                            measure,
                            "follow_up_control",
                            "follow_up_controls",
                            "followupcontrols",
                            "followup_controls",
                        ) ?? [],
                }),
            ) as MitigationMeasureLike[],
        }
        : null;

    return {
        id: getAny(raw, "id"),
        report_number: getAny(raw, "report_number", "reportNumber"),
        reception_date: getAny(raw, "reception_date", "receptionDate"),
        location: location || null,
        identification_area: getAny(raw, "identification_area", "identificationArea"),
        danger_type: getAny(raw, "danger_type", "dangerType", "danger"),
        information_source: informationSource ?? null,
        description: getAny(raw, "description"),
        analysis_of_root_causes: getAny(
            raw,
            "analysis_of_root_causes",
            "analysisOfRootCauses",
            "analysis_of_root_cause",
            "analysis",
        ),
        report_type: getAny(raw, "report_type", "reportType"),
        voluntary_report:
            getAny(raw, "voluntary_report", "voluntaryreport", "voluntaryReport") ?? undefined,
        obligatory_report:
            getAny(raw, "obligatory_report", "obligatoryreport", "obligatoryReport") ?? undefined,
        mitigation_plan: normalizedMitigation,
        analysis: getAny(raw, "analysis") ?? null,
        current_defenses: getAny(
            raw,
            "current_defenses",
            "currentDefenses",
            "defensas_actuales",
            "defensasActuales",
        ) as any,
        possible_consequences: getAny(raw, "possible_consequences", "possibleConsequences"),
        consequence_to_evaluate: getAny(raw, "consequence_to_evaluate", "consequenceToEvaluate"),
    } as HazardNotificationLike;
};

export const getHazardNotification = (report: ReportBaseLike | null) => {
    if (!report) return null;
    const raw = getAny(
        report,
        "hazard_notification",
        "hazardnotification",
        "danger_identification",
        "dangeridentification",
        "dangerIdentification",
    );
    return normalizeHazardNotification(raw);
};

export const getSeverityBadgeClass = (severity?: string) => {
    const value = String(severity ?? "").toLowerCase();
    if (value.includes("alto") || value.includes("high")) return "bg-red-600 text-white";
    if (value.includes("medio") || value.includes("medium") || value.includes("med")) {
        return "bg-amber-400 text-black";
    }
    if (value.includes("bajo") || value.includes("low")) return "bg-emerald-600 text-white";
    return "bg-gray-200 text-gray-800";
};

export const getProbabilityBadgeClass = (probability?: string | number) => {
    const value = String(probability ?? "").toLowerCase();
    const numericValue = Number(value);

    if (
        value.includes("alta") ||
        value.includes("high") ||
        (!Number.isNaN(numericValue) && numericValue >= 70)
    ) {
        return "bg-red-600 text-white";
    }
    if (
        value.includes("media") ||
        value.includes("medium") ||
        (!Number.isNaN(numericValue) && numericValue >= 40 && numericValue < 70)
    ) {
        return "bg-amber-400 text-black";
    }
    if (
        value.includes("baja") ||
        value.includes("low") ||
        (!Number.isNaN(numericValue) && numericValue < 40)
    ) {
        return "bg-emerald-600 text-white";
    }
    return "bg-gray-200 text-gray-800";
};

export const buildAnalysisDetails = (analysis?: RiskAnalysisLike | null): DetailItem[] => [
    { label: "Probabilidad", value: analysis?.probability || "N/A" },
    { label: "Severidad", value: analysis?.severity || "N/A" },
    { label: "Resultado", value: analysis?.result || "N/A" },
    { label: "Tipo", value: analysis?.type || "N/A" },
];

export const getReportCode = (report: { id: number; report_number?: string | null }, type: "RVP" | "ROS") => {
    const prefix = type === "RVP" ? "RVP" : "ROS";
    return report.report_number ? `${prefix}-${report.report_number}` : `${prefix}-${report.id}`;
};

export const buildVoluntaryDetails = (report: VoluntaryReportView): DetailItem[] => [
    { label: "Codigo", value: getReportCode(report, "RVP") },
    { label: "Fecha del reporte", value: formatDisplayDate(report.report_date) },
    { label: "Fecha de identificacion", value: formatDisplayDate(report.identification_date) },
    { label: "Estado", value: report.status },
    { label: "Lugar del peligro", value: report.danger_location || formatLocationLabel(report.location) },
    { label: "Area del peligro", value: report.danger_area || report.identification_area },
    { label: "Ubicacion del aeropuerto", value: report.airport_location || "N/A" },
    { label: "Identificacion vinculada", value: report.danger_identification_id ?? "N/A" },
    { label: "Nombre", value: report.reporter_name || "N/A" },
    { label: "Apellido", value: report.reporter_last_name || "N/A" },
    { label: "Telefono", value: report.reporter_phone || "N/A" },
    { label: "Correo", value: report.reporter_email || "N/A" },
    {
        label: "Descripcion",
        value: report.description,
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Posibles consecuencias",
        value: report.possible_consequences,
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
];

export const buildObligatoryDetails = (report: ObligatoryReportView): DetailItem[] => [
    { label: "Codigo", value: getReportCode(report, "ROS") },
    { label: "Fecha del reporte", value: formatDisplayDate(report.report_date) },
    { label: "Estado", value: report.status },
    { label: "Fecha del incidente", value: formatDisplayDate(report.incident_date) },
    { label: "Hora del incidente", value: report.incident_time || "N/A" },
    { label: "Tiempo de vuelo", value: report.flight_time || "N/A" },
    { label: "Numero de vuelo", value: report.flight_number },
    { label: "Origen", value: report.flight_origin },
    { label: "Destino", value: report.flight_destiny },
    { label: "Destino alterno", value: report.flight_alt_destiny },
    { label: "Lugar del incidente", value: report.incident_location },
    {
        label: "Incidentes",
        value: report.incidents || "Sin incidentes registrados",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Otros incidentes",
        value: report.other_incidents || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Descripcion",
        value: report.description,
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
];

export const buildCrewAndAircraftDetails = (report: ObligatoryReportView): DetailItem[] => [
    { label: "Piloto", value: report.pilot?.employee_dni || "N/A" },
    { label: "Licencia piloto", value: report.pilot?.license_number || "N/A" },
    { label: "Copiloto", value: report.copilot?.employee_dni || "N/A" },
    { label: "Licencia copiloto", value: report.copilot?.license_number || "N/A" },
    { label: "Aeronave", value: report.aircraft?.acronym || "N/A" },
    { label: "Marca", value: report.aircraft?.brand || "N/A" },
    { label: "Modelo", value: report.aircraft?.model || "N/A" },
    { label: "Serial", value: report.aircraft?.serial || "N/A" },
    { label: "Estado aeronave", value: report.aircraft?.status || "N/A" },
];

export const buildDangerIdentificationDetails = (notification: HazardNotificationLike): DetailItem[] => [
    { label: "Codigo", value: notification.report_number ?? notification.id ?? "N/A" },
    {
        label: "Fecha de recepcion",
        value: formatDisplayDate(notification.reception_date || notification.risk_management_start_date),
    },
    { label: "Tipo de reporte", value: notification.report_type || "N/A" },
    { label: "Peligro", value: notification.danger || notification.danger_type || "N/A" },
    { label: "Area", value: notification.identification_area || notification.danger_area || "N/A" },
    { label: "Ubicacion", value: notification.location ? formatLocationLabel(notification.location) : "N/A" },
    { label: "Fuente de informacion", value: notification.information_source?.name || "N/A" },
    {
        label: "Defensas actuales",
        value: notification.current_defenses,
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Descripcion",
        value: notification.description,
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Analisis de causas raiz",
        value: notification.analysis_of_root_causes || notification.root_cause_analysis,
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Posibles consecuencias",
        value: notification.possible_consequences || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Consecuencia a evaluar",
        value: notification.consequence_to_evaluate || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    { label: "Fecha de gestion", value: formatDisplayDate(notification.risk_management_start_date) },
];

export const buildMitigationPlanDetails = (plan: MitigationPlanLike): DetailItem[] => [
    { label: "Codigo", value: plan.id ?? "N/A" },
    { label: "Area responsable", value: plan.area_responsible || plan.responsible || "N/A" },
    { label: "Fecha de inicio", value: formatDisplayDate(plan.start_date) },
    {
        label: "Posibles consecuencias",
        value: plan.possible_consequences || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Consecuencia a evaluar",
        value: plan.consequence_to_evaluate || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Descripcion",
        value: plan.description || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
];

export const buildMeasureDetails = (measure: MitigationMeasureLike): DetailItem[] => [
    { label: "Codigo", value: measure.id ?? "N/A" },
    {
        label: "Descripcion",
        value: measure.description || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    {
        label: "Supervisor de implementacion",
        value: measure.implementation_supervisor || "N/A",
    },
    {
        label: "Responsable de implementacion",
        value: measure.implementation_responsible || "N/A",
    },
    { label: "Fecha estimada", value: formatDisplayDate(measure.estimated_date) },
    { label: "Fecha de ejecucion", value: formatDisplayDate(measure.execution_date) },
];

export const buildControlDetails = (control: FollowUpControlLike): DetailItem[] => [
    { label: "Codigo", value: control.id ?? "N/A" },
    { label: "Fecha", value: formatDisplayDate(control.date) },
    {
        label: "Descripcion",
        value: control.description || "N/A",
        fullWidth: true,
        contentClassName: "whitespace-pre-wrap",
    },
    { label: "Imagen", value: control.image || "N/A" },
    { label: "Documento", value: control.document || "N/A" },
];

export const buildAnalysisEntries = (
    notification: HazardNotificationLike | null,
    mitigationPlan: MitigationPlanLike | null,
): ReportAnalysisEntry[] => {
    const entries: ReportAnalysisEntry[] = [];

    if (notification?.analysis) {
        entries.push({
            key: "hazard-notification-analysis",
            title: "Análisis de hazard notification",
            description: "Evaluación asociada a la notificación de peligro.",
            analysis: notification.analysis,
        });
    }

    if (mitigationPlan?.analysis) {
        entries.push({
            key: "mitigation-plan-analysis",
            title: "Análisis del plan de mitigación",
            description: "Evaluación asociada al plan y sus medidas.",
            analysis: mitigationPlan.analysis,
        });
    }

    return entries;
};

export const handleDownloadImage = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error downloading image:", error);
        window.open(url, "_blank");
    }
};
