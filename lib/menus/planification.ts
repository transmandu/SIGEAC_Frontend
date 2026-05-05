import type { Group, MenuContext } from "@/lib/menus/types";
import { BookCheck, CalendarFold, Plane, SquarePen } from "lucide-react";

export function buildPlanificationGroup({
    pathname,
    currentCompany,
}: MenuContext): Group {
    return {
        groupLabel: "Planificación",
        moduleValue: "planification",
        menus: [
            {
                href: `/${currentCompany?.slug}/planificacion/calendario`,
                label: "Calendario de Servicios",
                active: pathname.includes(`/${currentCompany?.slug}/planificacion/calendario`),
                icon: CalendarFold,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
                label: "Ordenes de Trabajo",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
                ),
                icon: SquarePen,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/ordenes_trabajo/`,
                        label: "Gestionar Ordenes",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/planificacion/aeronaves`,
                label: "Aeronaves",
                active: pathname.includes(`/${currentCompany?.slug}/planificacion/reportes`),
                icon: Plane,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/aeronaves`,
                        label: "Gestión de Aeronaves",
                        active: pathname === `/${currentCompany?.slug}/planificacion/aeronaves`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/planificacion/aeronaves`,
                label: "Control de Horas Vuelos",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/control_vuelos`,
                ),
                icon: BookCheck,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/control_vuelos/vuelos`,
                        label: "Vuelos",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/planificacion/control_vuelos/vuelos`,
                    },
                ],
            },
        ],
    };
}
