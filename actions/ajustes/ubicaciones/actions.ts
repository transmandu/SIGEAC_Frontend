import axiosInstance from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Location } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface LocationPayload {
  address: string;
  name?: string | null;
  cod_iata: string;
  isMainBase: boolean;
}

/** Edición parcial: solo viajan los campos que cambiaron. */
interface UpdateLocationPayload extends Partial<LocationPayload> {
  id: number | string;
}

/**
 * Las sedes viven en varias cachés: la lista de la empresa, las del usuario
 * (selector de estación) y las de todas las empresas (altas de usuario); además
 * los almacenes y empleados muestran la sede en cada fila. Si alguna se queda
 * vieja, la sede nueva o renombrada no aparece donde se elige o se lee.
 */
const useRefreshLocations = () => {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanyStore();

  return () => {
    for (const queryKey of [
      ["location", selectedCompany?.slug],
      ["user-locations", selectedCompany?.slug],
      ["company-locations"],
      // Los listados que muestran la sede de cada fila.
      ["warehouses"],
      ["employees"],
      ["employees-inactive"],
    ]) {
      queryClient.invalidateQueries({ queryKey });
    }
  };
};

export const useCreateLocation = () => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshLocations();

  const createLocation = useMutation({
    mutationFn: async (data: LocationPayload): Promise<Location> => {
      const res = await axiosInstance.post(
        `/${selectedCompany?.slug}/locations`,
        data,
      );
      return res.data as Location;
    },
    onSuccess: () => {
      refresh();
      toast.success("¡Creada!", {
        description: "¡La sede se ha creado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear la sede" });
    },
  });

  return { createLocation };
};

export const useUpdateLocation = () => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshLocations();

  const updateLocation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateLocationPayload): Promise<Location> => {
      const res = await axiosInstance.put(
        `/${selectedCompany?.slug}/locations/${id}`,
        data,
      );
      return res.data as Location;
    },
    onSuccess: () => {
      refresh();
      toast.success("¡Actualizada!", {
        description: "¡La sede se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar la sede" });
    },
  });

  return { updateLocation };
};

export const useDeleteLocation = () => {
  const { selectedCompany } = useCompanyStore();
  const refresh = useRefreshLocations();

  const deleteLocation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${selectedCompany?.slug}/locations/${id}`);
    },
    onSuccess: () => {
      refresh();
      toast.success("¡Eliminada!", {
        description: "¡La sede ha sido eliminada correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar la sede" });
    },
  });

  return { deleteLocation };
};
