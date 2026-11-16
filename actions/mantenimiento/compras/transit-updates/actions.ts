import axiosInstance from "@/lib/axios";
import { transitUpdatesKey } from "@/hooks/mantenimiento/compras/useGetTransitUpdates";
import { notifyError } from "@/lib/notify-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { TransitUpdatePayload } from "@/types/purchase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Tras tocar la bitácora se refresca ella y la cola de tránsito: la fila lleva
 * el conteo de novedades y la fecha de la última.
 */
const useRefreshTransitUpdates = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  return (articleId: number) => {
    queryClient.invalidateQueries({
      queryKey: transitUpdatesKey(selectedCompany?.slug, articleId),
    });
    queryClient.invalidateQueries({
      queryKey: ["articles", selectedCompany?.slug],
    });
  };
};

export const useCreateTransitUpdate = () => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshTransitUpdates();

  return useMutation({
    mutationFn: async ({
      articleId,
      data,
      applyToOrder,
    }: {
      articleId: number;
      data: TransitUpdatePayload;
      applyToOrder: boolean;
    }) => {
      const { data: response } = await axiosInstance.post<{
        message: string;
        count: number;
      }>(`/${selectedCompany?.slug}/articles/${articleId}/transit-updates`, {
        ...data,
        apply_to_order: applyToOrder,
      });
      return response;
    },
    onSuccess: (response, variables) => {
      refresh(variables.articleId);
      toast.success("¡Registrada!", { description: response.message });
    },
    onError: (error) => {
      notifyError(error, { action: "registrar la novedad de tránsito" });
    },
  });
};

export const useUpdateTransitUpdate = () => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshTransitUpdates();

  return useMutation({
    mutationFn: async ({
      articleId,
      updateId,
      data,
    }: {
      articleId: number;
      updateId: number;
      data: TransitUpdatePayload;
    }) => {
      await axiosInstance.patch(
        `/${selectedCompany?.slug}/articles/${articleId}/transit-updates/${updateId}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      refresh(variables.articleId);
      toast.success("¡Actualizada!", {
        description: "La novedad se corrigió y el cambio quedó en el registro.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "corregir la novedad de tránsito" });
    },
  });
};

export const useDeleteTransitUpdate = () => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshTransitUpdates();

  return useMutation({
    mutationFn: async ({
      articleId,
      updateId,
    }: {
      articleId: number;
      updateId: number;
    }) => {
      await axiosInstance.delete(
        `/${selectedCompany?.slug}/articles/${articleId}/transit-updates/${updateId}`,
      );
    },
    onSuccess: (_, variables) => {
      refresh(variables.articleId);
      toast.success("¡Eliminada!", {
        description: "La novedad se eliminó y quedó constancia en el registro.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la novedad de tránsito" });
    },
  });
};
