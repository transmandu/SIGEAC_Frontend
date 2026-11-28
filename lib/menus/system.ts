import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { Blocks, Building2, HeartHandshake, Landmark, User2 } from "lucide-react";

/**
 * Administración de master: todo lo que aquí vive se sirve desde endpoints sin
 * middleware `tenant`, así que sigue siendo navegable sin compañía seleccionada.
 * Lo que dependa del tenant va en `buildSettingsGroup`, no aquí.
 */
export function buildSystemGroup({ pathname }: MenuContext): GroupDef {
    return {
        groupLabel: "Sistema",
        menus: [
            {
                href: "/sistema/empresas",
                label: "Empresas",
                active: isPathWithin(pathname, "/sistema/empresas"),
                icon: Building2,
                roles: ["SUPERUSER"],
                submenus: [],
            },
            {
                href: "/sistema/modulos",
                label: "Módulos",
                active: isPathWithin(pathname, "/sistema/modulos"),
                icon: Blocks,
                roles: ["SUPERUSER"],
                submenus: [],
            },
            {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios y Permisos",
                active: isPathWithin(pathname, "/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["SUPERUSER"],
                submenus: [
                    {
                        href: "/sistema/usuarios_permisos/usuarios",
                        label: "Administrar Usuarios",
                    },
                    {
                        href: "/sistema/usuarios_permisos/roles",
                        label: "Administrar Roles",
                    },
                ],
            },
            {
                href: "/sistema/banca/bancos",
                label: "Banca",
                active: isPathWithin(pathname, "/sistema/banca"),
                icon: Landmark,
                // Lectura para roles de compras; la gestión (crear/editar/eliminar)
                // queda restringida a SUPERUSER en la UI y el backend.
                roles: [
                    "SUPERUSER",
                    "JEFE_COMPRAS",
                    "ANALISTA_COMPRAS",
                    "ASISTENTE_COMPRAS",
                ],
                submenus: [
                    {
                        href: "/sistema/banca/bancos",
                        label: "Bancos",
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                        ],
                    },
                    {
                        href: "/sistema/banca/cuentas",
                        label: "Cuentas",
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                        ],
                    },
                    {
                        href: "/sistema/banca/metodos_pago",
                        label: "Métodos de Pago",
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                        ],
                    },
                    {
                        href: "/sistema/banca/tarjetas",
                        label: "Tarjetas",
                        roles: [
                            "SUPERUSER",
                            "JEFE_COMPRAS",
                            "ANALISTA_COMPRAS",
                            "ASISTENTE_COMPRAS",
                        ],
                    },
                ],
            },
            {
                href: "/sistema/reportes",
                label: "Soporte Técnico",
                active: isPathWithin(pathname, "/sistema/reportes"),
                icon: HeartHandshake,
                roles: ["SUPERUSER"],
                submenus: [],
            },
        ],
    };
}
