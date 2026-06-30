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
const ROLES_WITH_GROUPED_VIEW = ["SUPERUSER", "JEFE_ADMINISTRACION"];

export function buildPurchasesGroups({ pathname, currentCompany, userRoles }: MenuContext): Group[] {
    const aeronauticoMenus: Menu[] = [
        {
            href: `/${currentCompany?.slug}/compras/requisiciones`,
            label: "Solicitudes de Compra",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/requisiciones`),
            icon: ClipboardList,
            roles: [
                "ANALISTA_COMPRAS",
                "JEFE_COMPRAS",
                "SUPERUSER",
                "JEFE_ADMINISTRACION"
            ],
            requiresOmac: true,
            submenus: [],
        },
        {
            href: `/${currentCompany?.slug}/compras/cotizaciones`,
            label: "Cotizaciones",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/cotizaciones`),
            icon: HandCoins,
            roles: [
                "ANALISTA_COMPRAS",
                "JEFE_COMPRAS",
                "SUPERUSER",
                "JEFE_ADMINISTRACION"
            ],
            requiresOmac: true,
            submenus: [],
        },
        {
            href: `/${currentCompany?.slug}/compras/ordenes_compra`,
            label: "Ordenes de Compra",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/ordenes_compra`),
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
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/en_transito`),
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
            href: `/${currentCompany?.slug}/compras/destino_indeterminado`,
            label: "Destino indeterminado",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/destino_indeterminado`),
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
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/requisiciones_generales`),
            icon: ClipboardList,
            roles: [
                "ASISTENTE_COMPRAS",
                "SUPERUSER",
                "JEFE_ADMINISTRACION",
            ],
            submenus: [],
        },
        {
            href: `/${currentCompany?.slug}/compras/cotizaciones_generales`,
            label: "Cotizaciones",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/cotizaciones_generales`),
            icon: HandCoins,
            roles: [
                "ASISTENTE_COMPRAS",
                "SUPERUSER",
                "JEFE_ADMINISTRACION",
            ],
            submenus: [],
        },
        {
            href: `/${currentCompany?.slug}/compras/ordenes_compra_generales`,
            label: "Ordenes de Compra",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/ordenes_compra_generales`),
            icon: Receipt,
            roles: [
                "ASISTENTE_COMPRAS",
                "SUPERUSER",
                "JEFE_ADMINISTRACION",
            ],
            submenus: [],
        },
        {
            href: `/${currentCompany?.slug}/compras/recepcion_general`,
            label: "Recepción General",
            active: isActivePath(pathname, `/${currentCompany?.slug}/compras/recepcion_general`),
            icon: Truck,
            roles: [
                "ASISTENTE_COMPRAS",
                "ANALISTA_ADMINISTRACION",
                "SUPERUSER",
                "JEFE_ADMINISTRACION",
            ],
            submenus: [],
        },
    ];

    const globalPurchaseMenu: Menu = {
        href: `/${currentCompany?.slug}/compras/gestion_costos`,
        label: "Gestión de Costos",
        active: isActivePath(pathname, `/${currentCompany?.slug}/compras/gestion_costos`),
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

    const hasGroupedView = ROLES_WITH_GROUPED_VIEW.some((role) => userRoles.includes(role));

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
    });

    const aeronauticoSubmenus = aeronauticoMenus.map(toSubmenu);
    const generalSubmenus = generalMenus.map(toSubmenu);

    const aeronauticoGroupMenu: Menu = {
        href: "",
        label: "Compras Aeronáuticas",
        active: aeronauticoSubmenus.some((submenu) => submenu.active),
        icon: Plane,
        roles: ROLES_WITH_GROUPED_VIEW,
        submenus: aeronauticoSubmenus,
    };

    const generalGroupMenu: Menu = {
        href: "",
        label: "Compras Generales",
        active: generalSubmenus.some((submenu) => submenu.active),
        icon: Boxes,
        roles: ROLES_WITH_GROUPED_VIEW,
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
