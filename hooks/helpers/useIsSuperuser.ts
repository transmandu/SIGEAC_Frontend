"use client";

import { useAuth } from "@/contexts/AuthContext";

/**
 * SUPERUSER es un rol GLOBAL (company_id null), no uno por compañía: el
 * backend lo resuelve consultando model_has_roles sin el filtro de equipo de
 * Spatie (User::isAdmin) y lo publica como `is_superuser` en el payload del
 * usuario autenticado.
 *
 * Derivarlo acá recorriendo `user.roles` es una SEGUNDA fórmula sobre el mismo
 * hecho, y las dos pueden separarse — cuando eso pasa la UI ofrece una pantalla
 * que la API después rechaza con 403. Este hook es el único lugar del cliente
 * que responde esa pregunta.
 */
export const useIsSuperuser = (): boolean => {
  const { user } = useAuth();

  return user?.is_superuser ?? false;
};
