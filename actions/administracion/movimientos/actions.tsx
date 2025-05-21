import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCashMovement = () => {
  const queryCashMovement = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post("/transmandu/cash-movements", data);
    },
    onSuccess: () => {
      queryCashMovement.invalidateQueries({ queryKey: ["cash-movements"] });
      toast("¡Creado!", {
        description: `¡El movimiento se ha creado correctamente!`,
      });
    },
    onError: (error) => {
      toast("Hey", {
        description: `No se creo correctamente: ${error}`,
      });
    },
  });
  return {
    createCashMovement: createMutation,
  };
};

export const useDeleteCashMovement = () => {
  const queryCashMovement = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/transmandu/cash-movements/${id}`);
    },
    onSuccess: () => {
      queryCashMovement.invalidateQueries({ queryKey: ["cash-movements"] });
      toast.success("¡Eliminado!", {
        description: `¡El movimiento ha sido eliminado correctamente!`,
      });
    },
    onError: (e) => {
      toast.error("Oops!", {
        description: "¡Hubo un error al eliminar la cuenta!",
      });
    },
  });
  return {
    deleteCashMovement: deleteMutation,
  };
};
