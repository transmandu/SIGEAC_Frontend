import type { Group, MenuContext } from "@/lib/menus/types";
import { Package, Users } from "lucide-react";

export function buildOperationGroup({
  pathname,
  currentCompany,
}: MenuContext): Group {
  return {
    groupLabel: "Operaciones",
    moduleValue: "operation",
    menus: [
      {
        href: `/${currentCompany?.slug}/operaciones/counter`,
        label: "Counter",
        requiresTables: ["pax_flights"],
        active: pathname.includes(
          `/${currentCompany?.slug}/operaciones/counter`,
        ),
        icon: Users,
        roles: [
          "ANALISTA_ADMINISTRACION",
          "JEFE_ADMINISTRACION",
          "SUPERUSER",
          "OPERADOR_CARGA",
          "OPERADOR_COUNTER",
        ],
        requiresOmac: false,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/operaciones/cargo`,
        label: "Carga",
        requiresTables: ["cargo_shipments"],
        active: pathname.includes(`/${currentCompany?.slug}/operaciones/cargo`),
        icon: Package,
        roles: [
          "ANALISTA_ADMINISTRACION",
          "JEFE_ADMINISTRACION",
          "SUPERUSER",
          "OPERADOR_CARGA",
        ],
        requiresOmac: false,
        submenus: [
          {
            href: `/${currentCompany?.slug}/operaciones/cargo`,
            label: "Guías de Carga",
            active:
              pathname === `/${currentCompany?.slug}/operaciones/cargo` ||
              (pathname.includes(
                `/${currentCompany?.slug}/operaciones/cargo`,
              ) &&
                !pathname.includes("/manifiestos")),
            roles: [
              "ANALISTA_ADMINISTRACION",
              "JEFE_ADMINISTRACION",
              "SUPERUSER",
              "OPERADOR_CARGA",
            ],
          },
          {
            href: `/${currentCompany?.slug}/operaciones/cargo/manifiestos`,
            label: "Manifiestos",
            requiresTables: ["cargo_manifests"],
            active: pathname.includes(
              `/${currentCompany?.slug}/operaciones/cargo/manifiestos`,
            ),
            roles: [
              "ANALISTA_ADMINISTRACION",
              "JEFE_ADMINISTRACION",
              "SUPERUSER",
              "OPERADOR_CARGA",
            ],
          },
        ],
      },
    ],
  };
}
