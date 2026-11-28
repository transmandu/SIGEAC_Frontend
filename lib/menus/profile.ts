import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext, MenuDef } from "@/lib/menus/types";
import { BellRing, HeartHandshake, UserRoundCog } from "lucide-react";
import { ERROR_REPORT_VISIBLE_TO_NORMAL_USERS } from "@/lib/errorReportModules";

/**
 * Lo del usuario, no del sistema ni de la empresa. `Mi cuenta` vive en master y
 * está siempre disponible; `Notificaciones` sí depende del tenant, así que solo
 * se ofrece con una compañía seleccionada.
 */
export function buildProfileGroup({ pathname, currentCompany }: MenuContext): GroupDef {
    const menus: MenuDef[] = [
        {
            href: "/cuenta",
            label: "Mi Cuenta",
            active:
                isPathWithin(pathname, "/cuenta") &&
                !isPathWithin(pathname, "/cuenta/reportes"),
            icon: UserRoundCog,
            roles: [],
            submenus: [],
        },
        {
            href: "/cuenta/reportes",
            label: "Mis Reportes",
            active: isPathWithin(pathname, "/cuenta/reportes"),
            icon: HeartHandshake,
            roles: ERROR_REPORT_VISIBLE_TO_NORMAL_USERS ? undefined : ["SUPERUSER"],
            submenus: [],
        },
    ];

    if (currentCompany) {
        menus.push({
            href: `/${currentCompany.slug}/notifications`,
            label: "Notificaciones",
            active: isPathWithin(pathname, `/${currentCompany.slug}/notifications`),
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
