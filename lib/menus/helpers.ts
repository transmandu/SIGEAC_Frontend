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

  // La exclusión pesa más que la inclusión: un rol excluido no ve la opción
  // aunque califique por otro de sus roles.
  const hasRoleAccess = (menuItem: {
    roles?: string[];
    excludedRoles?: string[];
  }): boolean => {
    if (menuItem.excludedRoles?.some((role) => userRoles.includes(role))) {
      return false;
    }
    return (
      !menuItem.roles ||
      menuItem.roles.length === 0 ||
      menuItem.roles.some((role) => userRoles.includes(role))
    );
  };

  const isModuleActive = (moduleValue?: string | string[]): boolean => {
    if (!moduleValue || !currentCompany) return true;
    // `currentCompany` sale del store persistido en localStorage, así que su
    // forma no está garantizada: basta un payload sin `modules` (algún endpoint
    // que no cargue la relación, o un objeto guardado por un build anterior)
    // para que el `.some()` tumbe todo el render del menú. Degradamos a
    // "visible" en vez de ocultar: un menú vacío deja al usuario sin
    // navegación, que es peor que mostrar una opción de más.
    if (!Array.isArray(currentCompany.modules)) return true;
    const values = Array.isArray(moduleValue) ? moduleValue : [moduleValue];
    return currentCompany.modules.some((module) =>
      values.includes(module.value),
    );
  };

  const hasOmacAccess = (item: { requiresOmac?: boolean }): boolean => {
    if (item.requiresOmac === undefined) return true;
    return item.requiresOmac === currentCompany?.isOMAC;
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
