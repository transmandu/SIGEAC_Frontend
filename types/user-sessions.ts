import type { PresenceStatus } from "@/hooks/notifications/useOnlineUsers";

export interface UserSession {
  id: number;
  last_used_at: string | null;
  created_at: string | null;
  is_current: boolean;
}

export interface UserActivity {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  sessions: UserSession[];
}

/** Fila del panel: la actividad del servidor más la presencia en vivo del socket. */
export interface UserActivityRow extends UserActivity {
  presence: PresenceStatus;
}
