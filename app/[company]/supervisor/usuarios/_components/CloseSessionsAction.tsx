"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCloseUserSessions } from "@/hooks/supervisor/useUserSessions";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { UserActivityRow } from "@/types/user-sessions";

/** Cierra todas las sesiones del usuario; la propia cuenta usa «Cerrar sesión». */
export function CloseSessionsAction({ user }: { user: UserActivityRow }) {
  const { selectedCompany } = useCompanyStore();
  const close = useCloseUserSessions(selectedCompany?.slug);
  const [open, setOpen] = useState(false);

  const isOwn = user.sessions.some((session) => session.is_current);
  const disabled = isOwn || user.sessions.length === 0;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => setOpen(true)}
              aria-label="Cerrar sesiones"
            >
              <LogOut className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="px-2 py-1 text-xs">
          {isOwn
            ? "Es su sesión; use «Cerrar sesión»"
            : user.sessions.length === 0
              ? "Sin sesiones abiertas"
              : "Cerrar sesiones"}
        </TooltipContent>
      </Tooltip>

      <ConfirmActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Cerrar sesiones"
        entityName={user.name}
        icon={LogOut}
        confirmLabel="Cerrar sesiones"
        isPending={close.isPending}
        onConfirm={() => close.mutateAsync({ userId: user.id })}
      >
        Se cerrarán las {user.sessions.length}{" "}
        {user.sessions.length === 1 ? "sesión abierta" : "sesiones abiertas"} de
        este usuario. Perderá lo que no haya guardado y tendrá que iniciar
        sesión de nuevo.
      </ConfirmActionDialog>
    </>
  );
}
