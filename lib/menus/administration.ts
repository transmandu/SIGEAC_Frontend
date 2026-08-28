import type { Group, MenuContext } from "@/lib/menus/types";
import { Landmark, Truck } from "lucide-react";

export function buildAdministrationGroup({
    pathname,
    currentCompany,
}: MenuContext): Group {
    return {
        groupLabel: "Administración",
        moduleValue: "administration",
        menus: [
            {
                href: `/${currentCompany?.slug}/administracion/banca/cuentas`,
                label: "Banca",
                active: pathname.includes(
                    `/${currentCompany?.slug}/administracion/banca`,
                ),
                icon: Landmark,
                roles: [
                    "SUPERUSER",
                    "JEFE_ADMINISTRACION",
                    "ANALISTA_ADMINISTRACION",
                    "RRHH_ADMINISTRACION"
                ],
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/administracion/banca/cuentas`,
                        label: "Cuentas Bancarias",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/administracion/banca/cuentas`,
                    },
                    {
                        href: `/${currentCompany?.slug}/administracion/banca/tarjetas`,
                        label: "Tarjetas",
                        active:
                            pathname ===
                            `/${currentCompany?.slug}/administracion/banca/tarjetas`,
                    },
                ],
            },
            {
                href: `/${currentCompany?.slug}/administracion/recepciones`,
                label: "Historial de Recepciones",
                active: pathname.includes(
                    `/${currentCompany?.slug}/administracion/recepciones`,
                ),
                icon: Truck,
                roles: [
                    "SUPERUSER",
                    "JEFE_ADMINISTRACION",
                    "ANALISTA_ADMINISTRACION",
                    "RRHH_ADMINISTRACION"
                ],
                requiresOmac: true,
                submenus: [],
            },
        ],
    };
}
