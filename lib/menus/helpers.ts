import type { Group, Menu, MenuFilterContext } from "@/lib/menus/types";

export function filterMenuGroups(
  groups: Group[],
  { currentCompany, userRoles, availableTables }: MenuFilterContext,
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

  // Va por encima de `requiresOmac`: las bases no tienen todas las tablas
  // migradas (un módulo puede no haberse corrido en esa compañía) y abrir la
  // pantalla sin su tabla termina en error. Mientras el listado no llega no se
  // oculta nada, para que el menú no parpadee ni quede vacío si el servicio
  // falla.
  const tableSet = availableTables ? new Set(availableTables) : null;
  const hasTables = (item: { requiresTables?: string[] }): boolean => {
    if (!tableSet || !item.requiresTables?.length) return true;
    return item.requiresTables.every((table) => tableSet.has(table));
  };

  // Restringe un ítem a una o más empresas puntuales por slug (ej. una
  // sección que solo aplica a Transmandu). Sin la lista, el ítem es visible
  // para cualquier empresa, igual que con `moduleValue`/`requiresOmac`.
  const hasCompanyAccess = (item: {
    allowedCompanySlugs?: string[];
  }): boolean => {
    if (!item.allowedCompanySlugs || item.allowedCompanySlugs.length === 0) {
      return true;
    }
    return (
      !!currentCompany?.slug &&
      item.allowedCompanySlugs.includes(currentCompany.slug)
    );
  };

  return groups
    .filter(
      (group) => isModuleActive(group.moduleValue) && hasTables(group),
    )
    .map((group) => {
      const filteredMenus = group.menus.filter(
        (menu) =>
          isModuleActive(menu.moduleValue) &&
          hasRoleAccess(menu) &&
          hasOmacAccess(menu) &&
          hasTables(menu) &&
          hasCompanyAccess(menu),
      );

      const mappedMenus = filteredMenus
        .map((menu) => {
          const submenus = menu.submenus.filter(
            (sub) =>
              isModuleActive(sub.moduleValue) &&
              hasRoleAccess(sub) &&
              hasOmacAccess(sub) &&
              hasTables(sub) &&
              hasCompanyAccess(sub) &&
              isValidHref(sub.href),
          );

          // Un contenedor cuyos submenús se fueron por faltarles tablas no
          // debe quedar como enlace suelto a su propia ruta.
          if (
            submenus.length === 0 &&
            menu.submenus.length > 0 &&
            menu.submenus.every((sub) => !hasTables(sub))
          ) {
            return null;
          }

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
