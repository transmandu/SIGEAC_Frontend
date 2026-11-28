import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { LayoutGrid } from "lucide-react";

export function buildDashboardGroup({ pathname, currentCompany }: MenuContext): GroupDef {
    return {
        groupLabel: "",
        menus: [
            {
                href: `/${currentCompany?.slug}/dashboard`,
                label: "Dashboard",
                active: isPathWithin(pathname, `/${currentCompany?.slug}/dashboard`),
                icon: LayoutGrid,
                roles: [],
                submenus: [],
            },
        ],
    };
}
