"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";
import { CATALOG_ROLES, type CatalogKey } from "@/lib/menus/catalog-roles";

/**
 * Si el usuario administra ese catálogo (ver `CATALOG_ROLES`). Los selectores
 * que permiten crear una entrada nueva ofrecen la acción solo con esto.
 *
 * SUPERUSER es absoluto y se resuelve con `useIsSuperuser`, no buscándolo en
 * `user.roles`: es un rol global (sin compañía) y esa lista puede no traerlo.
 */
export const useCanManageCatalog = (catalog: CatalogKey): boolean => {
  const { user } = useAuth();
  const isSuperuser = useIsSuperuser();

  const allowed: readonly string[] = CATALOG_ROLES[catalog];

  return (
    isSuperuser || !!user?.roles?.some((role) => allowed.includes(role.name))
  );
};
