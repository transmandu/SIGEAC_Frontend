import type { Group, MenuContext } from "@/lib/menus/types";
import {
    CircleDollarSign,
    ClipboardList,
    PackageSearch,
    Presentation,
    ShieldCheck,
    Truck,
    BookCheck,
} from "lucide-react";

const INVENTARIO_ARTICULOS_ROLES = [
    "SUPERUSER",
    "ANALISTA_COMPRAS",
    "JEFE_COMPRAS",
    "ANALISTA_PLANIFICACION",
    "JEFE_PLANIFICACION",
    "RRHH_ADMINISTRACION",
    "JEFE_ADMINISTRACION",
    "JEFE_CONTROL_CALIDAD",
    "CONTADOR_ADMINISTRACION",
    "TESTER",
    "ENGINEERING",
    "TECNICO_MANTENIMIENTO_AERONAUTICO",
    "JEFE_MANTENIMIENTO",
];

export function buildGeneralGroup({ pathname, currentCompany, userRoles }: MenuContext): Group {
    const hasInventarioArticulosAccess = INVENTARIO_ARTICULOS_ROLES.some((role) =>
        userRoles.includes(role),
    );
    const inventarioHref = hasInventarioArticulosAccess
        ? `/${currentCompany?.slug}/general/inventario_articulos`
        : `/${currentCompany?.slug}/general/inventario_general`;

    return {
        groupLabel: "General",
        menus: [
            {
                href: `/${currentCompany?.slug}/general/cursos`,
                label: "Cursos",
                roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
                active: pathname === `/${currentCompany?.slug}/general/cursos`,
                icon: Presentation,
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/general/cursos/calendario`,
                        label: "Calendario",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/general/cursos/calendario`,
                    },
                    {
                        href: `/${currentCompany?.slug}/general/cursos`,
                        label: "Cursos",
                        active: pathname === `/${currentCompany?.slug}/general/cursos`,
                    },
                    {
                        href: `/${currentCompany?.slug}/general/cursos/estadisticas`,
                        label: "Estadisticas",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/general/cursos/estadisticas`,
                    },
                    {
                        href: `/${currentCompany?.slug}/sms/certificados`,
                        label: "Certificados",
                        roles: [],
                        active: pathname === `/${currentCompany?.slug}/sms/certificados`,
                    },

                    {
                    href: `/${currentCompany?.slug}/general/cursos/resumen`,
                    label: "Resumen",
                    roles: [],
                    active: pathname === `/${currentCompany?.slug}/general/cursos/resumen`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/general/reporte`,
                label: "SMS",
                active: pathname.includes(`/${currentCompany?.slug}/reporte`),
                icon: ShieldCheck,
                roles: [],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/general/reporte/voluntario`,
                        label: "Reporte Voluntario",
                        roles: [],
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/general/reporte/voluntario`,
                    },
                    {
                        href: `/${currentCompany?.slug}/general/reporte/obligatorio`,
                        label: "Reporte Obligatorio",
                        roles: [],
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/general/reporte/obligatorio`,
                    },
                    {
                        href: `/${currentCompany?.slug}/general/reporte/codigos_qr`,
                        label: "Codigos QR",
                        roles: [],
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/general/reporte/codigos_qr`,
                    },
                ],
            },
            {
                href: inventarioHref,
                label: "Inventario",
                active: pathname.includes(inventarioHref),
                icon: PackageSearch,
                roles: [],
                submenus: [],
                requiresOmac: true,
            },
            {
                href: `/${currentCompany?.slug}/general/requisiciones`,
                label: "Solicitudes de Compra",
                active: pathname.includes(`/${currentCompany?.slug}/general/requisiciones`),
                icon: ClipboardList,
                roles: [
                    "SUPERUSER",
                    "JEFE_ALMACEN",
                    "ANALISTA_ALMACEN",
                    "ANALISTA_DESARROLLO",
                    "JEFE_PLANIFICACION",
                    "ANALISTA_PLANIFICACION",
                    "JEFE_MANTENIMIENTO",
                    "RRHH_ADMINISTRACION",
                    "JEFE_ADMINISTRACION",
                    "CONTADOR_ADMINISTRACION",
                    "TESTER",
                    "ENGINEERING",
                ],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/general/recepcion_articulos`,
                label: "Recepción de Artículos",
                active: pathname.includes(
                    `/${currentCompany?.slug}/general/recepcion_articulos`,
                ),
                icon: Truck,
                roles: [
                    "SUPERUSER",
                    "JEFE_ALMACEN",
                    "ANALISTA_ALMACEN",
                    "JEFE_CONTROL_CALIDAD",
                ],
                submenus: [],
            },            
            {
                href: `/${currentCompany?.slug}/general/biblioteca`,
                label: "Biblioteca Digital",
                active: pathname.includes(`/${currentCompany?.slug}/general/biblioteca`),
                icon: BookCheck,
                roles: [],
                submenus: [],
                requiresOmac: false,
            }
        ],
    };
}
