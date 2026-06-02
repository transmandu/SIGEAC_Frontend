import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ActivityCategoryData {
  name: string;
  description?: string;
}

interface CreateActivityCategoryData {
  company: string | null;
  data: ActivityCategoryData;
}

interface UpdateActivityCategoryData {
  company: string | null;
  id: string;
  data: ActivityCategoryData;
}

export const useCreateActivityCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, data }: CreateActivityCategoryData) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/sms/activity-categories`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activity-categories"] });
      toast.success("¡Creada!", {
        description: "La categoría de actividad se creó correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo crear la categoría de actividad.",
      });
    },
  });

  return { createActivityCategory: mutation };
};

export const useUpdateActivityCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id, data }: UpdateActivityCategoryData) => {
      const { data: response } = await axiosInstance.patch(
        `/${company}/sms/activity-categories/${id}`,
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activity-categories"] });
      toast.success("¡Actualizada!", {
        description: "La categoría de actividad se actualizó correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo actualizar la categoría de actividad.",
      });
    },
  });

  return { updateActivityCategory: mutation };
};

export const useDeleteActivityCategory = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(
        `/${selectedCompany?.slug}/sms/activity-categories/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-activity-categories"] });
      toast.success("¡Eliminada!", {
        description: "La categoría de actividad se eliminó correctamente.",
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "No se pudo eliminar la categoría de actividad.",
      });
    },
  });

  return { deleteActivityCategory: mutation };
};