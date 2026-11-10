import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notifyError } from "@/lib/notify-error";

export interface SmsTrainingModulePayload {
  number: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface SmsTrainingModulePatternPayload {
  name: string;
  description?: string;
  is_active?: boolean;
  modules: {
    module_id: number;
    initial_hours: number;
    sort_order?: number;
  }[];
}

export const useCreateSmsTrainingModule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: SmsTrainingModulePayload;
    }) => {
      const response = await axiosInstance.post(
        `/general/${company}/sms-training-modules`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-modules", company],
      });
      toast.success("¡Creado!", {
        description: "El módulo ha sido creado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el módulo" });
    },
  });

  return { createSmsTrainingModule: mutation };
};

export const useUpdateSmsTrainingModule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: number;
      data: SmsTrainingModulePayload;
    }) => {
      const response = await axiosInstance.put(
        `/general/${company}/sms-training-modules/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-modules", company],
      });
      queryClient.invalidateQueries({
        queryKey: ["sms-training-module-patterns", company],
      });
      toast.success("¡Actualizado!", {
        description: "El módulo ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el módulo" });
    },
  });

  return { updateSmsTrainingModule: mutation };
};

export const useDeleteSmsTrainingModule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      await axiosInstance.delete(
        `/general/${company}/sms-training-modules/${id}`,
      );
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-modules", company],
      });
      toast.success("¡Eliminado!", {
        description: "El módulo ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el módulo" });
    },
  });

  return { deleteSmsTrainingModule: mutation };
};

export const useToggleSmsTrainingModuleActive = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      const response = await axiosInstance.patch(
        `/general/${company}/sms-training-modules/${id}/toggle-active`,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-modules", company],
      });
      toast.success("Estado actualizado");
    },
    onError: (error) => {
      notifyError(error, { action: "cambiar el estado del módulo" });
    },
  });

  return { toggleSmsTrainingModuleActive: mutation };
};

export const useCreateSmsTrainingModulePattern = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      data,
    }: {
      company: string;
      data: SmsTrainingModulePatternPayload;
    }) => {
      const response = await axiosInstance.post(
        `/general/${company}/sms-training-module-patterns`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-module-patterns", company],
      });
      toast.success("¡Creado!", {
        description: "El patrón ha sido creado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "crear el patrón" });
    },
  });

  return { createSmsTrainingModulePattern: mutation };
};

export const useUpdateSmsTrainingModulePattern = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      id,
      data,
    }: {
      company: string;
      id: number;
      data: SmsTrainingModulePatternPayload;
    }) => {
      const response = await axiosInstance.put(
        `/general/${company}/sms-training-module-patterns/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-module-patterns", company],
      });
      queryClient.invalidateQueries({
        queryKey: ["sms-training-groups", company],
      });
      toast.success("¡Actualizado!", {
        description: "El patrón ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "actualizar el patrón" });
    },
  });

  return { updateSmsTrainingModulePattern: mutation };
};

export const useDeleteSmsTrainingModulePattern = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      await axiosInstance.delete(
        `/general/${company}/sms-training-module-patterns/${id}`,
      );
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-module-patterns", company],
      });
      toast.success("¡Eliminado!", {
        description: "El patrón ha sido eliminado correctamente.",
      });
    },
    onError: (error) => {
      notifyError(error, { action: "eliminar el patrón" });
    },
  });

  return { deleteSmsTrainingModulePattern: mutation };
};

export const useToggleSmsTrainingModulePatternActive = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ company, id }: { company: string; id: number }) => {
      const response = await axiosInstance.patch(
        `/general/${company}/sms-training-module-patterns/${id}/toggle-active`,
      );
      return response.data;
    },
    onSuccess: (_, { company }) => {
      queryClient.invalidateQueries({
        queryKey: ["sms-training-module-patterns", company],
      });
      toast.success("Estado actualizado");
    },
    onError: (error) => {
      notifyError(error, { action: "cambiar el estado del patrón" });
    },
  });

  return { toggleSmsTrainingModulePatternActive: mutation };
};
