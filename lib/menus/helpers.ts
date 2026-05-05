import type { Group, Menu, MenuFilterContext } from "@/lib/menus/types";

export function filterMenuGroups(
    groups: Group[],
    { currentCompany, userRoles }: MenuFilterContext,
): Group[] {
    const isValidHref = (href: string): boolean => {
        return (
            href.length > 0 &&
            !href.includes("undefined") &&
            (href.startsWith("/") ||
                href.startsWith("http://") ||
                href.startsWith("https://"))
        );
    };

    const hasRoleAccess = (menuItem: { roles?: string[] }): boolean => {
        return (
            !menuItem.roles ||
            menuItem.roles.length === 0 ||
            menuItem.roles.some((role) => userRoles.includes(role))
        );
    };

    const isModuleActive = (moduleValue?: string): boolean => {
        if (!moduleValue || !currentCompany) return true;
        return currentCompany.modules.some((module) => module.value === moduleValue);
    };

    const hasOmacAccess = (item: { requiresOmac?: boolean }): boolean => {
        if (item.requiresOmac === undefined) return true;
        return item.requiresOmac === currentCompany?.isOmac;
    };

    return groups
        .filter((group) => isModuleActive(group.moduleValue))
        .map((group) => {
            const filteredMenus = group.menus.filter(
                (menu) =>
                    isModuleActive(menu.moduleValue) &&
                    hasRoleAccess(menu) &&
                    hasOmacAccess(menu),
            );

            const mappedMenus = filteredMenus
                .map((menu) => {
                    const submenus = menu.submenus.filter(
                        (sub) =>
                            isModuleActive(sub.moduleValue) &&
                            hasRoleAccess(sub) &&
                            hasOmacAccess(sub) &&
                            isValidHref(sub.href),
                    );

                    const href = isValidHref(menu.href) ? menu.href : submenus[0]?.href;

                    if (!href) {
                        return null;
                    }

                    return {
                        ...menu,
                        href,
                        submenus,
                    };
                })
                .filter((menu): menu is Menu => menu !== null);

            return {
                ...group,
                menus: mappedMenus,
            };
        })
        .filter((group) => group.menus.length > 0);
}
