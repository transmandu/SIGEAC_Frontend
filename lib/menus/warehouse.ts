import { WAREHOUSE_ROLES } from "@/lib/inventory-access";
import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import {
  ClipboardCopy,
  FileBox,
  Fuel,
  PackageOpen,
  SquarePen,
  Truck,
  Wrench,
} from "lucide-react";

export function buildWarehouseGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  const ALMACEN_ROLES = [...WAREHOUSE_ROLES];

  return {
    groupLabel: "Almacén",
    moduleValue: "warehouse",
    menus: [
      {
        href: `/${currentCompany?.slug}/almacen/recepcion_administrativa`,
        label: "Recepción Administrativa",
        requiresTables: ["articles"],
        active: isPathWithin(
          pathname,
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
        requiresTables: ["articles"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/almacen/recepcion_articulos`,
        ),
        icon: Truck,
        roles: ALMACEN_ROLES,
        submenus: [],
      },

      {
        href: `/${currentCompany?.slug}/almacen/inventario_articulos/gestion_inventario`,
        label: "Inventario",
        requiresTables: ["articles"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/almacen/inventario_articulos`,
        ),
        icon: PackageOpen,
        roles: ALMACEN_ROLES,
        submenus: [
          {
            href: `/${currentCompany?.slug}/almacen/inventario_articulos/gestion_inventario`,
            label: "Gestión",
          },
          {
            href: `/${currentCompany?.slug}/almacen/inventario_articulos/por_ubicar`,
            label: "Por Ubicar",
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
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/almacen/solicitudes/salida`,
        ),
        icon: ClipboardCopy,
        roles: ALMACEN_ROLES,
        submenus: [
          {
            href: `/${currentCompany?.slug}/almacen/solicitudes/salida`,
            label: "Salidas",
            requiresTables: ["dispatch_orders"],
          },
          {
            href: `/${currentCompany?.slug}/almacen/solicitudes/salida_taller`,
            label: "Salidas a Taller",
            requiresTables: ["workshop_dispatch_orders"],
          },
        ],
      },

      {
        href: `/${currentCompany?.slug}/almacen/caja_herramientas`,
        label: "Cajas de Herramientas",
        requiresTables: ["tool_boxes"],
        roles: ALMACEN_ROLES,
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/almacen/caja_herramientas`,
        ),
        icon: Wrench,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/almacen/combustible`,
        label: "Combustible",
        requiresTables: ["fuel_movements"],
        roles: ALMACEN_ROLES,
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/almacen/combustible`,
        ),
        icon: Fuel,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/almacen/gestion_cantidades`,
        label: "Gestión de Cantidades",
        requiresTables: ["articles"],
        roles: ALMACEN_ROLES,
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/almacen/gestion_cantidades`,
        ),
        icon: SquarePen,
        submenus: [],
      },
    ],
  };
}
