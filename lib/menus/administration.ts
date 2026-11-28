import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { Landmark, Truck, Receipt } from "lucide-react";

export function buildAdministrationGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  return {
    groupLabel: "Administración",
    moduleValue: "administration",
    menus: [
      {
        href: `/${currentCompany?.slug}/administracion/banca/cuentas`,
        label: "Banca",
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/administracion/banca`,
        ),
        icon: Landmark,
        roles: [
          "SUPERUSER",
          "JEFE_ADMINISTRACION",
          "ANALISTA_ADMINISTRACION",
          "RRHH_ADMINISTRACION",
        ],
        submenus: [
          {
            href: `/${currentCompany?.slug}/administracion/banca/cuentas`,
            label: "Cuentas Bancarias",
          },
          {
            href: `/${currentCompany?.slug}/administracion/banca/tarjetas`,
            label: "Tarjetas",
          },
        ],
      },
      {
        href: `/${currentCompany?.slug}/administracion/recepciones`,
        label: "Historial de Recepciones",
        requiresTables: ["articles"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/administracion/recepciones`,
        ),
        icon: Truck,
        roles: [
          "SUPERUSER",
          "JEFE_ADMINISTRACION",
          "ANALISTA_ADMINISTRACION",
          "RRHH_ADMINISTRACION",
        ],
        requiresOmac: true,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/administracion/facturacion-carga`,
        label: "Facturación de Carga",
        requiresTables: ["cargo_charges"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/administracion/facturacion-carga`,
        ),
        icon: Receipt,
        roles: ["SUPERUSER", "JEFE_ADMINISTRACION", "ANALISTA_ADMINISTRACION"],
        allowedCompanySlugs: ["transmandu"],
        submenus: [],
      },
    ],
  };
}
