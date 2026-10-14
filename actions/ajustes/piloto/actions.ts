import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { Pilot } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PilotSchema {
  company: string;
  data: {
    employee_dni: string;
    license_number: string;
  };
}

interface updatePilotSchema {
  company: string;
  id: string;
  data: {
    license_number: string;
  };
}

export const useCreatePilot = () => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationKey: ["pilots"],
    mutationFn: async ({ company, data }: PilotSchema) => {
      await axiosInstance.post(`/${company}/pilots`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilots"] });
      toast.success("¡Creado!", {
        description: ` El piloto ha sido creado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(error, "No se pudo crear el piloto..."),
      });
    },
  });
  return {
    createPilot: createMutation,
  };
};

export const useDeletePilot = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      id,
    }: {
      company: string | undefined;
      id: number | string;
    }) => {
      await axiosInstance.delete(`/${company}/pilots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilots"] });
      toast.success("¡Eliminado!", {
        description: `¡El piloto ha sido eliminado correctamente!`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "¡Hubo un error al eliminar el piloto!",
        ),
      });
    },
  });

  return {
    deletePilot: deleteMutation,
  };
};

export const useUpdatePilot = () => {
  const queryClient = useQueryClient();

  const updatePilotMutation = useMutation({
    mutationKey: ["pilots"],
    mutationFn: async ({ company, id, data }: updatePilotSchema) => {
      await axiosInstance.put(`/${company}/pilots/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilots"] });
      toast.success("¡Actualizado!", {
        description: `El piloto ha sido actualizado correctamente.`,
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getApiErrorMessage(
          error,
          "No se pudo actualizar el piloto...",
        ),
      });
    },
  });
  return {
    updatePilot: updatePilotMutation,
  };
};
