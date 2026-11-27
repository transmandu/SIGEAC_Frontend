"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Building2,
  CheckCheck,
  HeartHandshake,
  LogOut,
  MapPin,
  MoonStar,
  SunMedium,
} from "lucide-react";
import { toast } from "sonner";

import { useMarkAllNotificationsAsRead } from "@/actions/notifications/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import {
  fetchUserLocations,
  useGetUserLocations,
} from "@/hooks/sistema/usuario/useGetUserLocations";
import { ERROR_REPORT_VISIBLE_TO_NORMAL_USERS } from "@/lib/errorReportModules";
import type { PaletteEntry, PaletteSection } from "@/lib/navigation-palette";
import { notifyError } from "@/lib/notify-error";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Company } from "@/types";

/** Deja que el diálogo de la búsqueda termine de cerrarse antes de abrir otro. */
const DIALOG_HANDOFF_MS = 200;

/**
 * Acciones que no llevan a ninguna pantalla: cambiar de empresa o estación, el
 * tema y la sesión. No dependen del menú ni de ningún módulo, así que están
 * siempre disponibles.
 */
export function useSystemPaletteSections(
  onReportProblem: () => void,
): PaletteSection[] {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const {
    selectedCompany,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
  } = useCompanyStore();
  const { data: locations } = useGetUserLocations(selectedCompany?.slug);
  // La misma consulta que la campana y la pantalla de notificaciones: comparte
  // su caché y no abre otro canal (sin `userId` no se suscribe al websocket).
  const { unreadCount } = useNotifications(selectedCompany?.slug);
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead(
    selectedCompany?.slug ?? "",
  );

  const companies = user?.companies;
  const isSuperUser = user?.roles?.some((role) => role.name === "SUPERUSER");

  return useMemo(() => {
    const switchCompany = async (company: Company) => {
      setSelectedCompany(company);

      try {
        const stations = await fetchUserLocations(company.slug);

        if (stations.length === 1) {
          setSelectedStation(String(stations[0].id));
          router.push(`/${company.slug}/dashboard`);
          return;
        }

        toast.info("Seleccione una estación para continuar.");
      } catch (error) {
        notifyError(error, { action: "cambiar de empresa" });
      }
    };

    const companyEntries: PaletteEntry[] = (companies ?? [])
      .filter((company) => company.id !== selectedCompany?.id)
      .map((company) => ({
        id: `system|company|${company.id}`,
        label: `Cambiar a ${company.name}`,
        context: "Empresa",
        icon: Building2,
        keywords: [
          `Cambiar a ${company.name}`,
          "Empresa",
          "compania",
          "cambiar",
          company.slug,
        ],
        run: () => void switchCompany(company),
      }));

    const stationEntries: PaletteEntry[] = (locations ?? [])
      .filter((location) => String(location.id) !== selectedStation)
      .map((location) => ({
        id: `system|station|${location.id}`,
        label: `Cambiar a la estación ${location.cod_iata}`,
        context: "Estación",
        icon: MapPin,
        keywords: [
          `Cambiar a la estación ${location.cod_iata}`,
          "Estación",
          "sede",
          "cambiar",
          location.name ?? "",
          location.address,
        ],
        run: () => setSelectedStation(String(location.id)),
      }));

    const isDark = resolvedTheme === "dark";

    const sessionEntries: PaletteEntry[] = [
      {
        id: "system|theme",
        label: isDark ? "Activar modo claro" : "Activar modo oscuro",
        context: "Apariencia",
        icon: isDark ? SunMedium : MoonStar,
        keywords: [
          isDark ? "Activar modo claro" : "Activar modo oscuro",
          "Apariencia",
          "tema",
          "oscuro",
          "claro",
          "dark",
          "light",
        ],
        run: () => setTheme(isDark ? "light" : "dark"),
      },
    ];

    // Marcar como leídas es reversible y la pantalla de notificaciones lo hace
    // sin confirmar; eliminar no, así que eso no se ofrece aquí.
    if (selectedCompany?.slug && unreadCount > 0) {
      sessionEntries.push({
        id: "system|notifications-read",
        label: `Marcar ${unreadCount === 1 ? "la notificación" : `las ${unreadCount} notificaciones`} como leída${unreadCount === 1 ? "" : "s"}`,
        context: "Notificaciones",
        icon: CheckCheck,
        keywords: [
          "Marcar notificaciones como leídas",
          "Notificaciones",
          "leer",
          "bandeja",
          "no leidas",
        ],
        run: () => markAllAsRead(),
      });
    }

    if (!isSuperUser && ERROR_REPORT_VISIBLE_TO_NORMAL_USERS) {
      sessionEntries.push({
        id: "system|report",
        label: "Reportar un problema",
        context: "Soporte",
        icon: HeartHandshake,
        keywords: [
          "Reportar un problema",
          "Soporte",
          "error",
          "falla",
          "ayuda",
          "bug",
        ],
        run: () => window.setTimeout(onReportProblem, DIALOG_HANDOFF_MS),
      });
    }

    sessionEntries.push({
      id: "system|logout",
      label: "Cerrar sesión",
      context: "Cuenta",
      icon: LogOut,
      keywords: ["Cerrar sesión", "Cuenta", "salir", "logout", "desconectar"],
      run: () => window.setTimeout(() => void logout(), 0),
    });

    return [
      {
        id: "system-company",
        heading: "Empresa y estación",
        entries: [...companyEntries, ...stationEntries],
      },
      {
        id: "system-session",
        heading: "Sesión y apariencia",
        entries: sessionEntries,
      },
    ];
  }, [
    companies,
    isSuperUser,
    locations,
    logout,
    markAllAsRead,
    onReportProblem,
    resolvedTheme,
    router,
    selectedCompany?.id,
    selectedCompany?.slug,
    selectedStation,
    setSelectedCompany,
    setSelectedStation,
    setTheme,
    unreadCount,
  ]);
}
