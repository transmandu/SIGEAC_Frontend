import type { Company } from "@/types";
import type { LucideIcon } from "lucide-react";

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  roles?: string[];
  excludedRoles?: string[];
  moduleValue?: string | string[];
  requiresOmac?: boolean;
  /**
   * Tablas que deben existir en la base de la compañía. Va por encima de
   * `requiresOmac`: una compañía puede no tener migrado un módulo aunque su
   * tipo lo admita. Con el listado aún sin cargar no se oculta nada.
   */
  requiresTables?: string[];
  allowedCompanySlugs?: string[];
  /** Sinónimos y siglas con los que el buscador global encuentra la entrada. */
  keywords?: string[];
  /**
   * Ruta con la que se compara la URL para marcar la entrada como activa, si
   * no es la de `href` (por ejemplo cuando el enlace lleva la fecha de hoy).
   */
  match?: string;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  roles?: string[];
  excludedRoles?: string[];
  moduleValue?: string | string[];
  submenus: Submenu[];
  requiresOmac?: boolean;
  /**
   * Tablas que deben existir en la base de la compañía. Va por encima de
   * `requiresOmac`: una compañía puede no tener migrado un módulo aunque su
   * tipo lo admita. Con el listado aún sin cargar no se oculta nada.
   */
  requiresTables?: string[];
  allowedCompanySlugs?: string[];
  /** Ver `Submenu.keywords`. */
  keywords?: string[];
  /** Solo acciones rápidas: la pantalla de la que cuelgan en el buscador. */
  parentHref?: string;
  /** Solo acciones rápidas: una vista (pestaña, pantalla sin menú) y no una acción. */
  entryType?: "view";
};

export type Group = {
  groupLabel: string;
  moduleValue?: string | string[];
  requiresOmac?: boolean;
  requiresTables?: string[];
  menus: Menu[];
};

/**
 * Lo que declaran los constructores de cada grupo. `active` de los submenús
 * no se escribe a mano: `resolveActive` lo deriva de la URL, y el de un menú
 * solo se declara cuando su sección es más amplia que sus submenús.
 */
export type SubmenuDef = Omit<Submenu, "active">;

export type MenuDef = Omit<Menu, "active" | "submenus"> & {
  active?: boolean;
  submenus: SubmenuDef[];
};

export type GroupDef = Omit<Group, "menus"> & { menus: MenuDef[] };

export type MenuContext = {
  pathname: string;
  currentCompany: Company | null;
  date: string;
  userRoles: string[];
};

export type MenuFilterContext = {
  currentCompany: Company | null;
  userRoles: string[];
  /** Tablas existentes en la compañía; `null`/`undefined` mientras carga. */
  availableTables?: string[] | null;
};
