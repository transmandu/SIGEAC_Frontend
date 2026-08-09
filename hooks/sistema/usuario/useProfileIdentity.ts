import { useMemo } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import { User } from "@/types";

type UserRole = NonNullable<User["roles"]>[number];

/**
 * Los roles llegan con `company_id`: null identifica al rol global (SUPERUSER)
 * y cualquier otro valor lo ata a una empresa. El perfil sólo debe mostrar lo
 * que aplica al contexto actual, así que el rol de empresa se resuelve contra
 * la empresa seleccionada y no contra la lista completa.
 */
export const useProfileIdentity = () => {
  const { user } = useAuth();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  return useMemo(() => {
    const roles = user?.roles ?? [];

    const globalRoles = roles.filter((role) => role.company_id === null);

    const companyRoles = selectedCompany
      ? roles.filter(
          (role) => Number(role.company_id) === Number(selectedCompany.id)
        )
      : [];

    // Sin empresa activa el SUPERUSER sigue siendo SUPERUSER: su badge no
    // depende del contexto, a diferencia del resto.
    const visibleRoles: UserRole[] = [...globalRoles, ...companyRoles];

    return {
      user,
      selectedCompany,
      globalRoles,
      companyRoles,
      visibleRoles,
      isSuperUser: globalRoles.some((role) => role.name === "SUPERUSER"),
    };
  }, [user, selectedCompany]);
};
