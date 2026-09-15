import type { Group, MenuContext } from "@/lib/menus/types";
import {
    ClipboardCopy,
    FileBox,
    Fuel,
    PackageOpen,
    SquarePen,
    Truck,
    Wrench,
} from "lucide-react";

export function buildWarehouseGroup({ pathname, currentCompany }: MenuContext): Group {
    const ALMACEN_ROLES = ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"];

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
                roles: ALMACEN_ROLES,
                submenus: [],
            },
            {
                // Las tres formas en que llega material con respaldo: la compra
                // en camino, la entrega general por verificar y el traslado que
                // manda otra sede. Cada una es un tab de la misma pantalla.
                href: `/${currentCompany?.slug}/almacen/recepcion_articulos`,
                label: "Recepción de Artículos",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/recepcion_articulos`,
                ),
                icon: Truck,
                roles: ALMACEN_ROLES,
                submenus: [],
            },

            {
                href: `/${currentCompany?.slug}/almacen/inventario_articulos/gestion_inventario`,
                label: "Inventario",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/inventario_articulos`,
                ),
                icon: PackageOpen,
                roles: ALMACEN_ROLES,
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
                // Dos flujos bajo un mismo padre: la salida corriente de
                // material (traslados y terceros incluidos) y la salida a
                // taller, que lleva su propio storyline de sucesos hasta que
                // el material reingresa a inventario.
                href: `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                label: "Solicitud de Salida",
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                ),
                icon: ClipboardCopy,
                roles: ALMACEN_ROLES,
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                        label: "Salida de Material",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/almacen/solicitudes/salida`,
                    },
                    {
                        href: `/${currentCompany?.slug}/almacen/solicitudes/salida_taller`,
                        label: "Salida a Taller",
                        active: pathname.includes(
                            `/${currentCompany?.slug}/almacen/solicitudes/salida_taller`,
                        ),
                    },
                ],
            },

            {
                href: `/${currentCompany?.slug}/almacen/caja_herramientas`,
                label: "Cajas de Herramientas",
                roles: ALMACEN_ROLES,
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/caja_herramientas`,
                ),
                icon: Wrench,
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/combustible`,
                label: "Combustible",
                roles: ALMACEN_ROLES,
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/combustible`,
                ),
                icon: Fuel,
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/almacen/gestion_cantidades`,
                label: "Gestión de Cantidades",
                roles: ALMACEN_ROLES,
                active: pathname.includes(
                    `/${currentCompany?.slug}/almacen/gestion_cantidades`,
                ),
                icon: SquarePen,
                submenus: [],
            },
        ],
    };
}
