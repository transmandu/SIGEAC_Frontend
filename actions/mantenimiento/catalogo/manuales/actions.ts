import axiosInstance from "@/lib/axios"
import { CatalogStatus } from "@/types/maintenanceCatalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/apiErrorMessage";

export interface ManualFormData {
  name: string;
  manual_code?: string;
  revision?: string;
  effective_date?: string;
  description?: string;
  is_physical: boolean;
  /** Ausente al crear: siempre nace ACTIVE. Solo se manda al editar. */
  status?: CatalogStatus;
  file?: File | null;
}

export interface ManualRevisionFormData {
  revision?: string;
  effective_date?: string;
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
  if (data.effective_date) formData.append("effective_date", data.effective_date);
  if (data.description) formData.append("description", data.description);
  if (data.status) formData.append("status", data.status);
  if (data.file) formData.append("file", data.file);
  return formData;
}

/**
 * El nombre/revisión del manual se muestra dentro de cada servicio y en el
 * selector del formulario, así que un cambio de manual también invalida las
 * vistas de servicios. El detalle se invalida por prefijo: una revisión nueva
 * afecta al manual anterior Y al recién creado.
 */
const invalidateManualScopes = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manual"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service"] });
};

export const useCreateCatalogManual = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: ManualFormData; company: string }) => {
      await axiosInstance.post(`/${company}/maintenance-catalog-manuals`, toManualFormData(data), {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Creado!", { description: "El manual ha sido registrado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo registrar el manual...") });
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
      invalidateManualScopes(queryClient);
      toast.success("¡Actualizado!", { description: "El manual ha sido actualizado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo actualizar el manual...") });
    },
  });

  return { updateCatalogManual: updateMutation };
};

export const useCreateManualRevision = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number | string;
      data: ManualRevisionFormData;
      company: string;
    }) => {
      const formData = new FormData();
      formData.append("is_physical", data.is_physical ? "1" : "0");
      if (data.revision) formData.append("revision", data.revision);
      if (data.effective_date) formData.append("effective_date", data.effective_date);
      if (data.description) formData.append("description", data.description);
      if (data.file) formData.append("file", data.file);

      const { data: response } = await axiosInstance.post(
        `/${company}/maintenance-catalog-manuals/${id}/revision`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response;
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Revisión registrada!", {
        description: "La revisión anterior quedó marcada como superada.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo registrar la nueva revisión...") });
    },
  });

  return { createManualRevision: createMutation };
};

export const useDeleteCatalogManual = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number | string; company: string }) => {
      await axiosInstance.delete(`/${company}/maintenance-catalog-manuals/${id}`);
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Eliminado!", { description: "El manual ha sido eliminado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo eliminar el manual...") });
    },
  });

  return { deleteCatalogManual: deleteMutation };
};
