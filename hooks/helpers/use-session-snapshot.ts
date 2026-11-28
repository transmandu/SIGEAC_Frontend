"use client";

import { useEffect, useMemo } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useStoreHydrated } from "@/hooks/helpers/use-store";
import { useGetAvailableTables } from "@/hooks/sistema/useGetAvailableTables";
import {
  readSessionSnapshot,
  writeSessionSnapshot,
  type SessionSnapshot,
} from "@/lib/session-snapshot";
import { useCompanyStore } from "@/stores/CompanyStore";

/**
 * Lo guardado la última vez, o null hasta que el cliente hidrató: leer
 * localStorage antes haría que el primer render difiera del HTML del servidor.
 */
export function useSessionSnapshot(): SessionSnapshot | null {
  const hydrated = useStoreHydrated(useCompanyStore);

  return useMemo(() => (hydrated ? readSessionSnapshot() : null), [hydrated]);
}

/**
 * Roles del usuario para decidir qué mostrar. Mientras la sesión carga usa los
 * de la última vez; en cuanto llega `/user`, los reales.
 */
export function useSessionRoles(): { roles: string[]; known: boolean } {
  const { user, loading } = useAuth();
  const snapshot = useSessionSnapshot();

  const liveRoles = useMemo(
    () => user?.roles?.map((role) => role.name),
    [user?.roles],
  );

  return useMemo(() => {
    if (liveRoles) return { roles: liveRoles, known: true };
    if (!loading) return { roles: [], known: true };

    return snapshot?.roles
      ? { roles: snapshot.roles, known: true }
      : { roles: [], known: false };
  }, [liveRoles, loading, snapshot]);
}

/**
 * Con roles o tablas a medias, la lista de opciones se filtraría mal: primero
 * solo lo público y luego opciones que aparecen o desaparecen. Se usa lo último
 * guardado mientras llegan las respuestas y, si no hay nada guardado, `ready`
 * queda en false para que quien pinte muestre un marcador. Si el servicio de
 * tablas falla, el filtro no oculta nada (ver `filterMenuGroups`).
 */
export function useMenuInputs(slug: string | undefined): {
  roles: string[];
  tables: string[] | undefined;
  ready: boolean;
} {
  const hydrated = useStoreHydrated(useCompanyStore);
  const { roles, known: rolesKnown } = useSessionRoles();
  const { data: availableTables, isLoading } = useGetAvailableTables(slug);

  // Se lee al cambiar de empresa y no solo al hidratar: las tablas de una
  // empresa guardadas durante la sesión también sirven si su consulta ya se
  // descartó de la caché.
  const cached = useMemo(
    () => (hydrated && slug ? readSessionSnapshot().tables[slug] : undefined),
    [hydrated, slug],
  );

  // Si la consulta falla, se conserva lo último conocido en vez de quitar el
  // filtro y mostrar opciones cuyas tablas pueden no existir.
  const tables = availableTables ?? cached;
  const tablesKnown = !isLoading || !!cached;

  useEffect(() => {
    if (availableTables && slug) {
      writeSessionSnapshot({
        tablesOf: { company: slug, tables: availableTables },
      });
    }
  }, [availableTables, slug]);

  return { roles, tables, ready: hydrated && rolesKnown && tablesKnown };
}
