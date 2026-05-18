"use client";

import axiosInstance from "@/lib/axios";
import {
  FUEL_QUERY_KEYS,
  getFuelErrorMessage,
  normalizeFuelMovement,
  normalizeFuelVehicle,
} from "@/lib/fuel";
import {
  AnnulFuelMovementPayload,
  CreateFuelMovementPayload,
  CreateFuelVehiclePayload,
  FuelMovement,
  FuelVehicle,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const invalidateFuelQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: FUEL_QUERY_KEYS.all });
};

export const useCreateFuelVehicle = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFuelVehiclePayload) => {
      const response = await axiosInstance.post<FuelVehicle>(
        `/${company}/fuel/vehicles`,
        data,
      );
      return normalizeFuelVehicle(response.data);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Vehiculo registrado", {
        description: "El vehiculo fue creado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo registrar", {
        description: getFuelErrorMessage(error),
      });
    },
  });
};

export const useUpdateFuelVehicleStatus = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.patch<FuelVehicle>(
        `/${company}/fuel/vehicles/${id}/status`,
      );
      return normalizeFuelVehicle(response.data);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Vehiculo actualizado", {
        description: "El estado del vehiculo fue actualizado.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo actualizar", {
        description: getFuelErrorMessage(error),
      });
    },
  });
};

export const useCreateFuelMovement = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFuelMovementPayload) => {
      const response = await axiosInstance.post<FuelMovement>(
        `/${company}/fuel/movements`,
        data,
      );
      return normalizeFuelMovement(response.data);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Movimiento registrado", {
        description: "El movimiento de combustible fue creado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo registrar", {
        description: getFuelErrorMessage(error),
      });
    },
  });
};

export const useAnnulFuelMovement = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: AnnulFuelMovementPayload;
    }) => {
      const response = await axiosInstance.post<FuelMovement>(
        `/${company}/fuel/movements/${id}/annul`,
        data,
      );
      return normalizeFuelMovement(response.data);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Movimiento anulado", {
        description: "El reverso fue registrado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo anular", {
        description: getFuelErrorMessage(error),
      });
    },
  });
};
