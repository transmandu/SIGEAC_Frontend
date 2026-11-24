"use client";

import { useMemo } from "react";
import {
  AtSign,
  Building2,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { ComboOption } from "@/components/forms/general/OptionCombobox";
import { useGetDepartments } from "@/hooks/ajustes/departamento/useGetDepartment";
import { useGetEmployeesByCompany } from "@/hooks/ajustes/empleados/useGetEmployees";
import { useGetRoles } from "@/hooks/sistema/usuario/useGetRoles";
import { useGetUsers } from "@/hooks/sistema/usuario/useGetUsers";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Department } from "@/types";

/**
 * A qué puede apuntar una regla de destinatario. Lo comparten dos
 * configuraciones que NO se mezclan —los destinatarios de los correos y quién
 * ve cada alerta crítica—: cada una tiene su pantalla, su API y sus reglas, y
 * solo reutilizan estas piezas para nombrar un destino. `EMAIL` (una dirección
 * libre) solo existe en los correos.
 */
export type RecipientTargetType =
  "ROLE" | "USER" | "EMPLOYEE" | "DEPARTMENT" | "EMAIL";

export const TARGET_TYPES: {
  type: RecipientTargetType;
  label: string;
  icon: LucideIcon;
  hint: string;
}[] = [
  {
    type: "ROLE",
    label: "Rol",
    icon: ShieldCheck,
    hint: "Todos los usuarios activos con ese rol.",
  },
  {
    type: "USER",
    label: "Usuario",
    icon: UserRound,
    hint: "Un usuario del sistema.",
  },
  {
    type: "EMPLOYEE",
    label: "Empleado",
    icon: UsersRound,
    hint: "Un empleado, a través de su usuario o su ficha.",
  },
  {
    type: "DEPARTMENT",
    label: "Departamento",
    icon: Building2,
    hint: "Los empleados activos de ese departamento. Si un subdepartamento también debe incluirse, agréguelo aparte.",
  },
  {
    type: "EMAIL",
    label: "Correo",
    icon: AtSign,
    hint: "Una dirección de correo, de dentro o de fuera de la empresa.",
  },
];

/** Los departamentos llegan como árbol: se aplana, sin repetir. */
const flattenDepartments = (departments: Department[]): Department[] => {
  const seen = new Map<number, Department>();

  const visit = (list: Department[]) => {
    for (const department of list) {
      if (!seen.has(department.id)) seen.set(department.id, department);
      if (department.descendants?.length) visit(department.descendants);
    }
  };

  visit(departments);

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/** Las opciones que se pueden elegir para cada tipo de destino, con su estado de carga. */
export function useRecipientTargetOptions() {
  const { selectedCompany } = useCompanyStore();
  const company = selectedCompany?.slug;
  const companyId = selectedCompany?.id;

  const { data: roles, isPending: loadingRoles } = useGetRoles(
    selectedCompany?.id,
  );
  const { data: users, isPending: loadingUsers } = useGetUsers();
  const { data: employees, isPending: loadingEmployees } =
    useGetEmployeesByCompany(company);
  const { data: departments, isPending: loadingDepartments } =
    useGetDepartments(company);

  const options = useMemo<Record<RecipientTargetType, ComboOption[]>>(
    () => ({
      ROLE: (roles ?? [])
        .filter((role) => role.name !== "SUPERUSER")
        .map((role) => ({ id: role.name, label: role.label || role.name })),
      USER: (users ?? [])
        .filter(
          (user) =>
            user.isActive &&
            // /users solo trae id, nombre y logo de cada compañía: no hay slug.
            user.companies?.some(
              (item) => String(item.id) === String(companyId),
            ),
        )
        .map((user) => ({
          id: String(user.id),
          label: `${user.first_name} ${user.last_name} · ${user.email}`,
        })),
      EMPLOYEE: (employees ?? []).map((employee) => ({
        id: String(employee.id),
        label: `${employee.first_name} ${employee.last_name}${
          employee.email ? ` · ${employee.email}` : ""
        }`,
      })),
      DEPARTMENT: flattenDepartments(departments ?? []).map((department) => ({
        id: String(department.id),
        label: department.name,
      })),
      EMAIL: [],
    }),
    [roles, users, employees, departments, companyId],
  );

  const loading: Record<RecipientTargetType, boolean> = {
    ROLE: loadingRoles,
    USER: loadingUsers,
    EMPLOYEE: loadingEmployees,
    DEPARTMENT: loadingDepartments,
    EMAIL: false,
  };

  return { options, loading };
}
