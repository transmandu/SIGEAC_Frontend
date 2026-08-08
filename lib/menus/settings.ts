import type { Group, MenuContext } from "@/lib/menus/types";
import { Building2, Globe, KeyRound } from "lucide-react";

/**
 * Ajustes por compañía: todo lo de aquí se sirve bajo middleware `tenant`, así
 * que las rutas viven bajo /[company]/ y el grupo solo se construye con una
 * compañía seleccionada. Lo que viva en master va en `buildSystemGroup`.
 */
export function buildSettingsGroup({ pathname, currentCompany }: MenuContext): Group {
    const slug = currentCompany?.slug;

    return {
        groupLabel: "Ajustes",
        menus: [
            {
                href: `/${slug}/ajustes`,
                label: "Catálogos",
                active: pathname.startsWith(`/${slug}/ajustes`),
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
                        href: `/${slug}/ajustes/unidades`,
                        label: "Unidades",
                        active: pathname === `/${slug}/ajustes/unidades`,
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
                        ],
                    },
                    {
                        href: `/${slug}/ajustes/fabricantes`,
                        label: "Fabricantes",
                        active: pathname === `/${slug}/ajustes/fabricantes`,
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
                        href: `/${slug}/ajustes/proveedores`,
                        label: "Proveedores",
                        active: pathname === `/${slug}/ajustes/proveedores`,
                        roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION", "SUPERUSER"],
                    },
                    {
                        href: `/${slug}/ajustes/comercios`,
                        label: "Comercios",
                        active: pathname === `/${slug}/ajustes/comercios`,
                        roles: ["ASISTENTE_COMPRAS", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION", "SUPERUSER"],
                    },
                    {
                        href: `/${slug}/ajustes/clientes`,
                        label: "Clientes",
                        active: pathname === `/${slug}/ajustes/clientes`,
                        roles: [
                            "JEFE_ADMINISTRACION",
                            "ANALISTA_ADMINISTRACION",
                            "SUPERUSER",
                        ],
                    },
                    {
                        href: `/${slug}/ajustes/terceros`,
                        label: "Terceros",
                        active: pathname === `/${slug}/ajustes/terceros`,
                        roles: [
                            "JEFE_ALMACEN",
                            "ANALISTA_ALMACEN",
                            "JEFE_PLANIFICACION",
                            "ANALISTA_PLANIFICACION",
                            "SUPERUSER",
                        ],
                    },
                    {
                        href: `/${slug}/ajustes/condiciones`,
                        label: "Condiciones",
                        active: pathname === `/${slug}/ajustes/condiciones`,
                        roles: [
                            "JEFE_PLANIFICACION",
                            "ANALISTA_PLANIFICACION",
                            "SUPERUSER",
                            "ENGINEERING",
                        ],
                    },
                    {
                        href: `/${slug}/ajustes/fuentes_informacion`,
                        label: "Fuentes de Informacion",
                        active: pathname === `/${slug}/ajustes/fuentes_informacion`,
                        roles: ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER", "COORDINADOR_SMS", "GENRENTE_SMS", "EJECUTIVO_RESPONSABLE"],
                    },
                    {
                        href: `/${slug}/ajustes/agencias_envio`,
                        label: "Agencias de Envío",
                        active: pathname === `/${slug}/ajustes/agencias_envio`,
                        roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION", "ASISTENTE_COMPRAS", "SUPERUSER"],
                    },
                    {
                        href: `/${slug}/ajustes/pilotos`,
                        label: "Pilotos",
                        active: pathname === `/${slug}/ajustes/pilotos`,
                        roles: ["JEFE_PLANIFICACION", "ANALISTA_PLANIFICACION", "SUPERUSER"],
                    },
                ],
            },
            {
                href: `/${slug}/ajustes/empresa`,
                label: "Organización",
                active: pathname.startsWith(`/${slug}/ajustes/empresa`),
                icon: Building2,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${slug}/ajustes/empresa/ubicaciones`,
                        label: "Administrar Ubicaciones",
                        active: pathname === `/${slug}/ajustes/empresa/ubicaciones`,
                    },
                    {
                        href: `/${slug}/ajustes/empresa/empleados`,
                        label: "Administrar Empleados",
                        active: pathname === `/${slug}/ajustes/empresa/empleados`,
                    },
                    {
                        href: `/${slug}/ajustes/empresa/cargos`,
                        label: "Administrar Cargos",
                        active: pathname === `/${slug}/ajustes/empresa/cargos`,
                    },
                    {
                        href: `/${slug}/ajustes/empresa/departamentos`,
                        label: "Administrar Departamentos",
                        active: pathname === `/${slug}/ajustes/empresa/departamentos`,
                    },
                    {
                        href: `/${slug}/ajustes/empresa/almacenes`,
                        label: "Administrar Almacenes",
                        active: pathname === `/${slug}/ajustes/empresa/almacenes`,
                    },
                ],
            },
            {
                href: `/${slug}/ajustes/autorizaciones`,
                label: "Autorizaciones",
                active: pathname.startsWith(`/${slug}/ajustes/autorizaciones`),
                icon: KeyRound,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${slug}/ajustes/autorizaciones/autorizar`,
                        label: "Autorizar Empleados",
                        active: pathname === `/${slug}/ajustes/autorizaciones/autorizar`,
                    },
                    {
                        href: `/${slug}/ajustes/autorizaciones/autorizados`,
                        label: "Empleados Autorizados",
                        active: pathname === `/${slug}/ajustes/autorizaciones/autorizados`,
                    },
                ],
            },
        ],
    };
}
