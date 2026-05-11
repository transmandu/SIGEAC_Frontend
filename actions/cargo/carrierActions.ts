import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateCarrierData {
  name: string;
  middle_name?: string;
  last_name: string;
  second_last_name?: string;
  dni: string;
  phone?: string;
}

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: CreateCarrierData;
    }) => {
      const response = await axiosInstance.post(`/${company}/carriers`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success("Transportista Registrado", {
        description: "El transportista ha sido agregado correctamente",
      });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: `No se pudo crear el transportista: ${error.message}`,
      });
    },
  });

  return { createCarrier: createMutation };
};
