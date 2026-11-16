/**
 * Quién consulta el inventario y dónde. Hay dos pantallas con el mismo nombre:
 * la del almacén, que opera el stock, y la de consulta de `general`. Cada rol
 * tiene una sola casa; esta es la única fuente de esa regla (menús, guardas de
 * ruta y pantalla la leen de aquí).
 */

/** Roles del módulo de almacén: operan el inventario, no lo consultan. */
export const WAREHOUSE_ROLES = [
  "ANALISTA_ALMACEN",
  "JEFE_ALMACEN",
  "JEFE_MANTENIMIENTO",
  "SUPERUSER",
] as const;

/** Roles que, en la consulta de `general`, ven también el inventario aeronáutico. */
export const AERONAUTICAL_INVENTORY_ROLES = [
  "TESTER",
  "JEFE_COMPRAS",
  "ANALISTA_COMPRAS",
  "JEFE_PLANIFICACION",
  "ANALISTA_PLANIFICACION",
  "JEFE_ADMINISTRACION",
  "RRHH_ADMINISTRACION",
  "ANALISTA_ADMINISTRACION",
  "CONTADOR_ADMINISTRACION",
  "JEFE_CONTROL_CALIDAD",
  "TECNICO_MANTENIMIENTO_AERONAUTICO",
  "ENGINEERING",
] as const;

export const hasAnyRole = (
  userRoles: readonly string[],
  roles: readonly string[],
) => roles.some((role) => userRoles.includes(role));

export const warehouseInventoryHref = (company: string) =>
  `/${company}/almacen/inventario_articulos/gestion_inventario`;

export const generalInventoryHref = (company: string) =>
  `/${company}/general/inventario_articulos`;

const isWithin = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * A dónde mandar a quien llegó a la pantalla de inventario que no le toca, o
 * `null` si está donde debe (o la ruta no es de inventario). Quien opera el
 * almacén va a la del almacén; todos los demás, a la consulta.
 */
export function resolveInventoryRedirect(
  pathname: string,
  company: string,
  userRoles: readonly string[],
): string | null {
  const operatesWarehouse = hasAnyRole(userRoles, WAREHOUSE_ROLES);

  if (
    isWithin(pathname, `/${company}/general/inventario_articulos`) &&
    operatesWarehouse
  ) {
    return warehouseInventoryHref(company);
  }

  if (
    isWithin(pathname, `/${company}/almacen/inventario_articulos`) &&
    !operatesWarehouse
  ) {
    return generalInventoryHref(company);
  }

  return null;
}
