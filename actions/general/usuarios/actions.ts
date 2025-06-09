import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateEmployeeFormSchema {
  first_name: string;
  last_name: string;
  dni: string;
  company: string;
  job_title: {
    id: number;
  };
  department: {
    id: number;
  };
  location: {
    id: number;
  };
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeFormSchema) => {
      await axiosInstance.post("/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("¡Creado!", {
        description: `¡El empleado ha sido creado correctamente!`,
      });
    },
    onError: () => {
      toast.error("Oops!", {
        description: "¡Hubo un error al crear el empleado!",
      });
    },
  });
};
