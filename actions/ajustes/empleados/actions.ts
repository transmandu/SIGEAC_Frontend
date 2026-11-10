import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Employee } from "@/types";
import { notifyError } from "@/lib/notify-error";

export interface CreateEmployeeSchema {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  second_last_name?: string;
  dni: string;
  dni_type: string;
  blood_type?: string;
  gender: "MALE" | "FEMALE";
  job_title_id: string;
  department_id: string;
  location_id: string;
  user_id?: string;
  company: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  start_date?: string;
  profile_photo?: File;
}
export interface UpdateEmployeePayload {
  company: string;
  id: number;
  data: FormData;
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmployeeSchema) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      const { data: response } = await axiosInstance.post(
        `/${data.company}/employees`,
        formData,
      );

      return response;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company],
      });

      toast.success("Empleado creado correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "crear empleado" });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, company, data }: UpdateEmployeePayload) => {
      // Un id o company inválidos armarían una URL que apunta a otro registro
      // (o a otra empresa) en vez de fallar, así que se corta antes de enviar.
      if (typeof id !== "number" || Number.isNaN(id)) {
        throw new Error(`Invalid employee id: ${id}`);
      }

      if (!company || typeof company !== "string") {
        throw new Error(`Invalid company: ${company}`);
      }

      const url = `/${encodeURIComponent(company)}/employees/${id}`;

      const { data: response } = await axiosInstance.post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          _method: "PATCH",
        },
      });

      return response;
    },

    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company],
      });

      queryClient.invalidateQueries({
        queryKey: ["employee", variables.company, variables.id],
      });

      // Los pilotos listan datos del empleado (nombre, contacto) y caen con él.
      queryClient.invalidateQueries({ queryKey: ["pilots"] });

      toast.success(response?.message ?? "Empleado actualizado correctamente");
    },

    onError: (error: any) => {
      console.error("Update Employee Error:", error?.response?.data);

      notifyError(error, { action: "actualizar empleado" });
    },
  });
};

/**
 * Vincula (o desvincula, con `userId` vacío) el usuario de un empleado ya
 * creado. Es el último paso de "crear empleado con usuario": se hace después de
 * crear el empleado, para que un fallo al crear el usuario no deje al empleado
 * sin registrar. No avisa por sí misma: quien la llama ya muestra su resultado.
 */
export const useLinkEmployeeUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      id,
      userId,
    }: {
      company: string;
      id: number;
      userId: string;
    }) => {
      const formData = new FormData();
      formData.append("user_id", userId);

      const { data } = await axiosInstance.post(
        `/${encodeURIComponent(company)}/employees/${id}`,
        formData,
        { params: { _method: "PATCH" } },
      );

      return data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company],
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, company }: { id: number; company: string }) => {
      const { data } = await axiosInstance.delete(
        `/${company}/employees/${id}`,
      );
      return data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company],
      });

      queryClient.invalidateQueries({
        queryKey: ["employees-inactive", variables.company],
      });

      // Los pilotos listan datos del empleado (nombre, contacto) y caen con él.
      queryClient.invalidateQueries({ queryKey: ["pilots"] });

      toast.success("Empleado eliminado correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "eliminar" });
    },
  });
};

interface ToggleEmployeeStatusParams {
  company: string;
  id: number;
}

// Baja lógica: el empleado deja de aparecer en los listados activos pero
// conserva su historial. useReactivateEmployee lo revierte.
export const useDeactivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id }: ToggleEmployeeStatusParams) => {
      const { data } = await axiosInstance.patch(
        `/${company}/employees/${id}/deactivate`,
      );

      return data as { message: string; employee: Employee };
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company],
      });

      queryClient.invalidateQueries({
        queryKey: ["employees-inactive", variables.company],
      });

      // Los pilotos listan datos del empleado (nombre, contacto) y caen con él.
      queryClient.invalidateQueries({ queryKey: ["pilots"] });

      toast.success(data?.message ?? "Empleado desactivado correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "desactivar empleado" });
    },
  });
};

export const useReactivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id }: ToggleEmployeeStatusParams) => {
      const { data } = await axiosInstance.patch(
        `/${company}/employees/${id}/reactivate`,
      );

      return data as { message: string; employee: Employee };
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees", variables.company],
      });

      queryClient.invalidateQueries({
        queryKey: ["employees-inactive", variables.company],
      });

      // Los pilotos listan datos del empleado (nombre, contacto) y caen con él.
      queryClient.invalidateQueries({ queryKey: ["pilots"] });

      toast.success(data?.message ?? "Empleado reactivado correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "reactivar empleado" });
    },
  });
};
