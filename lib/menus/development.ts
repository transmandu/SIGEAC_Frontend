import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { SquarePen } from "lucide-react";

export function buildDevelopmentGroup({
  pathname,
  currentCompany,
  date,
}: MenuContext): GroupDef {
  return {
    groupLabel: "Desarrollo",
    moduleValue: "development",
    menus: [
      {
        href: `/${currentCompany?.slug}/desarrollo`,
        label: "Actividades",
        requiresTables: ["activities"],
        active: isPathWithin(pathname, `/${currentCompany?.slug}/desarrollo`),
        icon: SquarePen,
        roles: ["ANALISTA_DESARROLLO", "JEFE_DESARROLLO", "SUPERUSER"],
        submenus: [
          {
            href: `/${currentCompany?.slug}/desarrollo/actividades_diarias/registro/${date}/`,
            label: "Registro de Actividades",
            // El enlace lleva la fecha de hoy; la sección es toda la carpeta.
            match: `/${currentCompany?.slug}/desarrollo/actividades_diarias/registro`,
          },
          {
            href: `/${currentCompany?.slug}/desarrollo/actividades_diarias`,
            label: "Gestión de Actividades",
          },
        ],
      },
    ],
  };
}
