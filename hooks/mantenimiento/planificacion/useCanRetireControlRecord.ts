"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";

/**
 * Dar de baja saca un registro del cálculo, de las alertas y del calendario
 * —sobre controles y cumplimientos ya certificados—, así que es decisión de
 * jefatura, no de cualquiera que pueda cargar un cumplimiento.
 */
export const CONTROL_RETIREMENT_ROLES = [
  "SUPERUSER",
  "JEFE_MANTENIMIENTO",
  "JEFE_PLANIFICACION",
];

export const useCanRetireControlRecord = (): boolean => {
  const { user } = useAuth();
  const isSuperuser = useIsSuperuser();

  return (
    isSuperuser ||
    (user?.roles ?? []).some((role) =>
      CONTROL_RETIREMENT_ROLES.includes(role.name),
    )
  );
};
