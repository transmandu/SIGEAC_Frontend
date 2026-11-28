import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { Package, Users } from "lucide-react";

export function buildOperationGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  return {
    groupLabel: "Operaciones",
    moduleValue: "operation",
    menus: [
      {
        href: `/${currentCompany?.slug}/operaciones/counter`,
        label: "Facilitación",
        requiresTables: ["pax_flights"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/operaciones/counter`,
        ),
        icon: Users,
        roles: [
          "ANALISTA_ADMINISTRACION",
          "JEFE_ADMINISTRACION",
          "SUPERUSER",
          "OPERADOR_CARGA",
          "OPERADOR_COUNTER",
          "DESPACHADOR",
        ],
        requiresOmac: false,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/operaciones/cargo`,
        label: "Carga",
        requiresTables: ["cargo_shipments"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/operaciones/cargo`,
        ),
        icon: Package,
        // Los endpoints de lectura de carga y manifiestos (y el layout de
        // /cargo) solo admiten estos tres; con JEFE_ADMINISTRACION el menú
        // ofrecía una pantalla que lo rechazaba al entrar.
        roles: ["ANALISTA_ADMINISTRACION", "SUPERUSER", "OPERADOR_CARGA"],
        requiresOmac: false,
        submenus: [
          {
            href: `/${currentCompany?.slug}/operaciones/cargo`,
            label: "Guías de Carga",
            roles: ["ANALISTA_ADMINISTRACION", "SUPERUSER", "OPERADOR_CARGA"],
          },
          {
            href: `/${currentCompany?.slug}/operaciones/cargo/manifiestos`,
            label: "Manifiestos",
            requiresTables: ["cargo_manifests"],
            roles: ["ANALISTA_ADMINISTRACION", "SUPERUSER", "OPERADOR_CARGA"],
          },
        ],
      },
    ],
  };
}
