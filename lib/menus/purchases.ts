import type { Group, Menu, MenuContext, Submenu } from "@/lib/menus/types";
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

const isActivePath = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

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
}: MenuContext): Group[] {
  const aeronauticoMenus: Menu[] = [
    {
      href: `/${currentCompany?.slug}/compras/requisiciones`,
      label: "Solicitudes de Compra",
      requiresTables: ["requisition_orders", "articles_requisition_orders"],
      active: isActivePath(
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
      active: isActivePath(
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
      label: "Ordenes de Compra",
      requiresTables: ["purchase_orders", "articles_purchase_orders"],
      active: isActivePath(
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
      active: isActivePath(
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
      active: isActivePath(
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
      label: "Destino indeterminado",
      requiresTables: ["articles"],
      active: isActivePath(
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

  const generalMenus: Menu[] = [
    {
      href: `/${currentCompany?.slug}/compras/requisiciones_generales`,
      label: "Requisiciones Generales",
      requiresTables: [
        "requisition_orders",
        "general_article_requisition_orders",
      ],
      active: isActivePath(
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
      active: isActivePath(
        pathname,
        `/${currentCompany?.slug}/compras/cotizaciones_generales`,
      ),
      icon: HandCoins,
      roles: ["ASISTENTE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"],
      submenus: [],
    },
    {
      href: `/${currentCompany?.slug}/compras/ordenes_compra_generales`,
      label: "Ordenes de Compra",
      requiresTables: ["purchase_orders", "general_article_purchase_orders"],
      active: isActivePath(
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
      active: isActivePath(
        pathname,
        `/${currentCompany?.slug}/compras/recepcion_general`,
      ),
      icon: Truck,
      roles: ["ASISTENTE_COMPRAS", "SUPERUSER"],
      submenus: [],
    },
  ];

  const globalPurchaseMenu: Menu = {
    href: `/${currentCompany?.slug}/compras/gestion_costos`,
    label: "Gestión de Costos",
    requiresTables: ["articles", "general_articles"],
    active: isActivePath(
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

  const toSubmenu = (menu: Menu): Submenu => ({
    href: menu.href,
    label: menu.label,
    active: menu.active,
    roles: menu.roles,
    moduleValue: menu.moduleValue,
    requiresOmac: menu.requiresOmac,
    requiresTables: menu.requiresTables,
  });

  const aeronauticoSubmenus = aeronauticoMenus.map(toSubmenu);
  const generalSubmenus = generalMenus.map(toSubmenu);

  const aeronauticoGroupMenu: Menu = {
    href: "",
    label: "Compras Aeronáuticas",
    active: aeronauticoSubmenus.some((submenu) => submenu.active),
    icon: Plane,
    roles: ["SUPERUSER", "JEFE_ADMINISTRACION"],
    submenus: aeronauticoSubmenus,
  };

  const generalGroupMenu: Menu = {
    href: "",
    label: "Compras Generales",
    active: generalSubmenus.some((submenu) => submenu.active),
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
