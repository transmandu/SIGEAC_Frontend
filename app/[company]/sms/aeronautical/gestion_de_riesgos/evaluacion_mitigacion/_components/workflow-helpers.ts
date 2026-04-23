import { HazardNotification } from '@/types/sms/mantenimiento';

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

export const getWorkflowStatus = (notification: HazardNotification): WorkflowStatus => {
    const mitigationPlan = notification.mitigation_plan;
    const analysis = mitigationPlan?.analysis || notification.analysis;
    const measures = mitigationPlan?.mitigation_measure || [];
    const controls = measures.flatMap((measure) => measure.follow_up_control || []);

    if (!mitigationPlan || !analysis) {
        return {
            label: 'Pendiente de evaluación',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
        };
    }

    if (!measures.length) {
        return {
            label: 'Plan y análisis listos',
            className: 'border-blue-200 bg-blue-50 text-blue-700',
        };
    }

    if (!controls.length) {
        return {
            label: 'En medidas de mitigación',
            className: 'border-violet-200 bg-violet-50 text-violet-700',
        };
    }

    return {
        label: 'Con seguimiento activo',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
};
