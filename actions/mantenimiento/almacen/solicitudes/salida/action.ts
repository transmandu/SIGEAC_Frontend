import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IDispatchRequestAction {
  justification: string;
  submission_date: string;
  created_by: string;
  requested_by: string;
  category: string;
  status?: string;
  // `unit_id` es la unidad en que se capturó `quantity`; omitirlo significa que
  // ya viene en la unidad base del artículo. El backend hace la conversión.
  aeronautical_articles?: {
    article_id: number;
    quantity?: number;
    serial?: string | null;
    batch_id?: number;
    unit_id?: number | null;
  }[];
  general_articles?: {
    general_article_id: number;
    quantity: number;
    unit_id?: number | null;
  }[];
  user_id: number;
  aircraft_id?: string;
  authorized_employee_id?: string;
  department_id?: string;
  approved_by?: string
  delivered_by?: string
}

export const useCreateDispatchRequest = () => {
  const queryClient = useQueryClient();

  const router = useRouter();

  const { selectedStation } = useCompanyStore();

  const createMutation = useMutation({
    mutationKey: ["dispatch-request"],
    mutationFn: async ({
      data,
      company,
    }: {
      data: IDispatchRequestAction;
      company: string;
    }) => {
      await axiosInstance.post(`/${company}/dispatch-order`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests", data.company, selectedStation],
      });

      toast.success("¡Creado!", {
        description: `La solicitud ha sido creado correctamente.`,
      }),
        router.refresh();
    },
    onError: (error: any) => {
      // Ver nota en useUpdateStatusDispatchRequest: el stock en pantalla quedó
      // desactualizado, se refresca antes de que el usuario reintente.
      if (error?.response?.data?.insufficient_stock) {
        queryClient.invalidateQueries({ queryKey: ["batches-in-warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
        queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      }

      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo crear la solicitud...",
      });
      console.log(error);
    },
  });
  return {
    createDispatchRequest: createMutation,
  };
};

export const useUpdateStatusDispatchRequest = () => {
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationKey: ["dispatch-request-approve"],
    mutationFn: async ({
      id,
      status,
      approved_by,
      delivered_by,
      company,
    }: {
      id: string | number;
      status: string;
      approved_by: string;
      delivered_by: string;
      company: string;
    }) => {
      await axiosInstance.put(`/${company}/update-status-dispatch/${id}`, {
        status: status,
        approved_by: approved_by,
        delivered_by: delivered_by,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests-in-process"],
      }),
        queryClient.invalidateQueries({ queryKey: ["dispatched-articles"] }),
        queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
        toast.success("¡Actualizado!", {
          description: "¡La solicitud ha sido actualizada!",
        });
    },
    onError: (error: any) => {
      // Un 422 con `insufficient_stock` significa que la existencia cambió
      // desde que se cargó la pantalla: el stock que se muestra ya es viejo,
      // así que se refresca para que el reintento parta del real.
      if (error?.response?.data?.insufficient_stock) {
        queryClient.invalidateQueries({ queryKey: ["batches-in-warehouse"] });
        queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
        queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      }

      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo actualizar la solicitud...",
      });
      console.log(error);
    },
  });
  return {
    updateDispatchStatus: updateStatusMutation,
  };
};

export const useDeleteDispatchRequest = () => {
  const queryClient = useQueryClient();
  const { selectedStation } = useCompanyStore();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: string | number;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/dispatch-order/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests", variables.company, selectedStation],
      });
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests-in-process", variables.company, selectedStation],
      });
      queryClient.invalidateQueries({ queryKey: ["dispatched-articles", variables.company] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      toast.success("Â¡Eliminado!", {
        description: "La solicitud ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: "No se pudo eliminar la solicitud...",
      });
      console.log(error);
    },
  });

  return {
    deleteDispatchRequest: deleteMutation,
  };
};

// Devuelve al almacén un artículo ya despachado: la herramienta vuelve a
// ALMACENADO y el componente queda en resguardo (lo decide el backend según
// la categoría). Solo aplica a lo que no se consume.
export const useReturnToWarehouse = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number>({
    mutationKey: ["update-status", company],
    mutationFn: async (article_id: number) => {
      const { data } = await axiosInstance.put(
        `/${company}/update-status-items/${article_id}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dispatched-articles", company],
      });
      toast("¡Devuelto!", {
        description: `¡El artículo ha regresado correctamente!`,
      });
    },
    onError: (error) => {
      toast("Hey", {
        description: `No se logró retornar el artículo: ${error}`,
      });
    },
  });
};
