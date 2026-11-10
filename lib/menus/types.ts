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
};

export type Group = {
  groupLabel: string;
  moduleValue?: string | string[];
  requiresOmac?: boolean;
  requiresTables?: string[];
  menus: Menu[];
};

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
