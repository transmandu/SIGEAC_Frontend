import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toCalendarPayload } from "@/lib/date";

/**
 * Convierte un objeto plano a FormData.
 * - Omite valores undefined.
 * - Convierte Date a string YYYY-MM-DD.
 * - Convierte null a string vacío (el backend lo normaliza con prepareForValidation).
 * - Pasa instancias de File directamente.
 */
function objectToFormData(obj: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value
        .filter((item) => item !== undefined)
        .forEach((item) => {
          if (item instanceof Date) {
            formData.append(`${key}[]`, toCalendarPayload(item) ?? "");
          } else if (item === null) {
            formData.append(`${key}[]`, "");
          } else {
            formData.append(`${key}[]`, item instanceof File ? item : String(item));
          }
        });
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, toCalendarPayload(value) ?? "");
    } else if (value === null) {
      formData.append(key, "");
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

interface FollowUpControlData {
  company: string | null;
  data: {
    description: string;
    date: Date;
    mitigation_measure_id: number | string;
    images?: File[];
    document?: File | string;
    implementation_responsible?: string;
    follow_up_responsible?: string;
  };
}

interface updateFolllowUpControlData {
  company: string | null;
  id: string;
  data: {
    description: string;
    date: Date;
    mitigation_measure_id: string | number;
    images?: File[];
    document?: File | string;
    implementation_responsible?: string;
    follow_up_responsible?: string;
  };
}


export const useCreateFollowUpControl = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ data, company }: FollowUpControlData) => {
      await axiosInstance.post(
        `/${company}/sms/follow-up-controls`,
        objectToFormData(data as Record<string, unknown>),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-controls"] });
      queryClient.invalidateQueries({ queryKey: ["mitigation-measures"] });
      toast.success("¡Creado!", {
        description: `El cotrol de seguimiento ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear el control de seguimiento...",
      });
      console.log(error);
    },
  });
  return {
    createFollowUpControl: createMutation,
  };
};

export const useDeleteFollowUpControl = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | null;
      id: string;
    }) => {
      await axiosInstance.delete(`/${company}/sms/follow-up-controls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-controls"] });
      toast.success("¡Eliminado!", {
        description: `¡El control de seguimiento ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar el control de seguimiento!",
      });
    },
  });

  return {
    deleteFollowUpControl: deleteMutation,
  };
};

export const useUpdateFollowUpControl = () => {
  const queryClient = useQueryClient();

  const updateFollowUpControlMutation = useMutation({
    mutationFn: async ({ company, id, data }: updateFolllowUpControlData) => {
      await axiosInstance.post(
        `/${company}/sms/update-follow-up-controls/${id}`,
        objectToFormData(data as Record<string, unknown>),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-up-controls"] });
      toast.success("¡Actualizado!", {
        description: `El control ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar el control de seguimiento...",
      });
      console.log(error);
    },
  });
  return {
    updateFollowUpControl: updateFollowUpControlMutation,
  };
};
