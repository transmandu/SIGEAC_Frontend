import { ReactNode } from 'react';

import { formatDate } from '@/lib/utils';
import { HazardNotification, ObligatoryReport, VoluntaryReport } from '@/types/sms/mantenimiento';
import { Location } from '@/types';

export type ReportType = 'RVP' | 'ROS';

export type ReportWithHazard<T> = T & {
    report_number?: string | null;
    danger_identification_id?: number | null;
    hazard_notification?: HazardNotification | null;
    danger_identification?: HazardNotification | null;
};

export type SelectedReport = {
    id: number;
    type: ReportType;
};

export type DetailItem = {
    label: string;
    value?: ReactNode;
    fullWidth?: boolean;
    contentClassName?: string;
};

export const REPORT_LABELS: Record<ReportType, string> = {
    RVP: 'Reporte voluntario',
    ROS: 'Reporte obligatorio',
};

export const getHazardNotification = <T,>(report: ReportWithHazard<T>) =>
    report.hazard_notification ?? report.danger_identification ?? null;

export const getActionLabel = <T extends { status: string }>(report: ReportWithHazard<T>) => {
    if (getHazardNotification(report)) {
        return 'Editar Notificación';
    }

    if (report.status === 'ABIERTO') {
        return 'Crear Notificación';
    }

    return 'No disponible';
};

export const getActionTone = <T extends { status: string }>(report: ReportWithHazard<T>) => {
    if (getHazardNotification(report)) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    if (report.status === 'ABIERTO') {
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }

    return 'bg-muted text-muted-foreground border-border';
};

export const isSelectable = <T extends { status: string }>(report: ReportWithHazard<T>) =>
    Boolean(getHazardNotification(report)) || report.status === 'ABIERTO';

export const sortByNewestDate = <T extends { report_date: string | Date }>(reports: T[]) =>
    [...reports].sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

export const formatLocationLabel = (location?: Location | null) =>
    [location?.cod_iata, location?.name, location?.address].filter(Boolean).join(' - ');

export const getVoluntaryMeta = (report: ReportWithHazard<VoluntaryReport>) =>
    [report.identification_area, formatLocationLabel(report.location)].filter(Boolean).join(' - ');

export const getObligatoryMeta = (report: ReportWithHazard<ObligatoryReport>) =>
    [formatLocationLabel(report.report_location), formatLocationLabel(report.incident_location)]
        .filter(Boolean)
        .join(' - ');

export const getReportCode = (
    report: ReportWithHazard<VoluntaryReport> | ReportWithHazard<ObligatoryReport>,
    type: ReportType
) => {
    const prefix = type === 'RVP' ? 'RVP' : 'ROS';
    return report.report_number ? `${prefix}-${report.report_number}` : `${prefix}-${report.id}`;
};

export const hasDetailValue = (value?: ReactNode) => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    return true;
};

export const formatContactName = (...parts: Array<string | undefined>) =>
    parts.filter(Boolean).join(' ').trim();

export const getVoluntaryReportDetails = (report: ReportWithHazard<VoluntaryReport>): DetailItem[] => [
    { label: 'Codigo', value: getReportCode(report, 'RVP') },
    { label: 'Fecha del reporte', value: formatDate(report.report_date) },
    { label: 'Estado', value: report.status },
    { label: 'Area identificada', value: report.identification_area },
    { label: 'Ubicacion', value: formatLocationLabel(report.location) },
    {
        label: 'Reportante',
        value: formatContactName(report.reporter_name, report.reporter_last_name),
    },
    { label: 'Telefono', value: report.reporter_phone },
    { label: 'Correo', value: report.reporter_email },
    {
        label: 'Descripcion del reporte',
        value: report.description,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Posibles consecuencias',
        value: report.possible_consequences,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
];

export const getObligatoryReportDetails = (report: ReportWithHazard<ObligatoryReport>): DetailItem[] => [
    { label: 'Codigo', value: getReportCode(report, 'ROS') },
    { label: 'Fecha del reporte', value: formatDate(report.report_date) },
    { label: 'Hora del reporte', value: report.report_time },
    { label: 'Estado', value: report.status },
    { label: 'Fecha del incidente', value: formatDate(report.incident_date) },
    { label: 'Hora del incidente', value: report.incident_time },
    { label: 'Lugar del reporte', value: formatLocationLabel(report.report_location) },
    { label: 'Lugar del incidente', value: formatLocationLabel(report.incident_location) },
    { label: 'Reportante', value: formatContactName(report.name, report.last_name) },
    { label: 'Telefono', value: report.phone },
    { label: 'Correo', value: report.email },
    {
        label: 'Incidentes registrados',
        value: report.incidents,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Otros incidentes',
        value: report.other_incidents,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Descripcion del reporte',
        value: report.description,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
];

export const getHazardNotificationDetails = (notification: HazardNotification): DetailItem[] => [
    { label: 'Numero', value: notification.report_number },
    { label: 'Fecha de recepcion', value: formatDate(notification.reception_date) },
    { label: 'Area de identificacion', value: notification.identification_area },
    { label: 'Ubicacion', value: formatLocationLabel(notification.location) },
    { label: 'Tipo de peligro', value: notification.danger_type },
    { label: 'Fuente de informacion', value: notification.information_source?.name },
    {
        label: 'Descripcion',
        value: notification.description,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
    {
        label: 'Analisis de causas raiz',
        value: notification.analysis_of_root_causes,
        fullWidth: true,
        contentClassName: 'whitespace-pre-wrap',
    },
];
