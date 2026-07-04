import type { Group, MenuContext } from "@/lib/menus/types";
import { Globe, Landmark, UserRoundCog, BellRing } from "lucide-react";

export function buildSettingsGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Ajustes",
        menus: [
            {
                href: "/ajustes/globales",
                label: "Globales",
                active: pathname.includes("/ajustes/globales"),
                icon: Globe,
                roles: [
                    "JEFE_ALMACEN",
                    "ANALISTA_ALMACEN",
                    "JEFE_PLANIFICACION",
                    "ANALISTA_PLANIFICACION",
                    "SUPERUSER",
                    "COORDINADOR_SMS",
                    "GERENTE_SMS",
                    "EJECUTIVO_RESPONSABLE",
                    "JEFE_COMPRAS",
                    "ANALISTA_COMPRAS",
                    "ASISTENTE_COMPRAS",
                    "JEFE_ADMINISTRACION",
                    "ANALISTA_ADMINISTRACION",
                    "ENGINEERING",
                ],
                submenus: [
                    {
                        href: "/ajustes/globales/unidades",
                        label: "Unidades",
                        active: pathname === "/ajustes/globales/unidades",
                        roles: [
                            "JEFE_ALMACEN",
                            "ANALISTA_ALMACEN",
                            "SUPERUSER",
                            "ENGINEERING",
                            "ASISTENTE_COMPRAS",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                            "ENGINEERING",
                        ],
                    },
                    {
                        href: "/ajustes/globales/fabricantes",
                        label: "Fabricantes",
                        active: pathname === "/ajustes/globales/fabricantes",
                        roles: [
                            "JEFE_ALMACEN",
                            "ANALISTA_ALMACEN",
                            "JEFE_PLANIFICACION",
                            "ANALISTA_PLANIFICACION",
                            "SUPERUSER",
                            "ENGINEERING",
                        ],
                    },
                    {
                        href: "/ajustes/globales/proveedores",
                        label: "Proveedores",
                        active: pathname === "/ajustes/globales/proveedores",
                        roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION", "SUPERUSER"],
                    },
                    {
                        href: "/ajustes/globales/comercios",
                        label: "Comercios",
                        active: pathname === "/ajustes/globales/comercios",
                        roles: ["ASISTENTE_COMPRAS", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION", "SUPERUSER"],
                    },
                    {
                        href: "/ajustes/globales/clientes",
                        label: "Clientes",
                        active: pathname === "/ajustes/globales/clientes",
                        roles: [
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                            "SUPERUSER",
                        ],
                    },
                    {
                        href: "/ajustes/globales/terceros",
                        label: "Terceros",
                        active: pathname === "/ajustes/terceros/clientes",
                        roles: [
                            "JEFE_ALMACEN",
                            "ANALISTA_ALMACEN",
                            "JEFE_PLANIFICACION",
                            "ANALISTA_PLANIFICACION",
                            "SUPERUSER",
                        ],
                    },
                    {
                        href: "/ajustes/globales/condiciones",
                        label: "Condiciones",
                        active: pathname === "/ajustes/globales/condiciones",
                        roles: [
                            "JEFE_PLANIFICACION",
                            "ANALISTA_PLANIFICACION",
                            "SUPERUSER",
                            "ENGINEERING",
                        ],
                    },
                    {
                        href: "/ajustes/globales/fuentes_informacion",
                        label: "Fuentes de Informacion",
                        active: pathname === "/ajustes/globales/fuentes_informacion",
                        roles: ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER", "COORDINADOR_SMS", "GENRENTE_SMS", "EJECUTIVO_RESPONSABLE"],
                    },
                    {
                        href: "/ajustes/globales/agencias_envio",
                        label: "Agencias de Envío",
                        active: pathname === "/ajustes/globales/agencias_envio",
                        roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION", "ASISTENTE_COMPRAS", "SUPERUSER"],
                    },
                ],
            },
            {
                href: "/ajustes/bancos_cuentas/bancos",
                label: "Banca",
                active: pathname.includes("/ajustes/bancos_cuentas"),
                icon: Landmark,
                // Lectura para roles de compras/administración; la gestión
                // (crear/editar/eliminar) queda restringida a SUPERUSER en la UI y el backend.
                roles: [
                    "SUPERUSER",
                    "JEFE_COMPRAS",
                    "ANALISTA_COMPRAS",
                    "ASISTENTE_COMPRAS",
                    "JEFE_ADMINISTRACION",
                    "ANALISTA_ADMINISTRACION",
                ],
                submenus: [
                    {
                        href: "/ajustes/bancos_cuentas/bancos",
                        label: "Bancos",
                        active: pathname.startsWith("/ajustes/bancos_cuentas/bancos"),
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                        ],
                    },
                    {
                        href: "/ajustes/bancos_cuentas/cuentas",
                        label: "Cuentas",
                        active: pathname.startsWith("/ajustes/bancos_cuentas/cuentas"),
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                        ],
                    },
                    {
                        href: "/ajustes/bancos_cuentas/metodos_pago",
                        label: "Métodos de Pago",
                        active: pathname === "/ajustes/bancos_cuentas/metodos_pago",
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                        ],
                    },
                    {
                        href: "/ajustes/bancos_cuentas/tarjetas",
                        label: "Tarjetas",
                        active: pathname === "/ajustes/bancos_cuentas/tarjetas",
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                        ],
                    },
                ],
            },
            {
                href: "/ajustes/cuenta",
                label: "Cuenta",
                active: pathname.includes("/ajustes/cuenta"),
                icon: UserRoundCog,
                roles: [],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/notifications`,
                label: "Notificaciones",
                active: pathname.includes(`/${currentCompany?.slug}/notifications`),
                icon: BellRing,
                roles: [],
                submenus: [],
            }
        ],
    };
}
