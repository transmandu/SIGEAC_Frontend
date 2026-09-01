import axiosInstance from "@/lib/axios"
import { CatalogCategory, CatalogCountingMethod } from "@/types/maintenanceCatalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export interface ServiceFormData {
  maintenance_catalog_manual_id?: number | null;
  category: CatalogCategory;
  name: string;
  code?: string;
  description?: string;
  counting_method?: CatalogCountingMethod | null;
  interval_value?: number | null;
  aircraft_ids: number[];
}

export const useCreateCatalogService = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: ServiceFormData; company: string }) => {
      await axiosInstance.post(`/${company}/maintenance-catalog-services`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
      toast.success("¡Creado!", { description: "El servicio/certificado ha sido registrado correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "No se pudo registrar el servicio/certificado..." });
    },
  });

  return { createCatalogService: createMutation };
};

export const useUpdateCatalogService = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: number | string; data: ServiceFormData; company: string }) => {
      await axiosInstance.put(`/${company}/maintenance-catalog-services/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service", variables.company, variables.id] });
      toast.success("¡Actualizado!", { description: "El servicio/certificado ha sido actualizado correctamente." });
    },
    onError: () => {
      toast.error("Oops!", { description: "No se pudo actualizar el servicio/certificado..." });
    },
  });

  return { updateCatalogService: updateMutation };
};

export const useDeleteCatalogService = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number | string; company: string }) => {
      await axiosInstance.delete(`/${company}/maintenance-catalog-services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
      toast.success("¡Eliminado!", { description: "El servicio/certificado ha sido eliminado correctamente." });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error("Oops!", { description: message || "No se pudo eliminar el servicio/certificado..." });
    },
  });

  return { deleteCatalogService: deleteMutation };
};
