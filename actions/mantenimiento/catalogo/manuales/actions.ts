import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export interface ManualFormData {
  name: string;
  manual_code?: string;
  revision?: string;
  description?: string;
  is_physical: boolean;
  file?: File | null;
}

function toManualFormData(data: ManualFormData): FormData {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("is_physical", data.is_physical ? "1" : "0");
  if (data.manual_code) formData.append("manual_code", data.manual_code);
  if (data.revision) formData.append("revision", data.revision);
  if (data.description) formData.append("description", data.description);
  if (data.file) formData.append("file", data.file);
  return formData;
}

export const useCreateCatalogManual = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: ManualFormData; company: string }) => {
      await axiosInstance.post(`/${company}/maintenance-catalog-manuals`, toManualFormData(data), {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
      toast.success("¡Creado!", { description: "El manual ha sido registrado correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "No se pudo registrar el manual..." });
    },
  });

  return { createCatalogManual: createMutation };
};

export const useUpdateCatalogManual = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: number | string; data: ManualFormData; company: string }) => {
      const formData = toManualFormData(data);
      formData.append("_method", "PUT");
      await axiosInstance.post(`/${company}/maintenance-catalog-manuals/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
      toast.success("¡Actualizado!", { description: "El manual ha sido actualizado correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "No se pudo actualizar el manual..." });
    },
  });

  return { updateCatalogManual: updateMutation };
};

export const useDeleteCatalogManual = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number | string; company: string }) => {
      await axiosInstance.delete(`/${company}/maintenance-catalog-manuals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
      toast.success("¡Eliminado!", { description: "El manual ha sido eliminado correctamente." });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error("Oops!", { description: message || "No se pudo eliminar el manual..." });
    },
  });

  return { deleteCatalogManual: deleteMutation };
};
