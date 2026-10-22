import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  UpdateCostPayload,
  BulkUpdateItem,
  BulkUpdatePayload,
} from "@/types/purchase";
import { notifyError } from "@/lib/notify-error";

const invalidateArticles = (queryClient: any) => {
  queryClient.invalidateQueries({
    queryKey: ["warehouse-articles"],
    exact: false,
  });

  queryClient.invalidateQueries({
    queryKey: ["warehouse-articles-all"],
    exact: false,
  });
};
const invalidateGeneral = (queryClient: any) => {
  queryClient.invalidateQueries({
    queryKey: ["general-articles"],
    exact: false,
  });
};

const updateArticleCost = async ({ company, id, cost }: UpdateCostPayload) => {
  const { data } = await axiosInstance.put(
    `/${company}/update-article-cost/${id}`,
    { cost },
  );
  return data;
};

const bulkUpdateArticleCost = async ({
  company,
  updates,
}: BulkUpdatePayload) => {
  const { data } = await axiosInstance.post(
    `/${company}/bulk-update-article-cost`,
    { updates },
  );
  return data;
};

const updateGeneralCost = async ({ company, id, cost }: UpdateCostPayload) => {
  const { data } = await axiosInstance.put(
    `/${company}/update-general-cost/${id}`,
    { cost },
  );
  return data;
};

const bulkUpdateGeneralCost = async ({
  company,
  updates,
}: BulkUpdatePayload) => {
  const { data } = await axiosInstance.post(
    `/${company}/bulk-update-general-cost`,
    { updates },
  );
  return data;
};

export const useUpdateArticleCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArticleCost,
    onSuccess: () => {
      toast.success("Costo actualizado correctamente");
      invalidateArticles(queryClient);
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar costo" });
    },
  });
};

export const useBulkUpdateArticleCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateArticleCost,
    onSuccess: () => {
      toast.success("Costos actualizados correctamente");
      invalidateArticles(queryClient);
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar los costos en lote" });
    },
  });
};

export const useUpdateGeneralCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGeneralCost,
    onSuccess: () => {
      toast.success("Costo inicial registrado correctamente");
      invalidateGeneral(queryClient);
    },
    onError: (error: any) => {
      notifyError(error, { action: "registrar costo" });
    },
  });
};

export const useBulkUpdateGeneralCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateGeneralCost,
    onSuccess: (data) => {
      const skippedCount = data?.skipped?.length ?? 0;
      toast.success(
        skippedCount > 0
          ? `Costos registrados. ${skippedCount} artículo(s) ya tenían costo y no se modificaron.`
          : "Costos iniciales registrados correctamente",
      );
      invalidateGeneral(queryClient);
    },
    onError: (error: any) => {
      notifyError(error);
    },
  });
};
