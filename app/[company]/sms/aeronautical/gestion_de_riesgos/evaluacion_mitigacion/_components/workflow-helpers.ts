import { HazardNotification, MitigationMeasure } from '@/types/sms/mantenimiento';

export type WorkflowStatus = {
    label: string;
    className: string;
};

export const getNotificationSource = (notification: HazardNotification) => {
    if (notification.voluntary_report) {
        const code = notification.voluntary_report.report_number || notification.voluntary_report.id;
        return `RVP-${code}`;
    }

    if (notification.obligatory_report) {
        const code =
            notification.obligatory_report.report_number || notification.obligatory_report.id;
        return `ROS-${code}`;
    }

    return `HN-${notification.report_number || notification.id}`;
};

export const sortByNewestDate = (notifications: HazardNotification[]) =>
    [...notifications].sort(
        (a, b) => new Date(b.reception_date).getTime() - new Date(a.reception_date).getTime()
    );

export const getMeasureControls = (measure: MitigationMeasure) =>
    measure.follow_up_control || measure.follow_up_controls || [];

export const getWorkflowStatus = (notification: HazardNotification): WorkflowStatus => {
    const mitigationPlan = notification.mitigation_plan;
    const analysis = mitigationPlan?.analysis || notification.analysis;
    const measures = mitigationPlan?.measures || [];
    const controls = measures.flatMap((measure) => getMeasureControls(measure));

    if (!mitigationPlan || !analysis) {
        return {
            label: 'Pendiente de evaluación',
            className:
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        };
    }

    if (!measures.length) {
        return {
            label: 'Plan y análisis listos',
            className:
                'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
        };
    }

    if (!controls.length) {
        return {
            label: 'En medidas de mitigación',
            className:
                'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
        };
    }

    return {
        label: 'Con seguimiento activo',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
};
