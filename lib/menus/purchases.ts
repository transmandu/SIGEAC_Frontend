import { isPathWithin } from "@/lib/menus/helpers";
import type {
  GroupDef,
  MenuContext,
  MenuDef,
  SubmenuDef,
} from "@/lib/menus/types";
import {
  ClipboardList,
  HandCoins,
  Receipt,
  Truck,
  CircleDollarSign,
  HelpCircle,
  Plane,
  Boxes,
  ShieldAlert,
} from "lucide-react";

/**
 * SUPERUSER y JEFE_ADMINISTRACION son los únicos roles con acceso a ambos
 * mundos (aeronáutico y general) simultáneamente, por lo que para ellos las
 * opciones duplicadas (Solicitudes/Requisiciones, Cotizaciones, etc.) se
 * agrupan visualmente bajo dos items expandibles: "Compras Aeronáuticas" y
 * "Compras Generales". El resto de los roles solo ve un lado, así que
 * agrupar no aporta nada y se les muestra el menú plano de siempre.
 */
export function buildPurchasesGroups({
  pathname,
  currentCompany,
  userRoles,
}: MenuContext): GroupDef[] {
  const aeronauticoMenus: MenuDef[] = [
    {
      href: `/${currentCompany?.slug}/compras/requisiciones`,
      label: "Solicitudes de Compra",
      requiresTables: ["requisition_orders", "articles_requisition_orders"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/requisiciones`,
      ),
      icon: ClipboardList,
      roles: [
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "SUPERUSER",
        "JEFE_ADMINISTRACION",
      ],
      requiresOmac: true,
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/cotizaciones`,
      label: "Cotizaciones",
      requiresTables: ["quote_orders", "articles_quote_orders"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/cotizaciones`,
      ),
      icon: HandCoins,
      roles: [
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "SUPERUSER",
        "JEFE_ADMINISTRACION",
      ],
      requiresOmac: true,
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/ordenes_compra`,
      label: "Órdenes de Compra",
      requiresTables: ["purchase_orders", "articles_purchase_orders"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/ordenes_compra`,
      ),
      icon: Receipt,
      roles: [
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "SUPERUSER",
        "JEFE_ADMINISTRACION",
      ],
      requiresOmac: true,
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/en_transito`,
      label: "Art. en Tránsito",
      requiresTables: ["articles", "article_transit_updates"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/en_transito`,
      ),
      icon: Truck,
      roles: [
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "SUPERUSER",
        "JEFE_ADMINISTRACION",
      ],
      requiresOmac: true,
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/cuarentena`,
      label: "Cuarentena",
      requiresTables: ["quarantine_articles"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/cuarentena`,
      ),
      icon: ShieldAlert,
      roles: [
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "SUPERUSER",
        "JEFE_ADMINISTRACION",
      ],
      requiresOmac: true,
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/destino_indeterminado`,
      label: "Destino Indeterminado",
      requiresTables: ["articles"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/destino_indeterminado`,
      ),
      icon: HelpCircle,
      roles: [
        "ANALISTA_COMPRAS",
        "JEFE_COMPRAS",
        "SUPERUSER",
        "JEFE_ADMINISTRACION",
      ],
      requiresOmac: true,
      submenus: [],
    },
  ];

  const generalMenus: MenuDef[] = [
    {
      href: `/${currentCompany?.slug}/compras/requisiciones_generales`,
      label: "Requisiciones Generales",
      requiresTables: [
        "requisition_orders",
        "general_article_requisition_orders",
      ],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/requisiciones_generales`,
      ),
      icon: ClipboardList,
      roles: ["ASISTENTE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"],
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/cotizaciones_generales`,
      label: "Cotizaciones",
      requiresTables: ["quote_orders", "general_article_quote_orders"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/cotizaciones_generales`,
      ),
      icon: HandCoins,
      roles: ["ASISTENTE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"],
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/ordenes_compra_generales`,
      label: "Órdenes de Compra",
      requiresTables: ["purchase_orders", "general_article_purchase_orders"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/ordenes_compra_generales`,
      ),
      icon: Receipt,
      roles: ["ASISTENTE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"],
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/recepcion_general`,
      label: "Recepción General",
      requiresTables: ["general_article_intakes"],
      active: isPathWithin(
        pathname,
        `/${currentCompany?.slug}/compras/recepcion_general`,
      ),
      icon: Truck,
      roles: ["ASISTENTE_COMPRAS", "SUPERUSER"],
      submenus: [],
    },
  ];

  const globalPurchaseMenu: MenuDef = {
    href: `/${currentCompany?.slug}/compras/gestion_costos`,
    label: "Gestión de Costos",
    requiresTables: ["articles", "general_articles"],
    active: isPathWithin(
      pathname,
      `/${currentCompany?.slug}/compras/gestion_costos`,
    ),
    icon: CircleDollarSign,
    roles: [
      "ANALISTA_COMPRAS",
      "JEFE_COMPRAS",
      "ASISTENTE_COMPRAS",
      "SUPERUSER",
      "JEFE_ADMINISTRACION",
      "ANALISTA_ADMINISTRACION",
    ],
    submenus: [],
  };

  const hasGroupedView = ["SUPERUSER", "JEFE_ADMINISTRACION"].some((role) =>
    userRoles.includes(role),
  );

  if (!hasGroupedView) {
    return [
      {
        groupLabel: "Compras",
        moduleValue: ["purchases", "administration"],
        menus: [...aeronauticoMenus, ...generalMenus, globalPurchaseMenu],
      },
    ];
  }

  const toSubmenu = (menu: MenuDef): SubmenuDef => ({
    href: menu.href,
    label: menu.label,
    roles: menu.roles,
    moduleValue: menu.moduleValue,
    requiresOmac: menu.requiresOmac,
    requiresTables: menu.requiresTables,
  });

  const aeronauticoSubmenus = aeronauticoMenus.map(toSubmenu);
  const generalSubmenus = generalMenus.map(toSubmenu);

  const aeronauticoGroupMenu: MenuDef = {
    href: "",
    label: "Compras Aeronáuticas",
    icon: Plane,
    roles: ["SUPERUSER", "JEFE_ADMINISTRACION"],
    submenus: aeronauticoSubmenus,
  };

  const generalGroupMenu: MenuDef = {
    href: "",
    label: "Compras Generales",
    icon: Boxes,
    roles: ["SUPERUSER", "JEFE_ADMINISTRACION"],
    submenus: generalSubmenus,
  };

  return [
    {
      groupLabel: "Compras",
      moduleValue: ["purchases", "administration"],
      menus: [aeronauticoGroupMenu, generalGroupMenu, globalPurchaseMenu],
    },
  ];
}
