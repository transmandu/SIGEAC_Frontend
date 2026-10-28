import axiosInstance from "@/lib/axios";
import { Unit } from "@/types";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

interface createUnitSchema {
  value: string;
  label: string;
  is_dimensional?: boolean;
  allows_fractions?: boolean;
}

/** Actualización parcial: solo viajan los campos que cambiaron. */
interface updateUnitSchema extends Partial<createUnitSchema> {
  id: number | string;
}

export const useCreateUnit = () => {
  const { selectedCompany } = useCompanyStore();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: createUnitSchema): Promise<Unit> => {
      const res = await axiosInstance.post(
        `/${selectedCompany?.slug}/unit`,
        data,
      );
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
      notifyError(error, { action: "crear el registro" });
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
      const res = await axiosInstance.patch(
        `/${selectedCompany?.slug}/unit/${id}`,
        data,
      );
      return res.data?.Unit as Unit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["units", selectedCompany?.slug],
      });
      // Las conversiones muestran el label de su unidad: renombrarla las desactualiza.
      [
        "unit-conversions",
        "unit-conversion-presets",
        "unit-conversion-suggestions",
      ].forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: [key, selectedCompany?.slug],
        }),
      );
      toast.success("¡Actualizado!", {
        description: `¡La unidad se ha actualizado correctamente!`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la unidad" });
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
      [
        "unit-conversions",
        "unit-conversion-presets",
        "unit-conversion-suggestions",
      ].forEach((key) =>
        queryClient.invalidateQueries({
          queryKey: [key, selectedCompany?.slug],
        }),
      );
      toast.success("¡Eliminado!", {
        description: `¡La unidad ha sido eliminado correctamente!`,
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "eliminar la unidad" });
    },
  });

  return {
    deleteUnit: deleteMutation,
  };
};
