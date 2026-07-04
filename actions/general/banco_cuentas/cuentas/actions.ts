import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BankAccountData {
  name: string;
  account_number: string;
  account_type: string;
  account_owner: string;
  bank_id: number;
  /** Compañías habilitadas para la cuenta — solo SUPERUSER puede definirlas. */
  company_ids?: number[];
  /** Métodos de pago (catálogo global) que esta cuenta puede usar. */
  payment_method_ids?: number[];
}

const invalidateBankAccountQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
  queryClient.invalidateQueries({ queryKey: ["bank-accounts-by-bank"] });
  queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
  queryClient.invalidateQueries({ queryKey: ["payment-options"] });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: BankAccountData) => {
      await axiosInstance.post("/bank-accounts", data);
    },
    onSuccess: () => {
      invalidateBankAccountQueries(queryClient);
      toast.success("¡Creada!", {
        description: "¡La cuenta se ha creado correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo crear la cuenta.",
      });
    },
  });

  return {
    createBankAccount: createMutation,
  };
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<BankAccountData> }) => {
      await axiosInstance.put(`/bank-accounts/${id}`, data);
    },
    onSuccess: () => {
      invalidateBankAccountQueries(queryClient);
      toast.success("¡Actualizada!", {
        description: "¡La cuenta se ha actualizado correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo actualizar la cuenta.",
      });
    },
  });

  return {
    updateBankAccount: updateMutation,
  };
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/bank-accounts/${id}`);
    },
    onSuccess: () => {
      invalidateBankAccountQueries(queryClient);
      // Los métodos y tarjetas de la cuenta se eliminan en cascada.
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("¡Eliminada!", {
        description: "¡La cuenta ha sido eliminada correctamente!",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "¡Hubo un error al eliminar la cuenta!",
      });
    },
  });

  return {
    deleteBankAccount: deleteMutation,
  };
};
