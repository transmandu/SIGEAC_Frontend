import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AssignmentChangeType,
  Employee,
  EmploymentEndType,
} from "@/types";
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

interface LifecycleResponse {
  message: string;
  employee: Employee;
}

/**
 * Lo que cambia en cualquier listado cuando un empleado cambia de asignación,
 * egresa o vuelve: las listas de activos e inactivos, su ficha y su historial.
 */
const invalidateEmployee = (
  queryClient: ReturnType<typeof useQueryClient>,
  company: string,
  id: number,
) => {
  queryClient.invalidateQueries({ queryKey: ["employees", company] });
  queryClient.invalidateQueries({ queryKey: ["employees-inactive", company] });
  queryClient.invalidateQueries({ queryKey: ["employee"] });
  queryClient.invalidateQueries({
    queryKey: ["employee-history", company, id],
  });

  // Los pilotos listan datos del empleado (nombre, contacto) y caen con él.
  queryClient.invalidateQueries({ queryKey: ["pilots"] });
};

export interface ChangeAssignmentPayload {
  company: string;
  id: number;
  /** Solo lo que cambia: el backend rechaza una asignación sin cambios. */
  job_title_id?: number;
  department_id?: number;
  location_id?: number;
  change_type: AssignmentChangeType;
  reason?: string;
  effective_date?: string;
}

/** Cambio de cargo, departamento o sede: cierra la asignación vigente y abre otra. */
export const useChangeEmployeeAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, ...body }: ChangeAssignmentPayload) => {
      const { data } = await axiosInstance.post(
        `/${encodeURIComponent(company)}/employees/${id}/assignments`,
        body,
      );

      return data as LifecycleResponse;
    },

    onSuccess: (data, variables) => {
      invalidateEmployee(queryClient, variables.company, variables.id);

      toast.success(data?.message ?? "Asignación actualizada correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "cambiar la asignación del empleado" });
    },
  });
};

export interface TerminateEmployeePayload {
  company: string;
  id: number;
  end_type: EmploymentEndType;
  end_reason?: string;
  end_date?: string;
}

/** Baja: termina el periodo laboral en curso. El historial se conserva. */
export const useTerminateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, ...body }: TerminateEmployeePayload) => {
      const { data } = await axiosInstance.post(
        `/${encodeURIComponent(company)}/employees/${id}/terminate`,
        body,
      );

      return data as LifecycleResponse;
    },

    onSuccess: (data, variables) => {
      invalidateEmployee(queryClient, variables.company, variables.id);

      toast.success(data?.message ?? "Empleado dado de baja correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "dar de baja al empleado" });
    },
  });
};

export interface RehireEmployeePayload {
  company: string;
  id: number;
  job_title_id: number;
  department_id: number;
  location_id: number;
  start_date?: string;
}

/** Recontratación: abre un periodo nuevo con su asignación inicial. */
export const useRehireEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company, id, ...body }: RehireEmployeePayload) => {
      const { data } = await axiosInstance.post(
        `/${encodeURIComponent(company)}/employees/${id}/rehire`,
        body,
      );

      return data as LifecycleResponse;
    },

    onSuccess: (data, variables) => {
      invalidateEmployee(queryClient, variables.company, variables.id);

      toast.success(data?.message ?? "Empleado recontratado correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "recontratar al empleado" });
    },
  });
};

export interface CorrectPeriodPayload {
  company: string;
  id: number;
  periodId: number;
  /** Solo lo que cambia. */
  started_at?: string;
  ended_at?: string;
  end_type?: EmploymentEndType;
  end_reason?: string;
}

/** Corrección (SUPERUSER) de las fechas, tipo y motivo de egreso de un periodo ya registrado. */
export const useCorrectEmploymentPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      id,
      periodId,
      ...body
    }: CorrectPeriodPayload) => {
      const { data } = await axiosInstance.patch(
        `/${encodeURIComponent(company)}/employees/${id}/periods/${periodId}`,
        body,
      );

      return data as LifecycleResponse;
    },

    onSuccess: (data, variables) => {
      invalidateEmployee(queryClient, variables.company, variables.id);

      toast.success(data?.message ?? "Periodo corregido correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "corregir el periodo" });
    },
  });
};

export interface CorrectAssignmentPayload {
  company: string;
  id: number;
  assignmentId: number;
  /** Solo lo que cambia. */
  job_title_id?: number;
  department_id?: number;
  location_id?: number;
  started_at?: string;
  change_type?: AssignmentChangeType;
  reason?: string;
}

/** Corrección (SUPERUSER) de cargo, departamento, sede, fecha y motivo de una asignación del historial. */
export const useCorrectEmployeeAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      company,
      id,
      assignmentId,
      ...body
    }: CorrectAssignmentPayload) => {
      const { data } = await axiosInstance.patch(
        `/${encodeURIComponent(company)}/employees/${id}/assignments/${assignmentId}`,
        body,
      );

      return data as LifecycleResponse;
    },

    onSuccess: (data, variables) => {
      invalidateEmployee(queryClient, variables.company, variables.id);

      toast.success(data?.message ?? "Asignación corregida correctamente");
    },

    onError: (error: any) => {
      notifyError(error, { action: "corregir la asignación" });
    },
  });
};
