import axiosInstance from "@/lib/axios";
import { MaintenanceProvider } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

export const useCreateMaintenanceProvider = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      company,
    }: {
      name: string;
      company: string;
    }): Promise<MaintenanceProvider> => {
      const { data } = await axiosInstance.post(
        `/${company}/maintenance-providers`,
        { name },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-providers"] });
      toast.success("¡Creado!", {
        description: `La entidad ha sido registrada correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "registrar la entidad" });
      console.log(error);
    },
  });

  return {
    createMaintenanceProvider: createMutation,
  };
};
