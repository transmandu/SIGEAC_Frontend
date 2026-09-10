import axiosInstance from "@/lib/axios"
import { CatalogCategory, CatalogInterval, CatalogStatus } from "@/types/maintenanceCatalog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/apiErrorMessage";
import { TaskFormData } from "@/actions/mantenimiento/catalogo/tareas/actions";

export interface ManualFormData {
  name: string;
  manual_code?: string;
  revision?: string;
  effective_date?: string;
  description?: string;
  is_physical: boolean;
  /** Ausente al crear: siempre nace ACTIVE. Solo se manda al editar. */
  status?: CatalogStatus;
  file?: File | null;
}

/**
 * Un servicio que se arrastra a la revisión nueva. Va completo y no por id:
 * entre una revisión y otra el manual pudo cambiar intervalos, tareas o
 * requisitos, y el usuario los corrige antes de copiar. `source_service_id`
 * marca de cuál venía para que el backend lo deje SUPERSEDED.
 */
export interface RevisionServiceFormData {
  source_service_id?: number;
  category: CatalogCategory;
  name: string;
  code?: string;
  description?: string;
  intervals: CatalogInterval[];
  aircraft_ids: number[];
  /** Los ids de requisito que traiga una tarea precargada se descartan al
   *  serializar: la copia crea filas propias, no reutiliza las del original. */
  tasks: TaskFormData[];
}

export interface ManualRevisionFormData {
  revision?: string;
  effective_date?: string;
  description?: string;
  is_physical: boolean;
  file?: File | null;
  /** Contenido arrastrado desde la revisión anterior, ya revisado. */
  services: RevisionServiceFormData[];
}

/**
 * Aplana un valor anidado en claves `services[0][tasks][1][description]`, que
 * es como PHP reconstruye un arreglo dentro de un multipart. Los nulos se
 * omiten: FormData los mandaría como la cadena "null" y `nullable` no la
 * dejaría pasar.
 */
function appendNested(formData: FormData, key: string, value: unknown): void {
  if (value === null || value === undefined || value === "") return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendNested(formData, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) =>
      appendNested(formData, `${key}[${childKey}]`, childValue),
    );
    return;
  }

  formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
}

function toManualFormData(data: ManualFormData): FormData {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("is_physical", data.is_physical ? "1" : "0");
  if (data.manual_code) formData.append("manual_code", data.manual_code);
  if (data.revision) formData.append("revision", data.revision);
  if (data.effective_date) formData.append("effective_date", data.effective_date);
  if (data.description) formData.append("description", data.description);
  if (data.status) formData.append("status", data.status);
  if (data.file) formData.append("file", data.file);
  return formData;
}

/**
 * El nombre/revisión del manual se muestra dentro de cada servicio y en el
 * selector del formulario, así que un cambio de manual también invalida las
 * vistas de servicios. El detalle se invalida por prefijo: una revisión nueva
 * afecta al manual anterior Y al recién creado.
 */
const invalidateManualScopes = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manuals"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-manual"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-services"] });
  queryClient.invalidateQueries({ queryKey: ["maintenance-catalog-service"] });
};

export const useCreateCatalogManual = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ data, company }: { data: ManualFormData; company: string }) => {
      await axiosInstance.post(`/${company}/maintenance-catalog-manuals`, toManualFormData(data), {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Creado!", { description: "El manual ha sido registrado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo registrar el manual...") });
    },
  });

  return { createCatalogManual: createMutation };
};

export const useUpdateCatalogManual = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, company }: { id: number | string; data: ManualFormData; company: string }) => {
      const formData = toManualFormData(data);
      formData.append("_method", "PUT");
      await axiosInstance.post(`/${company}/maintenance-catalog-manuals/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Actualizado!", { description: "El manual ha sido actualizado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo actualizar el manual...") });
    },
  });

  return { updateCatalogManual: updateMutation };
};

export const useCreateManualRevision = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: number | string;
      data: ManualRevisionFormData;
      company: string;
    }) => {
      const formData = new FormData();
      formData.append("is_physical", data.is_physical ? "1" : "0");
      if (data.revision) formData.append("revision", data.revision);
      if (data.effective_date) formData.append("effective_date", data.effective_date);
      if (data.description) formData.append("description", data.description);
      if (data.file) formData.append("file", data.file);

      // El envío es multipart por el archivo, así que el árbol de servicios se
      // aplana campo por campo: serializarlo como un JSON en una sola clave
      // dejaría a Laravel validando una cadena en vez del arreglo.
      appendNested(formData, "services", data.services);

      const { data: response } = await axiosInstance.post(
        `/${company}/maintenance-catalog-manuals/${id}/revision`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response;
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Revisión registrada!", {
        description: "La revisión anterior quedó marcada como superada.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo registrar la nueva revisión...") });
    },
  });

  return { createManualRevision: createMutation };
};

export const useDeleteCatalogManual = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: number | string; company: string }) => {
      await axiosInstance.delete(`/${company}/maintenance-catalog-manuals/${id}`);
    },
    onSuccess: () => {
      invalidateManualScopes(queryClient);
      toast.success("¡Eliminado!", { description: "El manual ha sido eliminado correctamente." });
    },
    onError: (error) => {
      toast.error("Oops!", { description: apiErrorMessage(error, "No se pudo eliminar el manual...") });
    },
  });

  return { deleteCatalogManual: deleteMutation };
};
