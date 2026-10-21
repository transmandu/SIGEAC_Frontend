import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

interface ToolBoxProps {
  id?: number;
  name: string;
  created_by: string;
  delivered_by: string;
  tool_id: string[];
}

export const useCreateToolBox = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationKey: ["tool-box"],
    mutationFn: async ({
      data,
      company,
    }: {
      data: ToolBoxProps;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/tool-box`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-boxes"] });
      toast.success("¡Creado!", {
        description: `La caja ha sido creada correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear la caja" });
      console.log(error);
    },
  });
  return {
    createToolBox: createMutation,
  };
};

export const useUpdateToolBox = () => {
  const queryClient = useQueryClient();

  const updateToolBoxMutation = useMutation({
    mutationKey: ["update-tool-box"],
    mutationFn: async ({
      data,
      company,
    }: {
      data: ToolBoxProps;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/tool-box/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-boxes"] });
      toast.success("¡Actualizado!", {
        description: `La caja ha sido actualizada correctamente.`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la caja" });
      console.log(error);
    },
  });
  return {
    updateToolBox: updateToolBoxMutation,
  };
};

export const useDeleteToolBox = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number | string;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/tool-box/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-boxes"] });
      toast.success("¡Eliminado!", {
        description: `¡La caja ha sido eliminada correctamente!`,
      });
    },
    onError: (e) => {
      notifyError(e, { action: "eliminar la caja" });
    },
  });

  return {
    deleteToolBox: deleteMutation,
  };
};
