import axiosInstance from "@/lib/axios";
import type {
  AuditSubjectType,
  PlanificationAuditFilters,
} from "@/types/planification/audit";

const saveBlob = (data: BlobPart, type: string, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadAuditExcel = async (
  company: string,
  filters: PlanificationAuditFilters,
) => {
  const { data } = await axiosInstance.get(
    `/${company}/planification-audit-logs/export`,
    {
      params: {
        ...filters,
        page: undefined,
        per_page: undefined,
        critical_only: filters.critical_only ? 1 : undefined,
      },
      responseType: "blob",
    },
  );

  saveBlob(
    data,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    `auditoria_planificacion.xlsx`,
  );
};

export const downloadAuditRecordPdf = async (
  company: string,
  subjectType: AuditSubjectType,
  subjectId: number,
  filename: string,
) => {
  const { data } = await axiosInstance.get(
    `/${company}/planification-audit-logs/record-pdf`,
    {
      params: { subject_type: subjectType, subject_id: subjectId },
      responseType: "blob",
    },
  );

  saveBlob(data, "application/pdf", filename);
};
