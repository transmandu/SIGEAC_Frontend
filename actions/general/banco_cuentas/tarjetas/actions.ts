import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CardData {
  name: string;
  card_number: string;
  /** Cuenta a la que pertenece la tarjeta. */
  bank_account_id: number;
  /** Método de pago (debe estar habilitado para esa cuenta); define el tipo de la tarjeta. */
  payment_method_id: number;
  /** Compañías para las que la tarjeta es válida — solo SUPERUSER puede definirlas. */
  company_ids?: number[];
}

const invalidateCardQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["cards"] });
  queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
  queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
  queryClient.invalidateQueries({ queryKey: ["payment-options"] });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CardData) => {
      await axiosInstance.post("/cards", data);
    },
    onSuccess: () => {
      invalidateCardQueries(queryClient);
      toast.success("¡Creada!", {
        description: "¡La tarjeta se ha creado correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo crear la tarjeta.",
      });
    },
  });

  return {
    createCard: createMutation,
  };
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<CardData> }) => {
      await axiosInstance.put(`/cards/${id}`, data);
    },
    onSuccess: () => {
      invalidateCardQueries(queryClient);
      toast.success("¡Actualizada!", {
        description: "¡La tarjeta se ha actualizado correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo actualizar la tarjeta.",
      });
    },
  });

  return {
    updateCard: updateMutation,
  };
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/cards/${id}`);
    },
    onSuccess: () => {
      invalidateCardQueries(queryClient);
      toast.success("¡Eliminada!", {
        description: "¡La tarjeta ha sido eliminada correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "¡Hubo un error al eliminar la tarjeta!",
      });
    },
  });

  return {
    deleteCard: deleteMutation,
  };
};
