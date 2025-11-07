import axiosInstance from "@/lib/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface unitConversionData {
  quantity: number;
  from_unit: number;
  to_unit: number;
}

export const usemakeConvertion = () => {

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: unitConversionData) => {
      const response = await axiosInstance.post(`/convertion-unit`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
          return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-convertion-post"] });
    //   toast.success("¡Creado!", {
    //     description: `La requisicion ha sido creada correctamente.`,
    //   });
    },
    onError: (error) => {
    //   toast.error("Oops!", {
    //     description: "No se pudo crear la requisicion...",
    //   });
      console.log(error);
    },
  });
  return {
    makeConvertion: createMutation,
  }
}

