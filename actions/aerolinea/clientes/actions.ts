import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

export interface AirlineClientPayload {
  name: string;
  dni: string;
  dni_type: string;
  phone: string;
  email: string;
  address: string;
  pay_credit_days?: number;
}

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: AirlineClientPayload;
    }) => {
      const response = await axiosInstance.post(
        `/${company}/airline/clients`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast("¡Creado!", {
        description: "¡El cliente se ha creado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el registro" });
    },
  });

  return { createClient: createMutation };
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      company,
    }: {
      id: string;
      data: Partial<AirlineClientPayload>;
      company: string;
    }) => {
      await axiosInstance.patch(`/${company}/airline/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast("¡Actualizado!", {
        description: "¡El cliente se ha actualizado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el cliente" });
    },
  });

  return { updateClient: updateMutation };
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, company }: { id: string; company: string }) => {
      await axiosInstance.delete(`/${company}/airline/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("¡Eliminado!", {
        description: "¡El cliente ha sido eliminado correctamente!",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el cliente" });
    },
  });

  return { deleteClient: deleteMutation };
};
