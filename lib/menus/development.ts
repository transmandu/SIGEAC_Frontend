import type { Group, MenuContext } from "@/lib/menus/types";
import { SquarePen } from "lucide-react";

export function buildDevelopmentGroup({
    pathname,
    currentCompany,
    date,
}: MenuContext): Group {
    return {
        groupLabel: "Desarrollo",
        moduleValue: "development",
        menus: [
            {
                href: `/${currentCompany?.slug}/desarrollo`,
                label: "Actividades",
                active: pathname.includes(`/${currentCompany?.slug}/desarrollo`),
                icon: SquarePen,
                roles: ["ANALISTA_DESARROLLO", "JEFE_DESARROLLO", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/desarrollo/actividades_diarias/registro/${date}/`,
                        label: "Registro de Actividades",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/desarrollo/actividades_diarias/registro/`,
                    },
                    {
                        href: `/${currentCompany?.slug}/desarrollo/actividades_diarias`,
                        label: "Gestion de Actividades",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/desarrollo/actividades_diarias/`,
                    },
                ],
            },
        ],
    };
}
