"use client";

import axiosInstance from "@/lib/axios";
import {
  FUEL_QUERY_KEYS,
  normalizeFuelMovement,
  normalizeFuelVehicle,
} from "@/lib/fuel";
import {
  AnnulFuelMovementPayload,
  CreateFuelMovementPayload,
  CreateFuelVehiclePayload,
  FuelMovement,
  FuelVehicle,
  UpdateFuelVehiclePayload,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

const invalidateFuelQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.refetchQueries({ queryKey: FUEL_QUERY_KEYS.all });
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
      notifyError(error, { action: "registrar el vehículo" });
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
      notifyError(error, { action: "actualizar el estado del vehículo" });
    },
  });
};

export const useUpdateFuelVehicle = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateFuelVehiclePayload;
    }) => {
      const response = await axiosInstance.put<FuelVehicle>(
        `/${company}/fuel/vehicles/${id}`,
        data,
      );
      return normalizeFuelVehicle(response.data);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Vehiculo actualizado", {
        description: "Los datos del vehiculo fueron actualizados.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el vehículo" });
    },
  });
};

export const useDeleteFuelVehicle = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/${company}/fuel/vehicles/${id}`);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Vehiculo eliminado", {
        description: "El vehiculo y su historial fueron eliminados.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el vehículo" });
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
      notifyError(error, { action: "registrar el movimiento de combustible" });
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
      notifyError(error, { action: "anular el movimiento de combustible" });
    },
  });
};

// Borrado definitivo, no el flujo normal: eso es anular, que deja el reverso
// asentado. Solo SUPERUSER y solo sobre movimientos ya anulados (lo valida el backend).
export const useDeleteFuelMovement = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/${company}/fuel/movements/${id}`);
    },
    onSuccess: () => {
      invalidateFuelQueries(queryClient);
      toast.success("Movimiento eliminado", {
        description: "El movimiento anulado fue eliminado permanentemente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el movimiento de combustible" });
    },
  });
};
