import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Crear registro de carga
export const useCreateCargoShipment = (company: string) => {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post(`/${company}/cargo-shipments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-external-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-stats-by-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargoNextGuide"] });
      toast.success("Creado", {
        description: "El registro de carga se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: `Ha ocurrido un errror al intentar agregar el registro ${error}.`,
      });
    },
  });

  return { createCargoShipment: createMutation };
};

//Eliminar registro de carga
export const useDeleteCargoShipment = (company: string) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await axiosInstance.delete(`/${company}/cargo-shipments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-external-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-stats-by-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargoNextGuide"] });
      toast.success("Eliminado", {
        description: "Registro eliminado correctamente.",
      });
    },
    onError: () => {
      toast.error("Error", {
        description:
          "Ha ocurrido un problema al intentar eliminar el registro.",
      });
    },
  });
  return { deleteCargoShipment: deleteMutation };
};

// Actualizar registro de carga
export const useUpdateCargoShipment = (company: string) => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      await axiosInstance.put(`/${company}/cargo-shipments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipments-by-external-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-stats-by-aircraft"] });
      queryClient.invalidateQueries({ queryKey: ["cargo-shipment"] });
      queryClient.invalidateQueries({ queryKey: ["cargoNextGuide"] });
      toast.success("Actualizado", {
        description: "El registro fue actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast.error("Error", {
        description: `Ha ocurrido una error al intentar actualizar el registro: ${error}.`,
      });
    },
  });

  return { updateCargoShipment: updateMutation };
};
