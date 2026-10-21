import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

interface WarehouseSchema {
  name: string;
  location_id: number;
}

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: WarehouseSchema;
    }) => {
      await axiosInstance.post(`/${company}/warehouses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("¡Creado!", {
        description: `¡El almacén se ha creado correctamente!`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el registro" });
    },
  });

  return {
    createWarehouse: createMutation,
  };
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: number | string;
      data: WarehouseSchema;
    }) => {
      await axiosInstance.put(`/${company}/warehouses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("¡Actualizado!", {
        description: `¡El almacén se ha actualizado correctamente!`,
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el registro" });
    },
  });

  return {
    updateWarehouse: updateMutation,
  };
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number | string;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/warehouses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("¡Eliminado!", {
        description: `¡El almacén ha sido eliminado correctamente!`,
      });
    },
    onError: (error: any) => {
      notifyError(error, { action: "eliminar el almacén" });
    },
  });

  return {
    deleteWarehouse: deleteMutation,
  };
};
