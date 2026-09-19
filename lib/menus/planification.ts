import type { Group, MenuContext } from "@/lib/menus/types";
import { BookCheck, Cog, Plane, Radio, ShieldAlert, SquarePen, Wrench } from "lucide-react";

export function buildPlanificationGroup({
    pathname,
    currentCompany,
}: MenuContext): Group {
    return {
        groupLabel: "Planificación",
        moduleValue: "planification",
        menus: [
            {
                href: `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
                label: "Ordenes de Trabajo",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
                ),
                icon: SquarePen,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                requiresOmac: true,
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
                requiresOmac: true,
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
                requiresOmac: true,
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
            {
                href: `/${currentCompany?.slug}/planificacion/control_mantenimiento`,
                label: "Control de Mantenimiento",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/control_mantenimiento`,
                ),
                icon: Wrench,
                requiresOmac: true,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/control_mantenimiento`,
                        label: "Gestionar",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/planificacion/control_mantenimiento`,
                    },
                    {
                        href: `/${currentCompany?.slug}/planificacion/control_mantenimiento/historial`,
                        label: "Histórico",
                        active: pathname.includes(
                            `/${currentCompany?.slug}/planificacion/control_mantenimiento/historial`,
                        ),
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/planificacion/control_componentes`,
                label: "Control de Componentes",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/control_componentes`,
                ),
                icon: Cog,
                requiresOmac: true,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/control_componentes`,
                        label: "Gestionar",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/planificacion/control_componentes`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/planificacion/control_avionica`,
                label: "Control de Aviónica",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/control_avionica`,
                ),
                icon: Radio,
                requiresOmac: true,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/control_avionica`,
                        label: "Gestionar",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/planificacion/control_avionica`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/planificacion/control_directivas`,
                label: "Control de Directivas",
                active: pathname.includes(
                    `/${currentCompany?.slug}/planificacion/control_directivas`,
                ),
                icon: ShieldAlert,
                requiresOmac: true,
                roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/planificacion/control_directivas`,
                        label: "Gestionar",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/planificacion/control_directivas`,
                    },
                ],
            },
        ],
    };
}
