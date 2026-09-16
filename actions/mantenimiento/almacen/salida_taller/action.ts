import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Trazo de una pieza dimensionada, mismas reglas que la salida normal. */
interface ICutPayload {
  piece_id: number;
  input_mode: "MEASURES" | "MAGNITUDE";
  length?: number;
  width?: number;
  magnitude?: number;
  unit_id?: number | null;
}

interface IWorkshopDispatchAction {
  workshop_id: number;
  requested_by?: string;
  receiver?: string;
  authorizer?: string;
  justification: string;
  aeronautical_articles?: {
    article_id: number;
    quantity: number;
    unit_id?: number | null;
    cut?: ICutPayload;
  }[];
  general_articles?: {
    general_article_id: number;
    quantity: number;
    unit_id?: number | null;
    cut?: ICutPayload;
  }[];
}

export const useCreateWorkshopDispatch = () => {
  const queryClient = useQueryClient();
  const { selectedStation } = useCompanyStore();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      company,
    }: {
      data: IWorkshopDispatchAction;
      company: string;
    }) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/workshop-dispatch-order`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workshop-dispatches", variables.company, selectedStation],
      });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches-in-warehouse"] });

      toast.success("¡Creada!", {
        description: "La salida a taller ha sido registrada correctamente.",
      });
    },
    onError: (error: any) => {
      if (error?.response?.data?.insufficient_stock) {
        queryClient.invalidateQueries({ queryKey: ["batches-in-warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
        queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      }

      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo crear la salida a taller...",
      });
    },
  });

  return { createWorkshopDispatch: createMutation };
};

export const useRegisterWorkshopDispatchEvent = () => {
  const queryClient = useQueryClient();

  const eventMutation = useMutation({
    mutationFn: async ({
      id,
      company,
      event,
      description,
      occurred_at,
    }: {
      id: number | string;
      company: string;
      event: string;
      description?: string;
      occurred_at?: string;
    }) => {
      const { data } = await axiosInstance.post(
        `/${company}/workshop-dispatch-order/${id}/events`,
        { event, description, occurred_at },
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workshop-dispatches", variables.company] });
      queryClient.invalidateQueries({ queryKey: ["workshop-dispatch", variables.company, variables.id] });

      toast.success("¡Suceso registrado!", {
        description: "El evento fue agregado al storyline de la salida.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message || "No se pudo registrar el suceso...",
      });
    },
  });

  return { registerWorkshopDispatchEvent: eventMutation };
};

export interface ICloseWorkshopDispatchAction {
  description?: string;
  /**
   * Deben ir TODAS las líneas con saldo pendiente, no solo las serializadas:
   * el backend rechaza el cierre si falta alguna. `condition_id` solo aplica a
   * lo serializado; en consumibles y artículos generales va sin definir.
   */
  items: {
    article_dispatch_order_id: number;
    condition_id?: number;
  }[];
}

export const useCloseWorkshopDispatch = () => {
  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: async ({
      id,
      company,
      data,
    }: {
      id: number | string;
      company: string;
      data: ICloseWorkshopDispatchAction;
    }) => {
      const { data: response } = await axiosInstance.post(
        `/${company}/workshop-dispatch-order/${id}/close`,
        data,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workshop-dispatches", variables.company] });
      queryClient.invalidateQueries({ queryKey: ["workshop-dispatch", variables.company, variables.id] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });

      toast.success("¡Salida cerrada!", {
        description: "El material reingresó a inventario.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo cerrar la salida a taller...",
      });
    },
  });

  return { closeWorkshopDispatch: closeMutation };
};
