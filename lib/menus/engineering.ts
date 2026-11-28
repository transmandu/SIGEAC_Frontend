import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { ClipboardCheck } from "lucide-react";

export function buildEngineeringGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  return {
    groupLabel: "Ingeniería",
    moduleValue: "engineering",
    menus: [
      {
        href: `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
        label: "Confirmar Inventario",
        requiresTables: ["articles"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
        ),
        icon: ClipboardCheck,
        roles: ["SUPERUSER", "ENGINEERING", "JEFE_MANTENIMIENTO"],
        requiresOmac: true,
        submenus: [],
      },
    ],
  };
}
