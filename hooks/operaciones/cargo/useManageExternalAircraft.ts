"use client";

import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { number, string } from "zod";

export const useManageExternalAircraft = (company?: string) => {
  const queryClient = useQueryClient();

  const renameMutation = useMutation({
    mutationFn: async ({
      month,
      year,
      oldName,
      newName,
    }: {
      month: number;
      year: number;
      oldName: string;
      newName: string;
    }) => {
      const response = await axiosInstance.put(
        `/${company}/cargo-shipments/external-aircraft/bulk-rename`,
        { month, year, old_name: oldName, new_name: newName },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Se han actualizado todos los datos de la aeronave");
      queryClient.invalidateQueries({ queryKey: ["cargo-stats-by-aircraft"] });
      queryClient.invalidateQueries({
        queryKey: ["external-aircraft-suggestions"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Ha ocurrido un error al intentar actualizar la información",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      month,
      year,
      externalAircraft,
    }: {
      month: number;
      year: number;
      externalAircraft: string;
    }) => {
      const response = await axiosInstance.delete(
        `/${company}/cargo-shipments/external-aircraft/bulk-delete`,
        { data: { month, year, external_aircraft: externalAircraft } },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Se han eliminado los registros de la aeronave");
      queryClient.invalidateQueries({ queryKey: ["cargo-stats-by-aircraft"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Ha ocurrido un error al intentar eliminar la aeronave",
      );
    },
  });

  return {
    bulkRename: renameMutation.mutate,
    isRenaming: renameMutation.isPending,
    bulkDelete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
