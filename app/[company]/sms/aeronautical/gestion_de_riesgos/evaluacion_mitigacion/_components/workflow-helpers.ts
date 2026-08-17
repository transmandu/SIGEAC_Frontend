import { HazardNotification, MitigationMeasure } from '@/types/sms/mantenimiento';

export type WorkflowStatus = {
  label: string;
  className: string;
};

export const getNotificationSource = (notification: HazardNotification) => {
  const voluntaryReport = notification.voluntary_report;
  const obligatoryReport = notification.obligatory_report;

  if (voluntaryReport) {
    const code =
      voluntaryReport.report_number || voluntaryReport.id;
    return `RVP-${code}`;
  }

  if (obligatoryReport) {
    const code =
      obligatoryReport.report_number || obligatoryReport.id;
    return `ROS-${code}`;
  }

  return `${notification.report_number || notification.id}`;
};

export const getNotificationReportNumber = (notification: HazardNotification) => {
  const voluntaryReport = notification.voluntary_report;
  const obligatoryReport = notification.obligatory_report;

  return (
    voluntaryReport?.report_number ||
    obligatoryReport?.report_number ||
    notification.report_number ||
    String(notification.id)
  );
};

export const sortByNewestDate = (notifications: HazardNotification[]) =>
  [...notifications].sort(
    (a, b) => new Date(b.reception_date).getTime() - new Date(a.reception_date).getTime()
  );

export const getMeasureControls = (measure: MitigationMeasure) =>
  measure.follow_up_controls || [];

export const getWorkflowStatus = (notification: HazardNotification): WorkflowStatus => {
  const mitigationPlan = notification.mitigation_plan;
  const analysis = notification.analysis;
  const postMitigationAnalysis = mitigationPlan?.analysis;
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

  if (!postMitigationAnalysis) {
    return {
      label: 'Con seguimiento activo',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
  }

  return {
    label: 'Post mitigación evaluada',
    className:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
  };
};
