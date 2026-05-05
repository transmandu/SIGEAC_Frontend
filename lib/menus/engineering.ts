import type { Group, MenuContext } from "@/lib/menus/types";
import { ClipboardCheck } from "lucide-react";

export function buildEngineeringGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Ingenieria",
        moduleValue: "engineering",
        menus: [
            {
                href: `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
                label: "Confirmar Inventario",
                active: pathname.includes(
                    `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
                ),
                icon: ClipboardCheck,
                roles: ["SUPERUSER", "ENGINEERING"],
                submenus: [],
            },
        ],
    };
}
