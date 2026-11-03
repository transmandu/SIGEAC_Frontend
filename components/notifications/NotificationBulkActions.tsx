"use client";

import { useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";

import {
  useClearAllNotifications,
  useClearReadNotifications,
  useMarkAllNotificationsAsRead,
} from "@/actions/notifications/actions";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  company: string;
  unreadCount: number;
  readCount: number;
  /** Los roles de almacén pueden leer y marcar, pero no vaciar la bandeja. */
  canClear: boolean;
}

type Pending = "read" | "all" | null;

/** Mismo fondo y borde que el buscador y los filtros de la barra. */
const toolbarIconButton =
  "flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200/60 bg-white/80 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 max-sm:size-10 dark:border-slate-700/60 dark:bg-slate-900/60";

/**
 * Acciones sobre toda la bandeja, como iconos de la barra de herramientas.
 * Marcar como leídas es reversible y va directo; eliminar no, así que pide
 * confirmación.
 */
export default function NotificationBulkActions({
  company,
  unreadCount,
  readCount,
  canClear,
}: Props) {
  const [pending, setPending] = useState<Pending>(null);

  const markAll = useMarkAllNotificationsAsRead(company);
  const clearRead = useClearReadNotifications(company);
  const clearAll = useClearAllNotifications(company);

  const total = unreadCount + readCount;

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Marcar todas como leídas"
              className={toolbarIconButton}
              onClick={() => markAll.mutate()}
              disabled={unreadCount === 0 || markAll.isPending}
            >
              <CheckCheck className="size-4 text-blue-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-md:hidden">
            Marcar todas como leídas
          </TooltipContent>
        </Tooltip>

        {canClear && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Eliminar notificaciones"
                    className={toolbarIconButton}
                    disabled={total === 0}
                  >
                    <Trash2 className="size-4 text-red-500/80" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-md:hidden">
                Eliminar notificaciones
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={readCount === 0}
                onSelect={() => setPending("read")}
              >
                Eliminar leídas
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onSelect={() => setPending("all")}
              >
                Eliminar todas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TooltipProvider>

      <ConfirmDeleteDialog
        open={pending === "read"}
        onOpenChange={(open) => !open && setPending(null)}
        title="Eliminar leídas"
        entityName={`${readCount} ${readCount === 1 ? "notificación leída" : "notificaciones leídas"}`}
        warning={
          <>
            Se eliminarán solo las que ya leyó; las nuevas se conservan. Esta
            acción es <b>irreversible</b>.
          </>
        }
        isPending={clearRead.isPending}
        onConfirm={() => clearRead.mutateAsync()}
      />

      <ConfirmDeleteDialog
        open={pending === "all"}
        onOpenChange={(open) => !open && setPending(null)}
        title="Eliminar todas las notificaciones"
        entityName={`${total} ${total === 1 ? "notificación" : "notificaciones"}`}
        warning={
          <>
            Se eliminarán también las que aún no ha leído. Esta acción es{" "}
            <b>irreversible</b>.
          </>
        }
        isPending={clearAll.isPending}
        onConfirm={() => clearAll.mutateAsync()}
      />
    </>
  );
}
