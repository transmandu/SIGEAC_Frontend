import axiosInstance from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import type { AirlineAircraft } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AirlineAircraftPayload {
  brand: string;
  model: string;
  serial: string;
  acronym: string;
  owner: string;
  status: AirlineAircraft["status"];
  fabricant_date: string;
  location_id: number;
  manufacturer_id: number | null;
  comments: string | null;
  is_external: boolean;
  inac: boolean;
}

/** Las listas de aeronaves y de siglas dependen de esta flota. */
const useInvalidateAircrafts = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
    queryClient.invalidateQueries({ queryKey: ["aircraft-acronyms"] });
  };
};

export const useCreateAircraft = () => {
  const invalidate = useInvalidateAircrafts();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: AirlineAircraftPayload;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/airline/aircrafts`,
        data,
      );
      return response.data as AirlineAircraft;
    },
    onSuccess: () => {
      invalidate();
      toast.success("¡Creada!", {
        description: "La aeronave se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo crear la aeronave", {
        description: getApiErrorMessage(error, "Inténtelo de nuevo."),
      });
    },
  });

  return { createAircraft: createMutation };
};

export const useUpdateAircraft = () => {
  const invalidate = useInvalidateAircrafts();

  const updateMutation = useMutation({
    mutationFn: async ({
      company,
      acronym,
      data,
    }: {
      company: string;
      /** Matrícula actual: la que identifica a la aeronave en la URL. */
      acronym: string;
      data: AirlineAircraftPayload;
    }) => {
      const response = await axiosInstance.put(
        `/${company}/airline/aircrafts/${acronym}`,
        data,
      );
      return response.data as AirlineAircraft;
    },
    onSuccess: () => {
      invalidate();
      toast.success("¡Actualizada!", {
        description: "La aeronave se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo actualizar la aeronave", {
        description: getApiErrorMessage(error, "Inténtelo de nuevo."),
      });
    },
  });

  return { updateAircraft: updateMutation };
};

export const useDeleteAircraft = () => {
  const invalidate = useInvalidateAircrafts();

  const deleteMutation = useMutation({
    mutationFn: async ({
      company,
      acronym,
    }: {
      company: string;
      acronym: string;
    }) => {
      await axiosInstance.delete(`/${company}/airline/aircrafts/${acronym}`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("¡Eliminada!", {
        description: "La aeronave se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo eliminar la aeronave", {
        description: getApiErrorMessage(error, "Inténtelo de nuevo."),
      });
    },
  });

  return { deleteAircraft: deleteMutation };
};
