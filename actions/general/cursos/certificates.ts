import axiosInstance, { PDF_GENERATION_TIMEOUT } from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";

const filenameFromDisposition = (disposition?: string): string | null => {
  if (!disposition) return null;

  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].replace(/["']/g, ""));
    } catch {
      return utf8[1];
    }
  }

  const plain = disposition.match(/filename="?([^";]+)"?/i);
  return plain?.[1] ?? null;
};

const saveBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadCourseCertificate = async ({
  company,
  courseId,
  dni,
}: {
  company: string;
  courseId: number | string;
  dni: string;
}) => {
  try {
    const response = await axiosInstance.get(
      `/general/${company}/course/${courseId}/certificates/${dni}`,
      {
        responseType: "blob",
        timeout: PDF_GENERATION_TIMEOUT,
      },
    );

    const filename =
      filenameFromDisposition(response.headers["content-disposition"]) ??
      `certificado_${dni}.pdf`;

    saveBlob(response.data, filename);
  } catch (error) {
    notifyError(error, { action: "descargar el certificado" });
  }
};

export const downloadCourseCertificatesBatch = async ({
  company,
  courseId,
  dnis,
}: {
  company: string;
  courseId: number | string;
  dnis?: string[];
}) => {
  try {
    const response = await axiosInstance.post(
      `/general/${company}/course/${courseId}/certificates/download`,
      { employee_dnis: dnis ?? [] },
      {
        responseType: "blob",
        timeout: PDF_GENERATION_TIMEOUT,
      },
    );

    const filename =
      filenameFromDisposition(response.headers["content-disposition"]) ??
      `certificados_${courseId}.zip`;

    saveBlob(response.data, filename);
  } catch (error) {
    notifyError(error, { action: "descargar los certificados" });
  }
};

export const downloadUploadedCourseCertificates = async ({
  company,
  courseId,
  certificateIds,
}: {
  company: string;
  courseId: number | string;
  certificateIds: number[];
}) => {
  try {
    const response = await axiosInstance.post(
      `/general/${company}/course/${courseId}/certificates/uploaded/download`,
      { certificate_ids: certificateIds },
      {
        responseType: "blob",
        timeout: PDF_GENERATION_TIMEOUT,
      },
    );

    const filename =
      filenameFromDisposition(response.headers["content-disposition"]) ??
      `certificados_cargados_${courseId}.zip`;

    saveBlob(response.data, filename);
  } catch (error) {
    notifyError(error, { action: "descargar los certificados cargados" });
  }
};
