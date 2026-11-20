import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import type {
  DrillEvaluation,
  StoreDrillEvaluationPayload,
  UpdateDrillEvaluationPayload,
} from "@/types/sms/drill-evaluation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const invalidate = (
  queryClient: ReturnType<typeof useQueryClient>,
  activityNumber?: string,
) => {
  queryClient.invalidateQueries({ queryKey: ["drill-evaluation"] });
  queryClient.invalidateQueries({ queryKey: ["next-drill-number"] });
  queryClient.invalidateQueries({
    queryKey: ["sms-activity", activityNumber],
  });
};

export const useCreateDrillEvaluation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      activityNumber,
      data,
    }: {
      company: string;
      activityNumber: string;
      data: StoreDrillEvaluationPayload;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/sms/activities/${activityNumber}/drill-evaluation`,
        data,
      );

      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      invalidate(queryClient, variables.activityNumber);
      toast.success("¡Creada!", {
        description: "La evaluación del simulacro se ha creado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear la evaluación del simulacro" });
    },
  });

  return { createDrillEvaluation: mutation };
};

export const useUpdateDrillEvaluation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      activityNumber,
      id,
      data,
    }: {
      company: string;
      activityNumber: string;
      id: number;
      data: UpdateDrillEvaluationPayload;
    }) => {
      const response = await axiosInstance.patch(
        `/${company}/sms/activities/${activityNumber}/drill-evaluation/${id}`,
        data,
      );

      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      invalidate(queryClient, variables.activityNumber);
      toast.success("¡Actualizada!", {
        description:
          "La evaluación del simulacro se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la evaluación del simulacro" });
    },
  });

  return { updateDrillEvaluation: mutation };
};

/**
 * Adjunta o reemplaza el acta de realización del simulacro de mesa.
 *
 * Va aparte del guardado de la evaluación porque lleva un archivo: la
 * evaluación se crea/actualiza con JSON y el acta se sube después por
 * multipart. El backend la guarda en la Librería.
 */
export const useUploadDrillEvaluationDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      activityNumber,
      id,
      file,
      folderPaths,
    }: {
      company: string;
      activityNumber: string;
      id: number;
      file?: File | null;
      folderPaths?: string[];
    }): Promise<DrillEvaluation> => {
      const formData = new FormData();

      if (file) {
        formData.append("document", file);
      }

      (folderPaths ?? []).forEach((path) =>
        formData.append("library_folder_paths[]", path),
      );

      const response = await axiosInstance.post(
        `/${company}/sms/activities/${activityNumber}/drill-evaluation/${id}/document`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data;
    },
    onSuccess: (_data, variables) => {
      invalidate(queryClient, variables.activityNumber);
      toast.success("Acta guardada", {
        description: "El acta se guardó en la Librería.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "guardar el acta del simulacro" });
    },
  });

  return { uploadDrillEvaluationDocument: mutation };
};

export const useDeleteDrillEvaluation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      activityNumber,
      id,
    }: {
      company: string;
      activityNumber: string;
      id: number;
    }) => {
      // Un id inválido acababa como `/drill-evaluation/undefined` y el backend
      // devolvía un 500 por el type hint del controlador.
      if (!Number.isInteger(id)) {
        throw new Error("La evaluación no tiene un identificador válido.");
      }

      await axiosInstance.delete(
        `/${company}/sms/activities/${activityNumber}/drill-evaluation/${id}`,
      );
    },
    onSuccess: (_data, variables) => {
      invalidate(queryClient, variables.activityNumber);
      toast.success("¡Eliminada!", {
        description: "La evaluación del simulacro se ha eliminado.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la evaluación del simulacro" });
    },
  });

  return { deleteDrillEvaluation: mutation };
};
