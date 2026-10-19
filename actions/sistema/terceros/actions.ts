import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ThirdPartySchema {
  name: string;
  type: string;
}

export const useCreateThirdParty = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const createMutation = useMutation({
    mutationKey: ["third-parties"],
    mutationFn: async (data: ThirdPartySchema) => {
      await axiosInstance.post(`/${slug}/third-parties`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-parties", slug] });
      toast.success("¡Creado!", {
        description: ` El tercero ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "No se pudo crear el tercero."),
      });
    },
  });
  return {
    createThirdParty: createMutation,
  };
};

export const useUpdateThirdParty = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      /** Actualización parcial: solo viajan los campos que cambiaron. */
      data: Partial<ThirdPartySchema>;
    }) => {
      await axiosInstance.put(`/${slug}/third-parties/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-parties", slug] });
      toast.success("¡Actualizado!", {
        description: `El tercero ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "¡Hubo un error al actualizar el tercero!",
        ),
      });
    },
  });

  return {
    updateThirdParty: updateMutation,
  };
};

export const useDeleteThirdParty = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${slug}/third-parties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["third-parties", slug] });
      toast.success("¡Eliminado!", {
        description: `¡El tercero ha sido eliminado correctamente!`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "¡Hubo un error al eliminar el tercero!",
        ),
      });
    },
  });

  return {
    deleteThirdParty: deleteMutation,
  };
};
