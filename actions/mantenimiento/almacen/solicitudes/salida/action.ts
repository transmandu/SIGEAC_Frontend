import axiosInstance from "@/lib/axios";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IDispatchRequestAction {
  justification: string;
  // La fecha la sella el backend con el momento del registro. Sólo viaja en el
  // registro extemporáneo, que el backend vuelve a autorizar por rol.
  is_backdated?: boolean;
  submission_date?: string;
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
  /**
   * Fotos de la entrega, indexadas por la clave de la fila del formulario
   * ("aero:0", "general:1"): al capturarlas la línea de la salida todavía no
   * existe, así que el backend traduce la clave al id que le tocó. Opcional.
   */
  evidences?: Record<string, File[]>;
}

/**
 * Vuelca el payload de la salida a FormData.
 *
 * Axios sabe serializar un objeto plano como multipart, pero no mezclado con
 * archivos anidados: en cuanto entran las evidencias hay que construirlo a
 * mano. Los arrays van con notación de corchetes, que es como PHP los
 * reconstruye.
 */
function buildDispatchFormData(data: IDispatchRequestAction): FormData {
  const form = new FormData();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => append(`${key}[${index}]`, item));
      return;
    }

    if (typeof value === "object" && !(value instanceof File)) {
      Object.entries(value as Record<string, unknown>).forEach(
        ([childKey, childValue]) => append(`${key}[${childKey}]`, childValue),
      );
      return;
    }

    // Los booleanos viajan como "1"/"0": el string "false" que produce
    // String(false) es truthy en PHP y la regla `boolean` no lo acepta.
    form.append(
      key,
      typeof value === "boolean" ? (value ? "1" : "0") : (value as string | File),
    );
  };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "evidences") return;
    append(key, value);
  });

  Object.entries(data.evidences ?? {}).forEach(([rowKey, files]) => {
    files.forEach((file) => form.append(`evidences[${rowKey}][]`, file));
  });

  return form;
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
      await axiosInstance.post(
        `/${company}/dispatch-order`,
        buildDispatchFormData(data),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
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

export interface IDispatchReturnAction {
  // SEALED vuelve al almacén; ALTERED pasa por inspección de incoming.
  condition: "SEALED" | "ALTERED";
  justification: string;
  items: {
    article_dispatch_order_id: number;
    quantity: number;
  }[];
  /** Fotos de cómo volvió cada artículo, por línea. Opcional. */
  evidences?: Record<number, File[]>;
}

/**
 * Arma el multipart de la devolución.
 *
 * Los arrays viajan con notación de corchetes porque PHP los reconstruye desde
 * el nombre del campo; mandar JSON dentro de un FormData dejaría a Laravel con
 * un string donde espera un array.
 */
function buildReturnFormData(data: IDispatchReturnAction): FormData {
  const form = new FormData();

  form.append("condition", data.condition);
  form.append("justification", data.justification);

  data.items.forEach((item, index) => {
    form.append(
      `items[${index}][article_dispatch_order_id]`,
      String(item.article_dispatch_order_id)
    );
    form.append(`items[${index}][quantity]`, String(item.quantity));
  });

  Object.entries(data.evidences ?? {}).forEach(([lineId, files]) => {
    files.forEach((file) => form.append(`evidences[${lineId}][]`, file));
  });

  return form;
}

// Registra el reingreso de lo que salió y no se usó. No sustituye a eliminar
// la salida: aquí el despacho sigue constando y lo que cambia es su saldo.
export const useCreateDispatchReturn = () => {
  const queryClient = useQueryClient();
  const { selectedStation } = useCompanyStore();

  const returnMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string | number;
      data: IDispatchReturnAction;
      company: string;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/dispatch-order/${id}/returns`,
        buildReturnFormData(data),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests", variables.company, selectedStation],
      });
      queryClient.invalidateQueries({
        queryKey: ["dispatch-returns", variables.id],
      });
      // La devolución repone stock, así que el inventario en pantalla quedó viejo.
      queryClient.invalidateQueries({ queryKey: ["warehouse-articles"] });
      queryClient.invalidateQueries({ queryKey: ["general-articles"] });
      queryClient.invalidateQueries({ queryKey: ["batches-in-warehouse"] });

      toast.success("¡Devolución registrada!", {
        description: "El reingreso quedó asentado en la salida.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo registrar la devolución...",
      });
      console.log(error);
    },
  });

  return { createDispatchReturn: returnMutation };
};

// Borra una evidencia de ENTREGA ya guardada (una foto mal tomada). El backend
// rechaza las de devolución: respaldan una desviación ya declarada.
export const useDeleteDispatchEvidence = () => {
  const queryClient = useQueryClient();
  const { selectedStation } = useCompanyStore();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      company,
    }: {
      id: number;
      company: string;
    }) => {
      await axiosInstance.delete(`/${company}/dispatch-evidences/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["dispatches-requests", variables.company, selectedStation],
      });
      toast.success("¡Eliminada!", {
        description: "La evidencia fue eliminada correctamente.",
      });
    },
    onError: (error: any) => {
      toast.error("Oops!", {
        description:
          error?.response?.data?.message ||
          "No se pudo eliminar la evidencia...",
      });
      console.log(error);
    },
  });

  return { deleteDispatchEvidence: deleteMutation };
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
