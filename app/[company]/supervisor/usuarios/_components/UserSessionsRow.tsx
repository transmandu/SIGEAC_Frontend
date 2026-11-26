"use client";

import { X } from "lucide-react";

import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCloseUserSessions } from "@/hooks/supervisor/useUserSessions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { UserActivityRow } from "@/types/user-sessions";
import { Instant } from "./Instant";

/** Sesiones abiertas de un usuario, cada una con su cierre individual. */
export function UserSessionsRow({ user }: { user: UserActivityRow }) {
  const { selectedCompany } = useCompanyStore();
  const close = useCloseUserSessions(selectedCompany?.slug);

  if (user.sessions.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        Sin sesiones abiertas.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/50">
      {user.sessions.map((session) => (
        <li
          key={session.id}
          className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
        >
          <div className="min-w-0">
            <p className="text-slate-700 dark:text-slate-200">
              Última actividad:{" "}
              <span className="tabular-nums">
                <Instant value={session.last_used_at} />
              </span>
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              Iniciada: <Instant value={session.created_at} />
            </p>
          </div>

          {session.is_current ? (
            <TagBadge tone="blue">Esta sesión</TagBadge>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={close.isPending}
                  onClick={() =>
                    close.mutate({ userId: user.id, sessionId: session.id })
                  }
                  aria-label="Cerrar esta sesión"
                >
                  <X className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="px-2 py-1 text-xs">
                Cerrar esta sesión
              </TooltipContent>
            </Tooltip>
          )}
        </li>
      ))}
    </ul>
  );
}
