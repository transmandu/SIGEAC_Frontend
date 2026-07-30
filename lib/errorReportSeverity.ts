import { ErrorReportSeverity } from "@/types";

export const ERROR_REPORT_SEVERITIES: { value: ErrorReportSeverity; label: string }[] = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
];

export function getErrorReportSeverityLabel(severity: ErrorReportSeverity | null): string | null {
  if (!severity) return null;
  return ERROR_REPORT_SEVERITIES.find((option) => option.value === severity)?.label ?? severity;
}
