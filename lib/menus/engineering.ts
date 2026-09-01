import type { Group, MenuContext } from "@/lib/menus/types";
import { BookOpen, ClipboardCheck } from "lucide-react";

export function buildEngineeringGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "Ingenieria",
        moduleValue: "engineering",
        menus: [
            {
                href: `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
                label: "Confirmar Inventario",
                active: pathname.includes(
                    `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
                ),
                icon: ClipboardCheck,
                roles: ["SUPERUSER", "ENGINEERING"],
                requiresOmac: true,
                submenus: [],
            },
            {
                href: `/${currentCompany?.slug}/ingenieria/catalogo/manuales`,
                label: "Catálogo de Mtto.",
                active: pathname.includes(`/${currentCompany?.slug}/ingenieria/catalogo`),
                icon: BookOpen,
                roles: ["SUPERUSER", "ENGINEERING"],
                requiresOmac: true,
                submenus: [
                    {
                        href: `/${currentCompany?.slug}/ingenieria/catalogo/manuales`,
                        label: "Manuales",
                        active: pathname.includes(`/${currentCompany?.slug}/ingenieria/catalogo/manuales`),
                    },
                    {
                        href: `/${currentCompany?.slug}/ingenieria/catalogo/servicios`,
                        label: "Servicios y Certificados",
                        active: pathname.includes(`/${currentCompany?.slug}/ingenieria/catalogo/servicios`),
                    },
                ],
            },
        ],
    };
}
