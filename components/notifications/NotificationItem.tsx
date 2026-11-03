"use client";

import { Notification } from "@/types/notifications/types";
import { cn } from "@/lib/utils";
import { CheckCheck, Check, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createElement,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useMarkNotificationAsRead } from "@/actions/notifications/actions";
import { TagBadge } from "@/components/misc/TagBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  NOTIFICATION_TONE_STYLES,
  notificationIcon,
  notificationTone,
} from "@/lib/notifications";
import DispatchReturnNotificationDialog from "@/components/dialogs/mantenimiento/almacen/DispatchReturnNotificationDialog";

// Tipos que abren un diálogo con el detalle en vez de navegar: su payload no
// trae url a propósito porque el destinatario no puede abrir la pantalla de
// origen (ver DispatchReturnRegisteredNotification en el backend).
// TRAINING_EXPIRING_SOON navega directo a /general/cursos?tab=por-expirar.
const DIALOG_TYPES = ["DISPATCH_RETURN_REGISTERED"];

function formatNotificationDate(date: string) {
  const value = formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  });

  return value.replace(
    /hace alrededor de (\d+) (hora|horas|día|días|mes|meses|año|años)/,
    "hace $1 $2",
  );
}

export default function NotificationItem({
  notification,
  index = 0,
}: {
  notification: Notification;
  /** Posición en la lista: escalona la entrada en móvil. */
  index?: number;
}) {
  const router = useRouter();

  const [isNavigating, startNavigation] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { selectedCompany } = useCompanyStore();

  const { mutate: markAsRead } = useMarkNotificationAsRead(
    selectedCompany?.slug!,
  );

  const isUnread = !notification.read_at;
  const opensDialog = DIALOG_TYPES.includes(notification.data?.type);
  const url = notification.data?.url;
  // Sin destino la fila no es un enlace: no debe parecerlo.
  const isActionable = opensDialog || !!url;

  const tone =
    NOTIFICATION_TONE_STYLES[notificationTone(notification.data?.type)];

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isUnread) {
      markAsRead(notification.id);
    }
  };

  const handleNavigate = () => {
    // Abrir cuenta como leerla, pero solo la primera vez: si ya está leída
    // evitamos un PATCH redundante en cada visita desde la notificación.
    if (isUnread) {
      markAsRead(notification.id);
    }

    if (opensDialog) {
      setDialogOpen(true);
      return;
    }

    if (!url) return;

    // useTransition nos da el pending real de la navegación de App Router,
    // que router.push por sí solo no expone.
    startNavigation(() => {
      router.push(url);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <>
      <div
        aria-busy={isNavigating}
        style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
        className={cn(
          "group relative overflow-hidden rounded-xl border shadow-xs transition-colors",
          "border-slate-200 dark:border-slate-700/60",
          isUnread ? tone.unread : "bg-white dark:bg-slate-900/60",
          isActionable && "hover:border-slate-300 dark:hover:border-slate-600",
          isActionable &&
            "max-md:touch-manipulation max-md:[-webkit-tap-highlight-color:transparent] max-md:transition-[background-color,border-color,scale] max-md:duration-150 max-md:[&:active:not(:has(button:active))]:scale-[0.985]",
          "motion-safe:max-md:animate-card-in",
          // Mientras navega, ignoramos clicks extra: la ruta destino puede tardar
          // y el usuario tiende a insistir sobre una fila que se ve inerte.
          isNavigating && "pointer-events-none",
        )}
      >
        {/* Franja de color: más tenue una vez leída. */}
        <div
          aria-hidden
          className={cn(
            "absolute left-0 top-0 h-full w-1",
            tone.stripe,
            !isUnread && "opacity-30",
          )}
        />

        {/* Barra de carga mientras se resuelve la navegación */}
        {isNavigating && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full overflow-hidden bg-primary/10">
            <div className="h-full w-1/4 animate-indeterminate rounded-full bg-primary/70" />
          </div>
        )}

        {/* El área que abre la notificación. El botón de "marcar como leída" es
            su hermano, no su hijo: un botón dentro de otro elemento interactivo
            no se anuncia bien en lectores de pantalla. */}
        <div
          role={isActionable ? "button" : undefined}
          tabIndex={isActionable ? 0 : undefined}
          onClick={isActionable ? handleNavigate : undefined}
          onKeyDown={isActionable ? handleKeyDown : undefined}
          className={cn(
            "flex items-start gap-3 p-3 pl-4 sm:items-center",
            isActionable &&
              "cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
            // Sitio para el botón de "marcar como leída" cuando va a la vista.
            isUnread && "pr-14 pointer-fine:md:pr-3",
          )}
        >
          {/* ICONO */}
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              isUnread ? tone.icon : "bg-muted text-muted-foreground",
            )}
          >
            {isNavigating ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              createElement(notificationIcon(notification.data?.icon), {
                className: "size-5",
              })
            )}
          </div>

          {/* CONTENIDO */}
          <div className="min-w-0 flex-1 space-y-1">
            <p
              className={cn(
                "line-clamp-2 text-sm leading-snug sm:truncate",
                isUnread
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground",
              )}
            >
              {notification.data.title}
            </p>

            <p className="line-clamp-2 text-xs text-muted-foreground">
              {notification.data.message}
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5 text-[11px] text-muted-foreground">
              <TagBadge
                tone={isUnread ? "blue" : "slate"}
                className="h-5 px-2 text-[11px]"
              >
                {isUnread ? "Nueva" : "Leída"}
              </TagBadge>

              {notification.created_at && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatNotificationDate(notification.created_at)}
                </span>
              )}

              {!isUnread && notification.read_at && (
                <span className="flex items-center gap-1">
                  <CheckCheck className="size-3 text-blue-500" />
                  Leído {formatNotificationDate(notification.read_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MARCAR COMO LEÍDA con ratón: al apuntar la fila aparece sobre un
            degradado con el botón desenfocado (el efecto de siempre). Se decide
            por el tipo de puntero y no por el ancho: una tableta táctil grande
            no tiene hover. */}
        {isUnread && (
          <div className="absolute right-0 top-0 hidden h-full w-20 translate-x-2 scale-95 items-center justify-center overflow-visible opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 focus-within:translate-x-0 focus-within:scale-100 focus-within:opacity-100 pointer-fine:md:flex">
            <div className="pointer-events-none absolute inset-0 rounded-r-xl bg-linear-to-l from-black/30 via-black/10 to-transparent" />

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleMarkAsRead}
                    aria-label="Marcar como leída"
                    className="relative z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-background/70 shadow-xs backdrop-blur-md transition hover:bg-background active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                </TooltipTrigger>

                <TooltipContent side="left" className="z-1001">
                  Marcar como leída
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* MARCAR COMO LEÍDA al tocar (y con ratón en pantallas estrechas): sin
            hover no hay dónde apuntar, así que el botón está siempre a la vista. */}
        {isUnread && (
          <button
            type="button"
            onClick={handleMarkAsRead}
            aria-label="Marcar como leída"
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md border border-border/40 bg-background/70 shadow-xs backdrop-blur-md transition active:scale-90 pointer-fine:md:hidden"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
        )}
      </div>

      {opensDialog &&
        notification.data?.type === "DISPATCH_RETURN_REGISTERED" && (
          <DispatchReturnNotificationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            notification={notification}
          />
        )}
    </>
  );
}
