import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BankData {
  name: string;
  type: string;
}

export const useCreateBank = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: BankData) => {
      await axiosInstance.post(`/banks`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("¡Creado!", {
        description: "¡El banco se ha creado correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo crear el banco.",
      });
    },
  });

  return {
    createBank: createMutation,
  };
};

export const useUpdateBank = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<BankData> }) => {
      await axiosInstance.put(`/banks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["payment-options"] });
      toast.success("¡Actualizado!", {
        description: "¡El banco se ha actualizado correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo actualizar el banco.",
      });
    },
  });

  return {
    updateBank: updateMutation,
  };
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/banks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("¡Eliminado!", {
        description: "¡El banco ha sido eliminado correctamente!",
      });
    },
    onError: (error: any) => {
      // El backend responde 409 si el banco tiene cuentas asociadas.
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "¡Hubo un error al eliminar el banco!",
      });
    },
  });

  return {
    deleteBank: deleteMutation,
  };
};
