import type { Company } from "@/types";
import type { LucideIcon } from "lucide-react";

export type Submenu = {
    href: string;
    label: string;
    active: boolean;
    roles?: string[];
    moduleValue?: string;
    requiresOmac?: boolean;
    requiresNonOmac?: boolean;
};

export type Menu = {
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon;
    roles: string[];
    moduleValue?: string;
    submenus: Submenu[];
    requiresOmac?: boolean;
    requiresNonOmac?: boolean;
};

export type Group = {
    groupLabel: string;
    moduleValue?: string;
    requiresOmac?: boolean;
    requiresNonOmac?: boolean;
    menus: Menu[];
};

export type MenuContext = {
    pathname: string;
    currentCompany: Company | null;
    date: string;
};

export type MenuFilterContext = {
    currentCompany: Company | null;
    userRoles: string[];
};
