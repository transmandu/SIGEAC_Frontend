import axiosInstance from "@/lib/axios";
import { ErrorReportSeverity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Prioriza el primer error de validación sobre el mensaje general: es el que
// dice qué campo corregir.
const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as {
    response?: {
      status?: number;
      data?: { message?: string; errors?: Record<string, string[]> };
    };
  };
  const errors = maybeAxiosError.response?.data?.errors;
  const firstValidationMessage = errors
    ? Object.values(errors)[0]?.[0]
    : undefined;

  return (
    firstValidationMessage ||
    maybeAxiosError.response?.data?.message ||
    fallback
  );
};

interface CreateErrorReportData {
  description: string;
  module?: string;
  severity?: ErrorReportSeverity;
  http_status?: number;
  images?: File[];
}

// Con imágenes hay que ir en multipart; sin ellas se manda JSON plano.
export const useCreateErrorReport = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ images, ...data }: CreateErrorReportData) => {
      if (images && images.length > 0) {
        const formData = new FormData();
        formData.append("description", data.description);
        if (data.module) formData.append("module", data.module);
        if (data.severity) formData.append("severity", data.severity);
        if (data.http_status !== undefined) formData.append("http_status", String(data.http_status));
        images.forEach((image) => formData.append("images[]", image));

        const response = await axiosInstance.post("/error-reports", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }

      const response = await axiosInstance.post("/error-reports", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Reporte enviado!", {
        description: "Tu reporte fue registrado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getErrorMessage(error, "No se pudo registrar el reporte..."),
      });
    },
  });

  return { createErrorReport: createMutation };
};

export const useDeleteErrorReport = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/error-reports/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Eliminado!", {
        description: "El reporte fue eliminado.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getErrorMessage(error, "No se pudo eliminar el reporte..."),
      });
    },
  });

  return { deleteErrorReport: deleteMutation };
};

// Quien atiende el reporte lo toma para sí; de ahí en adelante figura como
// responsable en el listado.
export const useSetErrorReportInProgress = () => {
  const queryClient = useQueryClient();

  const setInProgressMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/error-reports/${id}/in-progress`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Tomado!", {
        description: "El reporte ahora esta en progreso.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo tomar el reporte...",
      });
    },
  });

  return { setErrorReportInProgress: setInProgressMutation };
};

interface ResolveErrorReportData {
  id: number;
  resolution: string;
}

export const useResolveErrorReport = () => {
  const queryClient = useQueryClient();

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution }: ResolveErrorReportData) => {
      const response = await axiosInstance.post(`/error-reports/${id}/resolve`, { resolution });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Resuelto!", {
        description: "El reporte fue marcado como resuelto.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo resolver el reporte...",
      });
    },
  });

  return { resolveErrorReport: resolveMutation };
};

export const useMarkErrorReportDuplicate = () => {
  const queryClient = useQueryClient();

  const markDuplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/error-reports/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Marcado!", {
        description: "El reporte fue marcado como duplicado.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo marcar el reporte como duplicado...",
      });
    },
  });

  return { markErrorReportDuplicate: markDuplicateMutation };
};

interface UpdateErrorReportDiagnosisData {
  id: number;
  http_status?: number;
  technical_cause?: string;
  diagnostic_steps?: string[];
}

export const useUpdateErrorReportDiagnosis = () => {
  const queryClient = useQueryClient();

  const updateDiagnosisMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateErrorReportDiagnosisData) => {
      const response = await axiosInstance.patch(`/error-reports/${id}/diagnosis`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Diagnóstico actualizado!", {
        description: "El diagnóstico técnico fue guardado correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el diagnóstico...",
      });
    },
  });

  return { updateErrorReportDiagnosis: updateDiagnosisMutation };
};

interface AddErrorReportImagesData {
  id: number;
  images: File[];
}

export const useAddErrorReportImages = () => {
  const queryClient = useQueryClient();

  const addImagesMutation = useMutation({
    mutationFn: async ({ id, images }: AddErrorReportImagesData) => {
      const formData = new FormData();
      images.forEach((image) => formData.append("images[]", image));

      const response = await axiosInstance.post(`/error-reports/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Imágenes agregadas!", {
        description: "Las imágenes fueron adjuntadas al reporte.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudieron agregar las imágenes...",
      });
    },
  });

  return { addErrorReportImages: addImagesMutation };
};

export const useDeleteErrorReportImage = () => {
  const queryClient = useQueryClient();

  const deleteImageMutation = useMutation({
    mutationFn: async ({ id, imageId }: { id: number; imageId: number }) => {
      const response = await axiosInstance.delete(`/error-reports/${id}/images/${imageId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-reports"] });
      toast.success("¡Imagen eliminada!", {
        description: "La imagen fue eliminada del reporte.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo eliminar la imagen...",
      });
    },
  });

  return { deleteErrorReportImage: deleteImageMutation };
};

interface ImportErrorReportHistoryData {
  file: File;
  from?: string;
  dry_run?: boolean;
  delay?: number;
}

// La importación se encola en el backend: el éxito aquí significa "aceptada",
// no "terminada". El avance se sigue con useGetImportHistoryStatus.
export const useImportErrorReportHistory = () => {
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async ({ file, from, dry_run, delay }: ImportErrorReportHistoryData) => {
      const formData = new FormData();
      formData.append("file", file);
      if (from) formData.append("from", from);
      if (dry_run !== undefined) formData.append("dry_run", String(dry_run));
      if (delay !== undefined) formData.append("delay", String(delay));

      const response = await axiosInstance.post("/error-reports/import-history", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-report-imports"] });
      toast.success("¡Importacion encolada!", {
        description: "La importacion del historico se esta procesando.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo iniciar la importacion...",
      });
    },
  });

  return { importErrorReportHistory: importMutation };
};
