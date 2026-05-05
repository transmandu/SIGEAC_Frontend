import type { Group, MenuContext } from "@/lib/menus/types";
import { FilePen, OctagonAlert } from "lucide-react";

export function buildQualityControlGroup({
    pathname,
    currentCompany,
}: MenuContext): Group {
    return {
        groupLabel: "Control de Calidad",
        menus: [
            {
                href: `/${currentCompany?.slug}/control_calidad/incoming`,
                label: "Gestión de Incoming",
                active: pathname.includes(`/${currentCompany?.slug}/control_calidad/incoming`),
                icon: FilePen,
                roles: ["JEFE_CONTROL_CALIDAD", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/control_calidad/cuarentena`,
                label: "Gestión de Cuarentena",
                active: pathname.includes(
                    `/${currentCompany?.slug}/control_calidad/cuarentena`,
                ),
                icon: OctagonAlert,
                roles: ["JEFE_CONTROL_CALIDAD", "SUPERUSER"],
                submenus: [],
            },
        ],
    };
}
