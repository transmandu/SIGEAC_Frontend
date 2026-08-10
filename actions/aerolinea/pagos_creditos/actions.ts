import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateCreditPayment = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(`/transmandu/credit-payment/${data.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Un pago baja el saldo del crédito, y ese saldo se muestra en cuentas por
      // pagar y en las vistas por origen (vuelo y renta), no solo aquí.
      queryClient.invalidateQueries({ queryKey: ['credit-payment'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-flight-payment'] });
      queryClient.invalidateQueries({ queryKey: ['credit-rent-payment'] });

      toast.success("Pago registrado correctamente");

      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      toast.error("Error al registrar el pago", {
        description: error.message,
      });
    },
  });

  return {
    createCreditPayment: createMutation,
  };
}
