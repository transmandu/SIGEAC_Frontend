import type { Group, MenuContext } from "@/lib/menus/types";
import { ClipboardList, HandCoins, Receipt, Truck } from "lucide-react";

export function buildPurchasesGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Compras",
        moduleValue: "purchases",
        menus: [
            {
                href: `/${currentCompany?.slug}/compras/requisiciones`,
                label: "Solicitudes de Compra",
                active: pathname.includes(`/${currentCompany?.slug}/compras/requisiciones`),
                icon: ClipboardList,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/compras/cotizaciones`,
                label: "Cotizaciones",
                active: pathname.includes(`/${currentCompany?.slug}/compras/cotizaciones`),
                icon: HandCoins,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/compras/ordenes_compra`,
                label: "Ordenes de Compra",
                active: pathname.includes(
                    `/${currentCompany?.slug}/compras/ordenes_compra`,
                ),
                icon: Receipt,
                roles: [
                    "ANALISTA_COMPRAS",
                    "JEFE_COMPRAS",
                    "SUPERUSER",
                    "JEFE_ADMINISTRACION",
                ],
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/compras/en_transito`,
                label: "Art. en Tránsito",
                active: pathname.includes(`/${currentCompany?.slug}/compras/en_transito`),
                icon: Truck,
                roles: [
                    "ANALISTA_COMPRAS",
                    "JEFE_COMPRAS",
                    "SUPERUSER",
                    "JEFE_ADMINISTRACION",
                ],
                submenus: [],
            },
        ],
    };
}
