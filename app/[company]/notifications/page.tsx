"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import BackButton from "@/components/misc/BackButton";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NotificationsToolBar from "./_components/NotificationsToolBar";
import { useCompanyStore } from "@/stores/CompanyStore";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import { useMemo, useState, useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { notificacionesSteps } from "@/components/tour/steps/ajustes/banca/notificaciones";

export default function NotificationsPage() {
  const { selectedCompany } = useCompanyStore();
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<"ALL" | "READ" | "UNREAD">(
    "ALL",
  );
  const { notifications } = useNotifications(selectedCompany?.slug);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      registerTour("notificaciones", "Notificaciones", notificacionesSteps);
    }
    return () => unregisterTour("notificaciones");
  }, [registerTour, unregisterTour, notifications]);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    const q = search.toLowerCase();

    return notifications.filter((n) => {
      const matchesSearch =
        !search.trim() ||
        n.data?.title?.toLowerCase()?.includes(q) ||
        n.data?.message?.toLowerCase()?.includes(q) ||
        n.data?.type?.toLowerCase()?.includes(q) ||
        n.data?.order_number?.toLowerCase()?.includes(q);

      const isRead = !!n.read_at;

      const matchesRead =
        readFilter === "ALL" ||
        (readFilter === "READ" && isRead) ||
        (readFilter === "UNREAD" && !isRead);

      return matchesSearch && matchesRead;
    });
  }, [notifications, search, readFilter]);

  return (
    <ContentLayout title="Notificaciones">
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
        {/* HEADER NAV */}
        <div className="flex items-center gap-3 shrink-0">
          <BackButton iconOnly tooltip="Volver" variant="secondary" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>Notificaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* TITLE SECTION */}
        <div className="flex flex-col gap-2 border-b pb-4 shrink-0">
          <div className="flex flex-col" data-tour="notificaciones-title">
            <h1 className="text-3xl font-semibold tracking-tight">
              Notificaciones
            </h1>

            <p className="text-sm text-muted-foreground">
              Consulta las notificaciones generadas por el sistema y mantente
              informado sobre eventos, aprobaciones y actividades relevantes.
            </p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div
          className="flex items-center justify-between gap-4 px-3 py-2 rounded-xl border bg-slate-200/40 border-slate-200/40 dark:bg-slate-800/70 dark:border-slate-700/60 backdrop-blur-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] shrink-0"
          data-tour="notificaciones-toolbar"
        >
          <NotificationsToolBar
            search={search}
            setSearch={setSearch}
            filter={readFilter}
            setFilter={setReadFilter}
          />

          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {filteredNotifications.length}{" "}
            {filteredNotifications.length === 1
              ? "notificación"
              : "notificaciones"}
          </span>
        </div>

        {/* SCROLL AREA (POINT OF VIEW) */}
        <div
          className="flex-1 min-h-0 rounded-xl border overflow-hidden bg-background"
          data-tour="notificaciones-list"
        >
          {filteredNotifications.length > 0 ? (
            <div className="h-full overflow-y-auto">
              <div className="flex flex-col gap-2 p-1">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                No hay notificaciones disponibles.
              </p>
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
