import type { Group, MenuContext } from "@/lib/menus/types";
import {
    ClipboardList,
    HandCoins,
    Receipt,
    Truck,
    CircleDollarSign,
    HelpCircle,
} from "lucide-react";

const isActivePath = (pathname: string, href: string): boolean =>
    pathname === href || pathname.startsWith(`${href}/`);

export function buildPurchasesGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Compras",
        moduleValue: ["purchases", "administration"],
        menus: [
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
                href: `/${currentCompany?.slug}/compras/requisiciones_generales`,
                label: "Requisiones Generales",
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
            {
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
            },
        ],
    };
}
