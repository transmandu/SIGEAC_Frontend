import type { Group, MenuContext } from "@/lib/menus/types";
import {
    ClipboardCopy,
    FileBox,
    Fuel,
    PackageOpen,
    SquarePen,
    Wrench,
} from "lucide-react";

export function buildWarehouseGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Almacen",
        moduleValue: "warehouse",
        menus: [
            {
                href: `/${currentCompany?.slug}/almacen/recepcion_administrativa`,
                label: "Recepción Administrativa",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/recepcion_administrativa`,
                ),
                icon: FileBox,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/inventario_articulos/gestion_inventario`,
                label: "Inventario",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/inventario_articulos`,
                ),
                icon: PackageOpen,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/almacen/inventario_articulos/gestion_inventario`,
                        label: "Gestión",
                        active: pathname.includes(
                            `/${currentCompany?.slug}/almacen/inventario_articulos/gestion_inventario`,
                        ),
                    },
                    {
                        href: `/${currentCompany?.slug}/almacen/inventario_articulos/por_ubicar`,
                        label: "Por Ubicar",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/almacen/inventario_articulos/por_ubicar`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                label: "Solicitudes de Salida",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                ),
                icon: ClipboardCopy,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/caja_herramientas`,
                label: "Cajas de Herramientas",
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/caja_herramientas`,
                ),
                icon: Wrench,
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/combustible`,
                label: "Combustible",
                roles: ["JEFE_ALMACEN", "ANALISTA_ALMACEN", "SUPERUSER"],
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/combustible`,
                ),
                icon: Fuel,
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/gestion_cantidades`,
                label: "Gestión de Cantidades",
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/gestion_cantidades`,
                ),
                icon: SquarePen,
                submenus: [],
            },
        ],
    };
}
