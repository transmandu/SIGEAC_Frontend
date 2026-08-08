import axiosInstance from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getMessage = (error: unknown, fallback: string) => {
  const e = error as {
    response?: {
      data?: { message?: string; errors?: Record<string, string[]> };
    };
  };
  const firstValidation = e.response?.data?.errors
    ? Object.values(e.response.data.errors)[0]?.[0]
    : undefined;

  return firstValidation || e.response?.data?.message || fallback;
};

export interface PasswordResetRequest {
  id: number;
  email: string;
  user_id: number | null;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  note: string | null;
  created_at: string;
  resolved_at: string | null;
  resolution: string | null;
  user?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    email: string | null;
  } | null;
  resolved_by?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  } | null;
}

interface PendingSummary {
  count: number;
  user_ids: number[];
  requests: PasswordResetRequest[];
}

/**
 * Ruta pública del login. El backend responde siempre lo mismo exista o no
 * el correo, así que el mensaje de éxito es deliberadamente genérico.
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (data: { email: string; note?: string }) => {
      const response = await axiosInstance.post(
        "/password-reset-requests",
        data
      );
      return response.data;
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getMessage(error, "No se pudo enviar la solicitud..."),
      });
    },
  });
};

/** Resumen de pendientes: alimenta el contador y el parpadeo de las filas. */
export const usePendingPasswordResets = (enabled = true) => {
  return useQuery<PendingSummary>({
    queryKey: ["password-reset-requests", "pending"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/password-reset-requests/pending"
      );
      return response.data;
    },
    enabled,
    refetchInterval: 60_000,
  });
};

export const usePasswordResetRequests = (status?: string) => {
  return useQuery<PasswordResetRequest[]>({
    queryKey: ["password-reset-requests", status ?? "all"],
    queryFn: async () => {
      const response = await axiosInstance.get("/password-reset-requests", {
        params: status ? { status } : undefined,
      });
      return response.data;
    },
  });
};

export const useResolvePasswordReset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      password: string;
      password_confirmation: string;
      resolution?: string;
    }) => {
      const response = await axiosInstance.post(
        `/password-reset-requests/${id}/resolve`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Contraseña restablecida", {
        description: "Comunique la nueva contraseña al usuario.",
      });
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getMessage(error, "No se pudo restablecer la contraseña..."),
      });
    },
  });
};

export const useRejectPasswordReset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, resolution }: { id: number; resolution?: string }) => {
      const response = await axiosInstance.post(
        `/password-reset-requests/${id}/reject`,
        { resolution }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["password-reset-requests"] });
      toast.success("Solicitud descartada");
    },
    onError: (error) => {
      toast.error("Oops!", {
        description: getMessage(error, "No se pudo descartar la solicitud..."),
      });
    },
  });
};
