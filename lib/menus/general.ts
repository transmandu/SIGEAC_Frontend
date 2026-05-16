import type { Group, MenuContext } from "@/lib/menus/types";
import {
    CircleDollarSign,
    ClipboardList,
    PackageSearch,
    Presentation,
    ScrollText,
    ShieldCheck,
    Truck,
} from "lucide-react";

export function buildGeneralGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "General",
        moduleValue: "",
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
                href: `/${currentCompany?.slug}/general/inventario_articulos`,
                label: "Inventario",
                active: pathname.includes(
                    `/${currentCompany?.slug}/general/inventario_articulos`,
                ),
                icon: PackageSearch,
                roles: [
                    "SUPERUSER",
                    "ANALISTA_COMPRAS",
                    "JEFE_COMPRAS",
                    "ANALISTA_PLANIFICACION",
                    "JEFE_PLANIFICACION",
                    "RRHH_ADMINISTRACION",
                    "JEFE_ADMINISTRACION",
                    "CONTADOR_ADMINISTRACION",
                    "TESTER",
                    "ENGINEERING",
                    "TECNICO_MANTENIMIENTO_AERONAUTICO",
                    "JEFE_MANTENIMIENTO",
                ],
                submenus: [],
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
                href: `/${currentCompany?.slug}/general/articulos_en_transito`,
                label: "Art. en transito",
                active: pathname.includes(
                    `/${currentCompany?.slug}/general/articulos_en_transito`,
                ),
                icon: Truck,
                roles: [
                    "SUPERUSER",
                    "JEFE_ALMACEN",
                ],
                submenus: [],
            },            
            {
                href: `/${currentCompany?.slug}/compras/gestion_costos`,
                label: "Gestión de Costos",
                active: pathname.includes(`/${currentCompany?.slug}/compras/gestion_costos`),
                icon: CircleDollarSign,
                roles: [
                    "SUPERUSER",
                    "JEFE_ADMINISTRACION",
                    "ANALISTA_ADMINISTRACION",
                ],
                submenus: [],
            },
        ],
    };
}
