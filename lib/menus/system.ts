import type { Group, MenuContext } from "@/lib/menus/types";
import { Blocks, Building2, HeartHandshake, Landmark, User2, Users } from "lucide-react";

const BANKING_ROLES = [
    "SUPERUSER",
    "JEFE_COMPRAS",
    "ANALISTA_COMPRAS",
    "ASISTENTE_COMPRAS",
    "JEFE_ADMINISTRACION",
    "ANALISTA_ADMINISTRACION",
];

/**
 * Administración de master: todo lo que aquí vive se sirve desde endpoints sin
 * middleware `tenant`, así que sigue siendo navegable sin compañía seleccionada.
 * Lo que dependa del tenant va en `buildSettingsGroup`, no aquí.
 */
export function buildSystemGroup({ pathname }: MenuContext): Group {
    return {
        groupLabel: "Sistema",
        menus: [
            {
                href: "/sistema/empresas",
                label: "Empresas",
                active: pathname.includes("/sistema/empresas"),
                icon: Building2,
                roles: ["SUPERUSER"],
                submenus: [],
            },
            {
                href: "/sistema/modulos",
                label: "Módulos",
                active: pathname.includes("/sistema/modulos"),
                icon: Blocks,
                roles: ["SUPERUSER"],
                submenus: [],
            },
            {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios y Permisos",
                active: pathname.includes("/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["SUPERUSER"],
                submenus: [
                    {
                        href: "/sistema/usuarios_permisos/usuarios",
                        label: "Administrar Usuarios",
                        active: pathname === "/sistema/usuarios_permisos/usuarios",
                    },
                    {
                        href: "/sistema/usuarios_permisos/roles",
                        label: "Administrar Roles",
                        active: pathname === "/sistema/usuarios_permisos/roles",
                    },
                ],
            },
            {
                href: "/sistema/banca/bancos",
                label: "Banca",
                active: pathname.includes("/sistema/banca"),
                icon: Landmark,
                // Lectura para roles de compras/administración; la gestión
                // (crear/editar/eliminar) queda restringida a SUPERUSER en la UI y el backend.
                roles: BANKING_ROLES,
                submenus: [
                    {
                        href: "/sistema/banca/bancos",
                        label: "Bancos",
                        active: pathname.startsWith("/sistema/banca/bancos"),
                        roles: BANKING_ROLES,
                    },
                    {
                        href: "/sistema/banca/cuentas",
                        label: "Cuentas",
                        active: pathname.startsWith("/sistema/banca/cuentas"),
                        roles: BANKING_ROLES,
                    },
                    {
                        href: "/sistema/banca/metodos_pago",
                        label: "Métodos de Pago",
                        active: pathname === "/sistema/banca/metodos_pago",
                        roles: BANKING_ROLES,
                    },
                    {
                        href: "/sistema/banca/tarjetas",
                        label: "Tarjetas",
                        active: pathname === "/sistema/banca/tarjetas",
                        roles: BANKING_ROLES,
                    },
                ],
            },
            {
                href: "/sistema/reportes",
                label: "Soporte Técnico",
                active: pathname.includes("/sistema/reportes"),
                icon: HeartHandshake,
                roles: ["SUPERUSER"],
                submenus: [],
            },
            {
                href: "/sistema/terceros",
                label: "Terceros",
                active: pathname.includes("/sistema/terceros"),
                icon: Users,
                roles: [
                    "JEFE_ALMACEN",
                    "ANALISTA_ALMACEN",
                    "JEFE_PLANIFICACION",
                    "ANALISTA_PLANIFICACION",
                    "SUPERUSER",
                ],
                submenus: [],
            },
        ],
    };
}
