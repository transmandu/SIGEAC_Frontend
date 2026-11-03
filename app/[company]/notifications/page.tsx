"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronsDown,
  Inbox,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";

import { SettingsListPage } from "@/components/layout/SettingsListPage";
import { EmptyState } from "@/components/misc/EmptyState";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import NotificationBulkActions from "@/components/notifications/NotificationBulkActions";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useTourContext } from "@/components/tour/TourProvider";
import { notificacionesSteps } from "@/components/tour/steps/sistema/banca/notificaciones";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useResettingState } from "@/hooks/useResettingState";
import { canClearNotifications } from "@/lib/notifications";
import { useCompanyStore } from "@/stores/CompanyStore";

type ReadFilter = "ALL" | "READ" | "UNREAD";

/** Se muestran por tandas: arrancar con pocas mantiene ágil la bandeja aunque haya cientos. */
const PAGE_SIZE = 15;

const NotificationSkeleton = () => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 pl-4 dark:border-slate-700/60 dark:bg-slate-900/60">
    <Skeleton className="size-10 shrink-0 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

export default function NotificationsPage() {
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("ALL");

  const { notifications, unreadCount, isPending, isError, refetch } =
    useNotifications(selectedCompany?.slug);

  const { registerTour, unregisterTour } = useTourContext();

  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    if (!hasNotifications) return;

    registerTour("notificaciones", "Notificaciones", notificacionesSteps);
    return () => unregisterTour("notificaciones");
  }, [registerTour, unregisterTour, hasNotifications]);

  const filteredNotifications = useMemo(() => {
    const q = search.trim().toLowerCase();

    return notifications.filter((n) => {
      const matchesSearch =
        !q ||
        [
          n.data?.title,
          n.data?.message,
          n.data?.type,
          n.data?.order_number,
          n.data?.request_number,
          n.data?.part_number,
          n.data?.article_number,
        ].some((field) => field?.toLowerCase?.().includes(q));

      const isRead = !!n.read_at;

      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && isRead) ||
        (readFilter === "UNREAD" && !isRead);

      return matchesSearch && matchesRead;
    });
  }, [notifications, search, readFilter]);

  const [visibleCount, setVisibleCount] = useResettingState(PAGE_SIZE, [
    search,
    readFilter,
  ]);

  const visible = filteredNotifications.slice(0, visibleCount);
  const remaining = filteredNotifications.length - visible.length;
  const isFiltered = !!search.trim() || readFilter !== "ALL";

  return (
    <SettingsListPage
      title="Notificaciones"
      heading="Notificaciones"
      description="Consulte las notificaciones generadas por el sistema y manténgase informado sobre eventos, aprobaciones y actividades relevantes."
      tourPrefix="notificaciones"
      toolbarTourId="notificaciones-toolbar"
      fill
      toolbarActions={
        hasNotifications && selectedCompany ? (
          <NotificationBulkActions
            company={selectedCompany.slug}
            unreadCount={unreadCount}
            readCount={notifications.length - unreadCount}
            canClear={canClearNotifications(user?.roles)}
          />
        ) : undefined
      }
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Buscar notificaciones...",
      }}
      filters={
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={readFilter}
            onValueChange={(value) => setReadFilter(value as ReadFilter)}
          >
            <SelectTrigger className="h-8 w-50 max-sm:h-10 max-sm:w-full pl-8 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors focus:ring-1 focus:ring-primary/40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="border-slate-200/60 dark:border-slate-700/60">
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="UNREAD">No leídas</SelectItem>
              <SelectItem value="READ">Leídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      count={{
        value: isPending ? undefined : filteredNotifications.length,
        singular: "notificación",
        plural: "notificaciones",
      }}
    >
      <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white md:min-h-0 md:flex-1 dark:border-slate-700/60 dark:bg-slate-900/60"
        data-tour="notificaciones-list"
      >
        <div className="scrollbar-modern md:h-full md:overflow-y-auto">
          {isPending ? (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <NotificationSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              className="min-h-64 md:h-full"
              icon={TriangleAlert}
              tone="error"
              title="No se pudieron cargar las notificaciones"
              description="Revise su conexión e inténtelo de nuevo."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 h-8 gap-2"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="size-3.5" />
                  Reintentar
                </Button>
              }
            />
          ) : visible.length === 0 ? (
            <EmptyState
              className="min-h-64 md:h-full"
              icon={isFiltered ? SearchX : Inbox}
              title={isFiltered ? "Sin coincidencias" : "Todo está al día"}
              description={
                isFiltered
                  ? "Ninguna notificación coincide con la búsqueda o el filtro."
                  : "No hay notificaciones por mostrar."
              }
            />
          ) : (
            <div className="flex flex-col gap-2 p-2">
              {visible.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                />
              ))}

              {remaining > 0 && (
                <ActionTriggerButton
                  className="mx-auto my-1"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  <ChevronsDown className="mr-2 h-4 w-4" />
                  Mostrar más
                  <span className="ml-1.5 text-muted-foreground tabular-nums">
                    ({remaining})
                  </span>
                </ActionTriggerButton>
              )}
            </div>
          )}
        </div>
      </div>
    </SettingsListPage>
  );
}
