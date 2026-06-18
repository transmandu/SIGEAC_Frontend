import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface CreateItemPayload {
  company: string;
  data: {
    uniform_type: string;
    size: string;
    company: string;
    min_stock?: number;
    initial_quantity?: number;
  };
}

interface UpdateItemPayload {
  company: string;
  id: number;
  data: { min_stock?: number; active?: boolean };
}

interface CreateMovementPayload {
  company: string;
  data: {
    uniform_item_id: number;
    movement_type: string;
    quantity: number;
    date: string;
    recipient_name?: string;
    direction?: "increase" | "decrease";
    notes?: string;
  };
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["uniform-items"] });
  queryClient.invalidateQueries({ queryKey: ["uniform-movements"] });
};

// --- CREAR ARTÍCULO (SKU) ---
export const useCreateUniformItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: CreateItemPayload) => {
      return await axiosInstance.post(`/${company}/sms/uniforms/items`, data);
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Artículo creado con éxito");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message?.size?.[0] ||
          error.response?.data?.message ||
          "Error al crear el artículo"
      );
    },
  });
};

// --- ACTUALIZAR ARTÍCULO (min_stock / activo) ---
export const useUpdateUniformItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, data }: UpdateItemPayload) => {
      return await axiosInstance.patch(
        `/${company}/sms/uniforms/items/${id}`,
        data
      );
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Artículo actualizado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al actualizar");
    },
  });
};

// --- ELIMINAR ARTÍCULO (sólo si no tiene movimientos) ---
export const useDeleteUniformItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      return await axiosInstance.delete(
        `/${company}/sms/uniforms/items/${id}`
      );
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Artículo eliminado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "No se pudo eliminar el artículo"
      );
    },
  });
};

// --- REGISTRAR MOVIMIENTO (entrada / entrega / ajuste) ---
export const useCreateUniformMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, data }: CreateMovementPayload) => {
      return await axiosInstance.post(
        `/${company}/sms/uniforms/movements`,
        data
      );
    },
    onSuccess: () => {
      invalidate(queryClient);
      toast.success("Movimiento registrado");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Error al registrar el movimiento"
      );
    },
  });
};
