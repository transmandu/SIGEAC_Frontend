import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import axios from "@/lib/axios";
import { notifyError } from "@/lib/notify-error";
import type { UserActivity } from "@/types/user-sessions";

export const USER_SESSIONS_KEY = "user-sessions";

export const useGetUserSessions = (company?: string) =>
  useQuery<UserActivity[], Error>({
    queryKey: [USER_SESSIONS_KEY, company],
    queryFn: async () => {
      const { data } = await axios.get(`/${company}/supervisor/users`);
      return data.users;
    },
    enabled: !!company,
    // La presencia es en vivo por socket; esto solo refresca última actividad y sesiones.
    refetchInterval: 1000 * 60,
  });

interface CloseSessionsVariables {
  userId: number;
  /** Sin id se cierran todas las sesiones del usuario. */
  sessionId?: number;
}

export const useCloseUserSessions = (company?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, sessionId }: CloseSessionsVariables) => {
      const base = `/${company}/supervisor/users/${userId}/sessions`;
      const { data } = await axios.delete(
        sessionId ? `${base}/${sessionId}` : base,
      );
      return data as { closed: number };
    },
    onSuccess: ({ closed }) => {
      queryClient.invalidateQueries({ queryKey: [USER_SESSIONS_KEY, company] });
      toast.success(
        closed === 1 ? "Sesión cerrada" : `${closed} sesiones cerradas`,
      );
    },
    onError: (error) => {
      notifyError(error, { action: "cerrar la sesión" });
    },
  });
};
