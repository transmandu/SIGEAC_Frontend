import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { FilePen, OctagonAlert, Truck } from "lucide-react";

export function buildQualityControlGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  return {
    groupLabel: "Control de Calidad",
    moduleValue: "quality_control",
    menus: [
      {
        href: `/${currentCompany?.slug}/control_calidad/transito_articulos`,
        label: "Tránsito de Artículos",
        requiresTables: ["articles"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/control_calidad/transito_articulos`,
        ),
        icon: Truck,
        roles: ["JEFE_CONTROL_CALIDAD", "INSPECTOR", "SUPERUSER"],
        requiresOmac: true,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/control_calidad/incoming`,
        label: "Gestión de Incoming",
        requiresTables: ["incoming_inspections"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/control_calidad/incoming`,
        ),
        icon: FilePen,
        roles: ["JEFE_CONTROL_CALIDAD", "INSPECTOR", "SUPERUSER"],
        requiresOmac: true,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/control_calidad/cuarentena`,
        label: "Gestión de Cuarentena",
        requiresTables: ["quarantine_articles"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/control_calidad/cuarentena`,
        ),
        icon: OctagonAlert,
        roles: ["JEFE_CONTROL_CALIDAD", "INSPECTOR", "SUPERUSER"],
        requiresOmac: true,
        submenus: [],
      },
    ],
  };
}
