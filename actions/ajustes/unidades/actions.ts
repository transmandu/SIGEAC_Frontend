import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { Unit } from "@/types";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface createUnitSchema {
  value: string;
  label: string;
  is_dimensional?: boolean;
}

interface updateUnitSchema extends createUnitSchema {
  id: number | string;
}

export const useCreateUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: createUnitSchema): Promise<Unit> => {
      const res = await axiosInstance.post(`/${selectedCompany?.slug}/unit`, data);
      return res.data?.Unit as Unit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", selectedCompany?.slug],
      });
      toast("¡Creado!", {
        description: `¡La unidad se ha creado correctamente!`,
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: getApiErrorMessage(error, "No se creó correctamente."),
      });
    },
  });

  return {
    createUnit: createMutation,
  };
};

export const useUpdateUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: updateUnitSchema): Promise<Unit> => {
      const res = await axiosInstance.patch(`/${selectedCompany?.slug}/unit/${id}`, data);
      return res.data?.Unit as Unit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", selectedCompany?.slug],
      });
      // Las conversiones muestran el label de su unidad: renombrarla las desactualiza.
      ["unit-conversions", "unit-conversion-presets", "unit-conversion-suggestions"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key, selectedCompany?.slug] }),
      );
      toast.success("¡Actualizado!", {
        description: `¡La unidad se ha actualizado correctamente!`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "¡Hubo un error al actualizar la unidad!"),
      });
    },
  });

  return {
    updateUnit: updateMutation,
  };
};

export const useDeleteUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${selectedCompany?.slug}/unit/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", selectedCompany?.slug],
      });
      ["unit-conversions", "unit-conversion-presets", "unit-conversion-suggestions"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key, selectedCompany?.slug] }),
      );
      toast.success("¡Eliminado!", {
        description: `¡La unidad ha sido eliminado correctamente!`,
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ?? "¡Hubo un error al eliminar la unidad!",
      });
    },
  });

  return {
    deleteUnit: deleteMutation,
  };
};

