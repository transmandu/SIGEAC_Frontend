import { useAuth } from "@/contexts/AuthContext";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";

/** Espejo del middleware de las rutas planification-audit-logs. */
export const PLANIFICATION_AUDIT_ROLES = [
  "SUPERUSER",
  "JEFE_CONTROL_CALIDAD",
  "JEFE_MANTENIMIENTO",
];

export const useCanViewPlanificationAudit = (): boolean => {
  const { user } = useAuth();
  const isSuperuser = useIsSuperuser();

  return (
    isSuperuser ||
    (user?.roles ?? []).some((role) =>
      PLANIFICATION_AUDIT_ROLES.includes(role.name),
    )
  );
};
