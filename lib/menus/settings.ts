import type { Group, MenuContext } from "@/lib/menus/types";
import { Globe, UserRoundCog } from "lucide-react";

export function buildSettingsGroup({ pathname }: MenuContext): Group {
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
                        ],
                    },
                    {
                        href: "/ajustes/globales/proveedores",
                        label: "Proveedores",
                        active: pathname === "/ajustes/globales/proveedores",
                        roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "SUPERUSER"],
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
                        roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "SUPERUSER"],
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
        ],
    };
}
