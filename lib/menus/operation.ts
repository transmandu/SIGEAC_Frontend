import type { Group, MenuContext } from "@/lib/menus/types";
import { Package } from "lucide-react";

export function buildOperationGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Operaciones",
        moduleValue: "operation",
        menus: [
            {
                href: `/${currentCompany?.slug}/operaciones/cargo`,
                label: "Carga",
                active: pathname.includes(`/${currentCompany?.slug}/operaciones/cargo`),
                icon: Package,
                roles: [
                    "ANALISTA_ADMINISTRACION",
                    "JEFE_ADMINISTRACION",
                    "SUPERUSER",
                    "OPERADOR_CARGA",
                ],
                submenus: [],
            },
        ],
    };
}
