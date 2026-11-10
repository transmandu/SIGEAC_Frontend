import { WAREHOUSE_ROLES } from "@/lib/inventory-access";

/**
 * Quién administra cada catálogo de ajustes. Es la misma lista que decide
 * quién ve su pantalla en el menú, y también la que decide quién puede
 * crear una entrada desde un selector (proveedor, unidad…) sin salir del
 * formulario: ofrecer "Crear" a quien no puede entrar a la pantalla del
 * catálogo sería saltarse esa regla.
 */
export const CATALOG_ROLES = {
  units: [
    "JEFE_ALMACEN",
    "ANALISTA_ALMACEN",
    "SUPERUSER",
    "ENGINEERING",
    "ASISTENTE_COMPRAS",
    "JEFE_COMPRAS",
    "ANALISTA_COMPRAS",
    "JEFE_ADMINISTRACION",
    "ANALISTA_ADMINISTRACION",
  ],
  vendors: [
    "JEFE_COMPRAS",
    "ANALISTA_COMPRAS",
    "JEFE_ADMINISTRACION",
    "ANALISTA_ADMINISTRACION",
    "SUPERUSER",
  ],
  retailers: [
    "ASISTENTE_COMPRAS",
    "JEFE_ADMINISTRACION",
    "ANALISTA_ADMINISTRACION",
    "SUPERUSER",
  ],
  conditions: [
    "JEFE_PLANIFICACION",
    "ANALISTA_PLANIFICACION",
    "SUPERUSER",
    "ENGINEERING",
  ],
  /** Los renglones se administran en almacén, con los mismos roles que ese módulo. */
  batches: [...WAREHOUSE_ROLES],
  shippingAgencies: [
    "JEFE_COMPRAS",
    "ANALISTA_COMPRAS",
    "JEFE_ADMINISTRACION",
    "ANALISTA_ADMINISTRACION",
    "ASISTENTE_COMPRAS",
    "SUPERUSER",
  ],
  /** Igual que su pantalla de ajustes (Organización). */
  jobTitles: ["ADMIN", "SUPERUSER"],
} as const;

export type CatalogKey = keyof typeof CATALOG_ROLES;
