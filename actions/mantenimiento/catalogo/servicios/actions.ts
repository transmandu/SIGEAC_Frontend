import axiosInstance from "@/lib/axios"
import { CatalogCategory, CatalogCountingMethod, CatalogStatus } from "@/types/maintenanceCatalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/apiErrorMessage";

export interface ServiceFormData {
  maintenance_catalog_manual_id?: number | null;
  category: CatalogCategory;
  name: string;
  code?: string;
  description?: string;
  counting_method?: CatalogCountingMethod | null;
  interval_value?: number | null;
  /** Ausente al crear: siempre nace ACTIVE. Solo se manda al editar. */
  status?: CatalogStatus;
  aircraft_ids: number[];
}

/**
 * Un servicio cuelga de un manual: su alta/baja cambia el `services_count` del
 * listado y la lista de servicios del detalle del manual, así que ambas vistas
 * se invalidan junto con las del propio servicio.
 */
const invalidateServiceScopes = (
  queryClient: ReturnType<typeof useQueryClient>,
  company?: string,
  id?: number | string,
) => {
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manual"] });

  if (company && id !== undefined) {
    queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service", company, id] });
  }
};

export const useCreateCatalogService = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: ServiceFormData; company: string }) => {
      await axiosInstance.post(`/${company}/maintenance-catalog-services`, data);
    },
    onSuccess: () => {
      invalidateServiceScopes(queryClient);
      toast.success("¡Creado!", { description: "El servicio/certificado ha sido registrado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo registrar el servicio/certificado...") });
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
      invalidateServiceScopes(queryClient, variables.company, variables.id);
      toast.success("¡Actualizado!", { description: "El servicio/certificado ha sido actualizado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo actualizar el servicio/certificado...") });
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
      invalidateServiceScopes(queryClient);
      toast.success("¡Eliminado!", { description: "El servicio/certificado ha sido eliminado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo eliminar el servicio/certificado...") });
    },
  });

  return { deleteCatalogService: deleteMutation };
};
