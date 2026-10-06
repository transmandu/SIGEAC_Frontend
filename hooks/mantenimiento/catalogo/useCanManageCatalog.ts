"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * Espejo de `role:SUPERUSER|ENGINEERING` en las rutas de escritura del
 * catálogo (backend). Planificación, Control de Calidad y Mantenimiento solo lo
 * consultan; el backend rechaza igual, esto evita ofrecer lo que va a fallar.
 */
export const CATALOG_MANAGER_ROLES = ["SUPERUSER", "ENGINEERING"];

export const useCanManageCatalog = (): boolean => {
  const { user } = useAuth();

  return (user?.roles ?? []).some((role) =>
    CATALOG_MANAGER_ROLES.includes(role.name),
  );
};
