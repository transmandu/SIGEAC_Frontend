"use client";

import { createElement } from "react";
import { formatCalendarDate } from "@/lib/date";
import { getResult } from "@/lib/utils";

import {
  DetailItem,
  formatLocationLabel as sharedFormatLocationLabel,
} from "@/app/[company]/sms/aeronautical/gestion_de_riesgos/_components/report-helpers";

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
import { formatPhone } from "@/lib/phone";

const parseDelimitedDetailItems = (value?: string | null) => {
  if (!value) {
    return [];
  }

  const source = value.includes("~") ? value.split("~") : value.split(/\n|,/);

  return source.map((item) => item.trim()).filter(Boolean);
};

const renderNumberedDetailValue = (
  value?: string | null,
  fallback?: string,
) => {
  const items = parseDelimitedDetailItems(value);

  if (!items.length) {
    return fallback;
  }

  if (items.length === 1) {
    return items[0];
  }

  return createElement(
    "ol",
    { className: "list-decimal space-y-1 pl-5" },
    items.map((item, index) =>
      createElement("li", { key: `${index}-${item}` }, item),
    ),
  );
};

// Los reportes SMS fechan por día (report_date, incident_date): sin convertir.
export const formatDisplayDate = (value?: string | Date | null) =>
  formatCalendarDate(value, "long");

export const formatLocationLabel = sharedFormatLocationLabel;

export const getAny = (obj: any, ...keys: string[]) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
};

export const normalizeControls = (
  measure?: MitigationMeasureLike | null,
): FollowUpControlLike[] =>
  (getAny(
    measure,
    "follow_up_controls",
    "follow_up_control",
    "followupcontrols",
    "followup_controls",
    "followupControl",
    "followup_control",
  ) ?? []) as FollowUpControlLike[];

