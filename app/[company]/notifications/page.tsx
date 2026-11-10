"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronsDown,
  Inbox,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
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
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { instantToCalendarDay, relativeDayLabel } from "@/lib/date";
import { canClearNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/CompanyStore";

type ReadFilter = "ALL" | "READ" | "UNREAD";

/** Se muestran por tandas: arrancar con pocas mantiene ágil la bandeja aunque haya cientos. */
const PAGE_SIZE = 15;

const NotificationSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3.5">
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
  const timeZone = useCompanyTimezone();
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
  const showList = !isPending && !isError && visible.length > 0;
  const remaining = filteredNotifications.length - visible.length;
  const isFiltered = !!search.trim() || readFilter !== "ALL";

  // La bandeja se lee por días, de lo más reciente a lo más antiguo: cada día
  // lleva su encabezado ("Hoy", "Ayer", la fecha) y las notificaciones de ese
  // día debajo, separadas por una línea.
  const today = instantToCalendarDay(new Date(), timeZone) ?? "";
  const groups = visible.reduce<
    {
      key: string;
      items: { notification: (typeof visible)[number]; index: number }[];
    }[]
  >((acc, notification, index) => {
    const key = instantToCalendarDay(notification.created_at, timeZone) ?? "";
    const last = acc[acc.length - 1];

    if (last && last.key === key) last.items.push({ notification, index });
    else acc.push({ key, items: [{ notification, index }] });

    return acc;
  }, []);

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
        className={cn(
          "md:min-h-0 md:flex-1",
          !showList &&
            "overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/60 dark:bg-slate-900/60",
        )}
        data-tour="notificaciones-list"
      >
        <div className="scrollbar-modern md:h-full md:overflow-y-auto md:pr-1">
          {isPending ? (
            <div className="divide-y divide-border/60">
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
            <div className="space-y-4">
              {groups.map((group) => {
                const label = group.key
                  ? relativeDayLabel(group.key, today)
                  : "Sin fecha";

                return (
                  <PanelSection
                    key={group.key || "sin-fecha"}
                    flush
                    icon={CalendarDays}
                    title={label.charAt(0).toUpperCase() + label.slice(1)}
                    action={
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {group.items.length}{" "}
                        {group.items.length === 1
                          ? "notificación"
                          : "notificaciones"}
                      </span>
                    }
                  >
                    <div className="divide-y divide-border/60 overflow-hidden rounded-b-xl">
                      {group.items.map(({ notification, index }) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          index={index}
                          variant="row"
                        />
                      ))}
                    </div>
                  </PanelSection>
                );
              })}

              {remaining > 0 && (
                <div className="flex justify-center">
                  <ActionTriggerButton
                    onClick={() =>
                      setVisibleCount((count) => count + PAGE_SIZE)
                    }
                  >
                    <ChevronsDown className="mr-2 h-4 w-4" />
                    Mostrar más
                    <span className="ml-1.5 text-muted-foreground tabular-nums">
                      ({remaining})
                    </span>
                  </ActionTriggerButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SettingsListPage>
  );
}
