import type { Group, MenuContext } from "@/lib/menus/types";
import {
    Boxes,
    ClipboardCopy,
    FileBox,
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
                href: `/${currentCompany?.slug}/almacen/ingresar_inventario`,
                label: "Ingreso de Inventario",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/ingresar_inventario`,
                ),
                icon: Boxes,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/inventario_articulos`,
                label: "Inventario",
                active: pathname.includes(`/${currentCompany?.slug}/almacen/inventario`),
                icon: PackageOpen,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/almacen/inventario_articulos`,
                        label: "Gestión",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/almacen/inventario_articulos`,
                    },
                    {
                        href: `/${currentCompany?.slug}/almacen/por_ubicar`,
                        label: "Por Ubicar",
                        active: pathname === `/${currentCompany?.slug}/almacen/por_ubicar`,
                    },
                ],
            },
            {
                href: "",
                label: "Solicitudes",
                active: pathname.includes(`/${currentCompany?.slug}/almacen/solicitudes`),
                icon: ClipboardCopy,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                        label: "Salida",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                    },
                ],
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
                href: `/${currentCompany?.slug}/almacen/gestion_cantidad_general`,
                label: "Gestión de Cantidades",
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/gestion_cantidad_general`,
                ),
                icon: SquarePen,
                submenus: [],
            },
        ],
    };
}
