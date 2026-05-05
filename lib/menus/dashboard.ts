import type { Group, MenuContext } from "@/lib/menus/types";
import { LayoutGrid } from "lucide-react";

export function buildDashboardGroup({ pathname, currentCompany }: MenuContext): Group {
    return {
        groupLabel: "",
        menus: [
            {
                href: `/${currentCompany?.slug}/dashboard`,
                label: "Dashboard",
                active: pathname.includes(`/${currentCompany?.slug}/dashboard`),
                icon: LayoutGrid,
                roles: [],
                submenus: [],
            },
        ],
    };
}
