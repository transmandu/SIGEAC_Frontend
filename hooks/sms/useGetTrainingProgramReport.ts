import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export type TrainingProgramSignatures = {
  elaborated?: string;
  reviewed?: string;
  approved?: string;
};

/**
 * Descarga el TMD-FOR-SMS-018 "Programa de Capacitación" de un año.
 *
 * El año acota los cursos recurrentes de SMS de los que el backend saca las
 * tres fechas del formato, y los tres DNI son quienes aparecen en los bloques
 * REALIZADO POR / REVISADO POR / APROBADO POR.
 */
export function useGetTrainingProgramReport(
  onSuccess?: () => void,
  company?: string,
) {
  const [year, setYear] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const [elaboratedDni, setElaboratedDni] = useState<string | undefined>();
  const [reviewedDni, setReviewedDni] = useState<string | undefined>();
  const [approvedDni, setApprovedDni] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = !!year && !isGenerating;

  const reset = () => {
    setElaboratedDni(undefined);
    setReviewedDni(undefined);
    setApprovedDni(undefined);
  };

  const handleGenerate = async () => {
    if (!canGenerate || !year) return;

    setIsGenerating(true);

    try {
      const response = await axiosInstance.get(
        `/${company}/sms/training-program-report`,
        {
          params: {
            year,
            elaborated_dni: elaboratedDni || undefined,
            reviewed_dni: reviewedDni || undefined,
            approved_dni: approvedDni || undefined,
          },
          headers: { Accept: "application/pdf" },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      if (blob.size === 0) throw new Error("empty_file");

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `PROGRAMA_DE_CAPACITACION_SMS_${year}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Programa descargado", {
        description: `El programa de capacitación de ${year} se ha generado correctamente.`,
        id: "training-program-report-status",
      });

      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error al generar el programa de capacitación:", error);

      // Con responseType blob los errores llegan como Blob: el JSON del
      // backend hay que leerlo a mano para poder mostrar su mensaje.
      const message = await readErrorMessage(error);

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("Sesión expirada", {
            description:
              "Tu sesión ha terminado. Por favor, inicia sesión de nuevo.",
            id: "training-program-report-error",
          });
        } else {
          toast.error("Error del servidor", {
            description:
              message ||
              "Hubo un problema al procesar el PDF. Intenta más tarde.",
            id: "training-program-report-error",
          });
        }
      } else {
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor.",
          id: "training-program-report-error",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    year,
    setYear,
    elaboratedDni,
    setElaboratedDni,
    reviewedDni,
    setReviewedDni,
    approvedDni,
    setApprovedDni,
    isGenerating,
    handleGenerate,
    canGenerate,
  };
}

/**
 * Extrae el `message` de una respuesta de error que axios devolvió como Blob.
 */
async function readErrorMessage(error: any): Promise<string | undefined> {
  const data = error?.response?.data;
  if (!data || typeof data === "string") return undefined;

  try {
    const text = await data.text();
    return JSON.parse(text)?.message;
  } catch {
    return undefined;
  }
}
