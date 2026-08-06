import type { Group, Menu, MenuContext } from "@/lib/menus/types";
import { BellRing, HeartHandshake, UserRoundCog } from "lucide-react";
import { ERROR_REPORT_VISIBLE_TO_NORMAL_USERS } from "@/lib/errorReportModules";

/**
 * Lo del usuario, no del sistema ni de la empresa. `Mi cuenta` vive en master y
 * está siempre disponible; `Notificaciones` sí depende del tenant, así que solo
 * se ofrece con una compañía seleccionada.
 */
export function buildProfileGroup({ pathname, currentCompany }: MenuContext): Group {
    const menus: Menu[] = [
        {
            href: "/cuenta",
            label: "Mi Cuenta",
            active: pathname === "/cuenta",
            icon: UserRoundCog,
            roles: [],
            submenus: [],
        },
        {
            href: "/cuenta/reportes",
            label: "Mis Reportes",
            active: pathname.startsWith("/cuenta/reportes"),
            icon: HeartHandshake,
            roles: ERROR_REPORT_VISIBLE_TO_NORMAL_USERS ? undefined : ["SUPERUSER"],
            submenus: [],
        },
    ];

    if (currentCompany) {
        menus.push({
            href: `/${currentCompany.slug}/notifications`,
            label: "Notificaciones",
            active: pathname.includes(`/${currentCompany.slug}/notifications`),
            icon: BellRing,
            roles: [],
            submenus: [],
        });
    }

    return {
        groupLabel: "Perfil",
        menus,
    };
}
