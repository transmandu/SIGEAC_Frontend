import type { Group, MenuContext } from "@/lib/menus/types";
import { Drill } from "lucide-react";

export function buildMaintenanceGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Mantenimiento",
        moduleValue: "maintenance",
        menus: [
            {
                href: `/${currentCompany?.slug}/mantenimiento/servicios`,
                label: "Servicios",
                active: pathname.includes(`/${currentCompany?.slug}/mantenimiento/servicios`),
                icon: Drill,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [],
            },
        ],
    };
}
