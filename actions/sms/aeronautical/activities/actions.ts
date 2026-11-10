import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import {
  StoreAeronauticalActivityPayload,
  UpdateAeronauticalActivityPayload,
} from "@/types/sms/aeronautical/activity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SaveActivityData {
  company: string;
  data: StoreAeronauticalActivityPayload | UpdateAeronauticalActivityPayload;
  image?: File | null;
  document?: File | null;
  libraryFolderPaths?: string[];
}

function buildActivityFormData({
  data,
  image,
  document,
  libraryFolderPaths = [],
}: Omit<SaveActivityData, "company">): FormData {
  const formData = new FormData();

  formData.append("activity_name", data.activity_name ?? "");
  formData.append("activity_number", data.activity_number ?? "");
  formData.append("place", data.place ?? "");
  formData.append("description", data.description ?? "");

  if (data.status) formData.append("status", data.status);

  (data.categories ?? []).forEach((categoryId) =>
    formData.append("categories[]", categoryId),
  );

  if (image) formData.append("image", image);
  if (document) formData.append("document", document);

  // Sin `is_pre` la actividad vive en una única carpeta de la Librería.
  if (document && libraryFolderPaths[0]) {
    formData.append("library_folder_path", libraryFolderPaths[0]);
  }

  return formData;
}

export const useCreateAeronauticalActivity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, ...rest }: SaveActivityData) => {
      const formData = buildActivityFormData(rest);
      const response = await axiosInstance.post(
        `/${company}/sms/aeronautical/activities`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activities"] });
      toast.success("¡Creada!", {
        description: "La actividad ha sido creada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear la actividad" });
    },
  });

  return { createAeronauticalActivity: mutation };
};

export const useUpdateAeronauticalActivity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      id,
      ...rest
    }: SaveActivityData & { id: string }) => {
      const formData = buildActivityFormData(rest);
      // multipart no admite PATCH real: Laravel lo reinterpreta con _method.
      formData.append("_method", "PATCH");

      const response = await axiosInstance.post(
        `/${company}/sms/aeronautical/activities/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activities"] });
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activity"] });
      toast.success("¡Actualizada!", {
        description: "La actividad ha sido actualizada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la actividad" });
    },
  });

  return { updateAeronauticalActivity: mutation };
};

export const useDeleteAeronauticalActivity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: string }) => {
      await axiosInstance.delete(
        `/${company}/sms/aeronautical/activities/${id}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activities"] });
      toast.success("¡Eliminada!", {
        description: "La actividad ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la actividad" });
    },
  });

  return { deleteAeronauticalActivity: mutation };
};

export const useCloseAeronauticalActivity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: string }) => {
      await axiosInstance.patch(
        `/${company}/sms/aeronautical/activities/${id}/close`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activities"] });
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activity"] });
      toast.success("Cerrada", {
        description: "La actividad se ha cerrado.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "cerrar la actividad" });
    },
  });

  return { closeAeronauticalActivity: mutation };
};

export const useOpenAeronauticalActivity = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: string }) => {
      await axiosInstance.patch(
        `/${company}/sms/aeronautical/activities/${id}/open`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activities"] });
      queryClient.invalidateQueries({ queryKey: ["aeronautical-activity"] });
      toast.success("Reabierta", {
        description: "La actividad se ha vuelto a abrir.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "reabrir la actividad" });
    },
  });

  return { openAeronauticalActivity: mutation };
};
