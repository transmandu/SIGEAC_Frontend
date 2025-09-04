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
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['credit-payment'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] }); //query de cuentas por pagar
      queryClient.invalidateQueries({ queryKey: ['credit-flight-payment'] }); //query de credito de vuelos
      queryClient.invalidateQueries({ queryKey: ['credit-rent-payment'] });  //query de credito de renta

      toast.success("Pago registrado correctamente");

      if (options?.onSuccess) {
        options.onSuccess(); // Ejecutar callback opcional
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
