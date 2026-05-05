import type { Group, MenuContext } from "@/lib/menus/types";
import { Blocks, Building2, KeyRound, User2 } from "lucide-react";

export function buildAdminGroup({ pathname }: MenuContext): Group {
    return {
        groupLabel: "Administrador",
        menus: [
            {
                href: "/sistema/modulos",
                label: "Módulos",
                active: pathname.includes("/sistema/modulos"),
                icon: Blocks,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [],
            },
            {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios y Permisos",
                active: pathname.includes("/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["ADMIN", "SUPERUSER"],
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
                href: "/sistema/autorizaciones/",
                label: "Autorizaciones",
                active: pathname.includes("/sistema/autorizaciones"),
                icon: KeyRound,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                    {
                        href: "/sistema/autorizaciones/autorizar",
                        label: "Autorizar Empleados",
                        active: pathname === "/sistema/autorizaciones/autorizar",
                    },
                    {
                        href: "/sistema/autorizaciones/autorizados",
                        label: "Empleados Autorizados",
                        active: pathname === "/sistema/autorizaciones/autorizados",
                    },
                ],
            },
            {
                href: "/sistema/empresas/",
                label: "Empresa",
                active: pathname.includes("/sistema/empresas/"),
                icon: Building2,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                    {
                        href: "/sistema/empresas/empresas",
                        label: "Administrar Empresas",
                        roles: ["SUPERUSER"],
                        active: pathname === "/sistema/empresas/empresas",
                    },
                    {
                        href: "/sistema/empresas/ubicaciones",
                        label: "Administrar Ubicaciones",
                        active: pathname === "/sistema/empresas/ubicaciones",
                    },
                    {
                        href: "/sistema/empresas/empleados",
                        label: "Administrar Empleados",
                        active: pathname === "/sistema/empresas/empleados",
                    },
                    {
                        href: "/sistema/empresas/cargos",
                        label: "Administrar Cargos",
                        active: pathname === "/sistema/empresas/cargos",
                    },
                    {
                        href: "/sistema/empresas/departamentos",
                        label: "Administrar Departamentos",
                        active: pathname === "/sistema/empresas/departamentos",
                    },
                    {
                        href: "/sistema/empresas/almacenes",
                        label: "Administrar Almacenes",
                        active: pathname === "/sistema/empresas/almacenes",
                    },
                ],
            },
        ],
    };
}
