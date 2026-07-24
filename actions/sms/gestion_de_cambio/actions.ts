import axiosInstance from "@/lib/axios";
import {
  StoreChangeRequestPayload,
  UpdateChangeRequestPayload,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateChangeRequestData {
  company: string;
  data: StoreChangeRequestPayload;
  beforeImages?: File[];
  afterImages?: File[];
}

interface UpdateChangeRequestData {
  company: string;
  id: number;
  data: UpdateChangeRequestPayload;
  beforeImages?: File[];
  afterImages?: File[];
  existingBeforeRecordIds?: number[];
  existingAfterRecordIds?: number[];
}

function appendNestedFormData(formData: FormData, data: Record<string, unknown>, prefix = "") {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (value instanceof File) {
      formData.append(fullKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${fullKey}[${index}]`, item);
        } else if (typeof item === "object" && item !== null) {
          appendNestedFormData(formData, item as Record<string, unknown>, `${fullKey}[${index}]`);
        } else {
          formData.append(`${fullKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object") {
      appendNestedFormData(formData, value as Record<string, unknown>, fullKey);
    } else {
      formData.append(fullKey, String(value));
    }
  }
}

export const useCreateChangeRequest = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async ({ data, company, beforeImages = [], afterImages = [] }: CreateChangeRequestData) => {
      const formData = new FormData();

      const { is_temporary, ...rest } = data as Record<string, unknown>;
      appendNestedFormData(formData, rest);
      formData.append("is_temporary", is_temporary ? "1" : "0");

      beforeImages.forEach((file) => {
        formData.append("photographic_records[][stage]", "before");
        formData.append("photographic_records[][image_url]", file);
      });

      afterImages.forEach((file) => {
        formData.append("photographic_records[][stage]", "after");
        formData.append("photographic_records[][image_url]", file);
      });

      await axiosInstance.post(`/${company}/sms/change-requests`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Creada!", {
        description: "La solicitud de cambio ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo crear la solicitud de cambio...",
      });
      console.error(error);
    },
  });
  return {
    createChangeRequest: createMutation,
  };
};

export const useUpdateChangeRequest = () => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ company, data, id, beforeImages = [], afterImages = [], existingBeforeRecordIds = [], existingAfterRecordIds = [] }: UpdateChangeRequestData) => {
      const formData = new FormData();
      formData.append("_method", "PATCH");

      const { is_temporary, photographic_records, ...rest } = data as Record<string, unknown>;
      appendNestedFormData(formData, rest);
      formData.append("is_temporary", is_temporary ? "1" : "0");

      existingBeforeRecordIds.forEach((recordId) => {
        formData.append("photographic_records[][id]", String(recordId));
        formData.append("photographic_records[][stage]", "before");
        formData.append("photographic_records[][image_url]", "");
      });

      existingAfterRecordIds.forEach((recordId) => {
        formData.append("photographic_records[][id]", String(recordId));
        formData.append("photographic_records[][stage]", "after");
        formData.append("photographic_records[][image_url]", "");
      });

      beforeImages.forEach((file) => {
        formData.append("photographic_records[][stage]", "before");
        formData.append("photographic_records[][image_url]", file);
      });

      afterImages.forEach((file) => {
        formData.append("photographic_records[][stage]", "after");
        formData.append("photographic_records[][image_url]", file);
      });

      await axiosInstance.post(`/${company}/sms/change-requests/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Actualizada!", {
        description:
          "La solicitud de cambio ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la solicitud de cambio...",
      });
      console.error(error);
    },
  });
  return {
    updateChangeRequest: updateMutation,
  };
};

export const useDeleteChangeRequest = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string;
      id: number;
    }) => {
      await axiosInstance.delete(`/${company}/sms/change-requests/${id}`);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["change-requests", data.company],
      });
      toast.success("¡Eliminada!", {
        description:
          "La solicitud de cambio ha sido eliminada correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description:
          "Hubo un error al eliminar la solicitud de cambio...",
      });
    },
  });
  return {
    deleteChangeRequest: deleteMutation,
  };
};