export const normalizeHazardNotification = (
  raw: any,
): HazardNotificationLike | null => {
  if (!raw) return null;

  const informationSource = getAny(
    raw,
    "information_source",
    "informationsource",
    "informationSource",
  );
  const location = getAny(raw, "location", "location_id");
  const mitigation = getAny(
    raw,
    "mitigation_plan",
    "mitigationplan",
    "mitigationPlan",
  );

  const normalizedMitigation: MitigationPlanLike | null = mitigation
    ? {
        ...mitigation,
        measures: (
          mitigation.measures ??
          mitigation.Measures ??
          mitigation.measures_list ??
          []
        ).map((measure: any) => ({
          ...measure,
          follow_up_controls:
            getAny(
              measure,
              "follow_up_controls",
              "follow_up_control",
              "followupcontrols",
              "followup_controls",
            ) ?? [],
        })) as MitigationMeasureLike[],
      }
    : null;

  return {
    id: getAny(raw, "id"),
    report_number: getAny(raw, "report_number", "reportNumber"),
    reception_date: getAny(raw, "reception_date", "receptionDate"),
    location: location || null,
    identification_area: getAny(
      raw,
      "identification_area",
      "identificationArea",
    ),
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
      getAny(raw, "voluntary_report", "voluntaryreport", "voluntaryReport") ??
      undefined,
    obligatory_report:
      getAny(
        raw,
        "obligatory_report",
        "obligatoryreport",
        "obligatoryReport",
      ) ?? undefined,
    mitigation_plan: normalizedMitigation,
    analysis: getAny(raw, "analysis") ?? null,
    current_defenses: getAny(
      raw,
      "current_defenses",
      "currentDefenses",
      "defensas_actuales",
      "defensasActuales",
    ) as any,
    possible_consequences: getAny(
      raw,
      "possible_consequences",
      "possibleConsequences",
    ),
    consequence_to_evaluate: getAny(
      raw,
      "consequence_to_evaluate",
      "consequenceToEvaluate",
    ),
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
  if (value.includes("alto") || value.includes("high"))
    return "bg-red-600 text-white";
  if (
    value.includes("medio") ||
    value.includes("medium") ||
    value.includes("med")
  ) {
    return "bg-amber-400 text-black";
  }
  if (value.includes("bajo") || value.includes("low"))
    return "bg-emerald-600 text-white";
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

export const getRiskMatrixTone = (analysis?: RiskAnalysisLike | null) => {
  const probability = String(analysis?.probability ?? "").toLowerCase();
  const severity = String(analysis?.severity ?? "").toLowerCase();
  const result = String(analysis?.result ?? "").toLowerCase();

  // Escala aeronáutica: probabilidad 1-5 + severidad A-E.
  const matrixLevel = /^[1-5][a-e]$/i.test(result)
    ? getResult(result.toUpperCase())
    : null;

  const critical =
    matrixLevel === "INTOLERABLE" ||
    probability.includes("alta") ||
    probability.includes("high") ||
    severity.includes("alto") ||
    severity.includes("high") ||
    result.includes("critico") ||
    result.includes("crítico") ||
    result.includes("extremo") ||
    result.includes("intolerable");

  const medium =
    matrixLevel === "TOLERABLE" ||
    probability.includes("media") ||
    probability.includes("medium") ||
    severity.includes("medio") ||
    severity.includes("medium") ||
    result.includes("moderado") ||
    result.includes("tolerable");

  if (critical) {
    return {
      card: "border-red-200 bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20",
      chip: "bg-red-600 text-white",
      accent: "border-l-red-500",
    };
  }

  if (medium) {
    return {
      card: "border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20",
      chip: "bg-amber-500 text-black",
      accent: "border-l-amber-500",
    };
  }

  return {
    card: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20",
    chip: "bg-emerald-600 text-white",
    accent: "border-l-emerald-500",
  };
};

export const buildAnalysisDetails = (
  analysis?: RiskAnalysisLike | null,
): DetailItem[] => [
  { label: "Probabilidad", value: analysis?.probability || "N/A" },
  { label: "Severidad", value: analysis?.severity || "N/A" },
  { label: "Tipo", value: analysis?.type || "N/A" },
];

export const getReportCode = (
  report: {
    id: number;
    report_number?: string | null;
    hazard_notification?: unknown;
  },
  type: "RVP" | "ROS",
) => {
  const prefix = type === "RVP" ? "RVP" : "ROS";
  // La notificación de peligro asigna el número oficial del reporte.
  const notification = normalizeHazardNotification(report.hazard_notification);
  if (notification?.report_number) {
    return notification.report_number;
  }

  return report.report_number
    ? `${prefix}-${report.report_number}`
    : `${prefix}-${report.id}`;
};

export const buildVoluntaryDetails = (
  report: VoluntaryReportView,
): DetailItem[] => [
  {
    group: "Reporte",
    label: "Fecha del reporte",
    value: formatDisplayDate(report.report_date),
  },
  {
    group: "Reporte",
    label: "Fecha de identificación",
    value: formatDisplayDate(report.identification_date),
  },
  {
    group: "Reporte",
    label: "Área del peligro",
    value: report.danger_area || report.identification_area,
  },
  {
    group: "Reporte",
    label: "Ubicación",
    value:
      report.danger_location ||
      report.airport_location ||
      (report.location ? formatLocationLabel(report.location) : undefined),
  },
  {
    group: "Narración",
    label: "Descripción",
    value: report.description,
    fullWidth: true,
    contentClassName: "whitespace-pre-wrap",
  },
  {
    group: "Narración",
    label: "Posibles consecuencias",
    value: renderNumberedDetailValue(report.possible_consequences),
    fullWidth: true,
  },
];

export const buildVoluntaryReporterDetails = (
  report: VoluntaryReportView,
): DetailItem[] => [
  {
    label: "Nombre",
    value: [report.reporter_name, report.reporter_last_name]
      .filter(Boolean)
      .join(" "),
  },
  { label: "Teléfono", value: formatPhone(report.reporter_phone) },
  { label: "Correo", value: report.reporter_email },
];

export const buildObligatoryDetails = (
  report: ObligatoryReportView,
): DetailItem[] => {
  const reportTime = getAny(report, "report_time");

  return [
    {
      group: "Reporte",
      label: "Fecha del reporte",
      value: formatDisplayDate(report.report_date),
    },
    { group: "Reporte", label: "Hora del reporte", value: reportTime },
    {
      group: "Incidente",
      label: "Fecha del incidente",
      value: formatDisplayDate(report.incident_date),
    },
    {
      group: "Incidente",
      label: "Hora del incidente",
      value: report.incident_time,
    },
    {
      group: "Incidente",
      label: "Lugar del incidente",
      value: report.incident_location,
    },
    {
      group: "Incidente",
      label: "Tiempo de vuelo",
      value: report.flight_time,
    },
    { group: "Vuelo", label: "Número de vuelo", value: report.flight_number },
    { group: "Vuelo", label: "Origen", value: report.flight_origin },
    { group: "Vuelo", label: "Destino", value: report.flight_destiny },
    {
      group: "Vuelo",
      label: "Destino alterno",
      value: report.flight_alt_destiny,
    },
    {
      group: "Narración",
      label: "Incidentes",
      value: report.incidents || "Sin incidentes registrados",
      fullWidth: true,
      contentClassName: "whitespace-pre-wrap",
    },
    {
      group: "Narración",
      label: "Otros incidentes",
      value: report.other_incidents,
      fullWidth: true,
      contentClassName: "whitespace-pre-wrap",
    },
    {
      group: "Narración",
      label: "Descripción",
      value: report.description,
      fullWidth: true,
      contentClassName: "whitespace-pre-wrap",
    },
  ];
};

export const buildCrewAndAircraftDetails = (
  report: ObligatoryReportView,
): DetailItem[] => [
  {
    group: "Tripulación",
    label: "Piloto",
    value: report.pilot?.employee_dni,
  },
  {
    group: "Tripulación",
    label: "Licencia del piloto",
    value: report.pilot?.license_number,
  },
  {
    group: "Tripulación",
    label: "Copiloto",
    value: report.copilot?.employee_dni,
  },
  {
    group: "Tripulación",
    label: "Licencia del copiloto",
    value: report.copilot?.license_number,
  },
  {
    group: "Aeronave",
    label: "Aeronave",
    value: report.aircraft?.acronym,
  },
  { group: "Aeronave", label: "Marca", value: report.aircraft?.brand },
  { group: "Aeronave", label: "Modelo", value: report.aircraft?.model },
  { group: "Aeronave", label: "Serial", value: report.aircraft?.serial },
  {
    group: "Aeronave",
    label: "Estado de la aeronave",
    value: report.aircraft?.status,
  },
];

export const buildDangerIdentificationDetails = (
  notification: HazardNotificationLike,
): DetailItem[] => [
  {
    group: "Recepción",
    label: "Fecha de recepción",
    value: formatDisplayDate(
      notification.reception_date || notification.risk_management_start_date,
    ),
  },
  {
    group: "Recepción",
    label: "Tipo de reporte",
    value: notification.report_type,
  },
  {
    group: "Recepción",
    label: "Peligro",
    value: notification.danger || notification.danger_type,
  },
  {
    group: "Recepción",
    label: "Área",
    value: notification.identification_area || notification.danger_area,
  },
  {
    group: "Recepción",
    label: "Ubicación",
    value: notification.location
      ? formatLocationLabel(notification.location)
      : undefined,
  },
  {
    group: "Recepción",
    label: "Fuente de información",
    value: notification.information_source?.name,
  },
  {
    group: "Detalle",
    label: "Descripción",
    value: notification.description,
    fullWidth: true,
    contentClassName: "whitespace-pre-wrap",
  },
  {
    group: "Detalle",
    label: "Análisis de causas raíz",
    value: renderNumberedDetailValue(
      notification.analysis_of_root_causes || notification.root_cause_analysis,
    ),
    fullWidth: true,
  },
  {
    group: "Detalle",
    label: "Fecha de gestión",
    value: formatDisplayDate(notification.risk_management_start_date),
  },
];

export const buildMitigationPlanDetails = (
  plan: MitigationPlanLike,
): DetailItem[] => [
  {
    label: "Area responsable",
    value: plan.area_responsible || plan.responsible || "N/A",
  },
  { label: "Fecha de inicio", value: formatDisplayDate(plan.start_date) },
  {
    label: "Posibles consecuencias",
    value: renderNumberedDetailValue(plan.possible_consequences, "N/A"),
    fullWidth: true,
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

export const buildMeasureDetails = (
  measure: MitigationMeasureLike,
): DetailItem[] => [
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
  {
    label: "Fecha de ejecucion",
    value: formatDisplayDate(measure.execution_date),
  },
];

export const buildControlDetails = (
  control: FollowUpControlLike,
): DetailItem[] => [
  { label: "Fecha", value: formatDisplayDate(control.date) },
  {
    label: "Descripcion",
    value: control.description || "N/A",
    fullWidth: true,
    contentClassName: "whitespace-pre-wrap",
  },
];

export const buildAnalysisEntries = (
  notification: HazardNotificationLike | null,
  mitigationPlan: MitigationPlanLike | null,
): ReportAnalysisEntry[] => {
  const entries: ReportAnalysisEntry[] = [];

  if (notification?.analysis) {
    entries.push({
      key: "hazard-notification-analysis",
      title: "Análisis pre mitigación",
      description: "Evaluación asociada a la identificacion de peligro",
      analysis: notification.analysis,
    });
  }

  if (mitigationPlan?.analysis) {
    entries.push({
      key: "mitigation-plan-analysis",
      title: "Análisis post mitigación",
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
