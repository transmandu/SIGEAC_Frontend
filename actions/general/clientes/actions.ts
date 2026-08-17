import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const useUpdateBalance = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: string; data: any, company: string }) => {
      await axiosInstance.patch(`/${company}/clients-add-balance/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast("¡Actualizado!", {
        description: "¡Se ha actualizado el saldo del cliente correctamente!",
      });
    },
    onError: (error) => {
      console.log(error)
      toast.error("Oops!", {
        description: `Hubo un error al actualizar el saldo del cliente.`,
      });
    },
  });

  return {
    updateBalance: updateMutation,
  };
};
