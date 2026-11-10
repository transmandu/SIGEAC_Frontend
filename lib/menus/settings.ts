import { CATALOG_ROLES } from "@/lib/menus/catalog-roles";
import type { Group, MenuContext } from "@/lib/menus/types";
import { Building2, Globe, KeyRound } from "lucide-react";

/**
 * Ajustes por compañía: todo lo de aquí se sirve bajo middleware `tenant`, así
 * que las rutas viven bajo /[company]/ y el grupo solo se construye con una
 * compañía seleccionada. Lo que viva en master va en `buildSystemGroup`.
 */
export function buildSettingsGroup({
  pathname,
  currentCompany,
}: MenuContext): Group {
  const slug = currentCompany?.slug;

  return {
    groupLabel: "Ajustes",
    menus: [
      {
        href: `/${slug}/ajustes`,
        label: "Catálogos",
        // Todo ajuste cuelga de /ajustes, pero Organización y Autorizaciones son
        // grupos aparte: sin excluirlos, Catálogos se marcaba también en ellos.
        active:
          pathname.startsWith(`/${slug}/ajustes`) &&
          !pathname.startsWith(`/${slug}/ajustes/empresa`) &&
          !pathname.startsWith(`/${slug}/ajustes/autorizaciones`),
        icon: Globe,
        roles: [
          "JEFE_ALMACEN",
          "ANALISTA_ALMACEN",
          "JEFE_PLANIFICACION",
          "ANALISTA_PLANIFICACION",
          "SUPERUSER",
          "COORDINADOR_SMS",
          "GERENTE_SMS",
          "EJECUTIVO_RESPONSABLE",
          "JEFE_COMPRAS",
          "ANALISTA_COMPRAS",
          "ASISTENTE_COMPRAS",
          "JEFE_ADMINISTRACION",
          "ANALISTA_ADMINISTRACION",
          "ENGINEERING",
        ],
        submenus: [
          {
            href: `/${slug}/ajustes/unidades`,
            label: "Unidades",
            requiresTables: ["units"],
            active: pathname === `/${slug}/ajustes/unidades`,
            roles: [...CATALOG_ROLES.units],
          },
          {
            href: `/${slug}/ajustes/fabricantes`,
            label: "Fabricantes",
            requiresTables: ["manufacturers"],
            active: pathname === `/${slug}/ajustes/fabricantes`,
            roles: [
              "JEFE_ALMACEN",
              "ANALISTA_ALMACEN",
              "JEFE_PLANIFICACION",
              "ANALISTA_PLANIFICACION",
              "SUPERUSER",
              "ENGINEERING",
            ],
          },
          {
            href: `/${slug}/ajustes/proveedores`,
            label: "Proveedores",
            requiresTables: ["vendors"],
            active: pathname === `/${slug}/ajustes/proveedores`,
            roles: [...CATALOG_ROLES.vendors],
          },
          {
            href: `/${slug}/ajustes/comercios`,
            label: "Comercios",
            requiresTables: ["retailers"],
            active: pathname === `/${slug}/ajustes/comercios`,
            roles: [...CATALOG_ROLES.retailers],
          },
          {
            href: `/${slug}/ajustes/clientes`,
            label: "Clientes",
            requiresTables: ["clients"],
            active: pathname === `/${slug}/ajustes/clientes`,
            roles: [
              "JEFE_ADMINISTRACION",
              "ANALISTA_ADMINISTRACION",
              "SUPERUSER",
            ],
          },
          {
            href: `/${slug}/ajustes/aeronaves`,
            label: "Aeronaves",
            requiresTables: ["aircrafts"],
            active: pathname === `/${slug}/ajustes/aeronaves`,
            requiresOmac: false,
            roles: [
              "JEFE_ADMINISTRACION",
              "ANALISTA_ADMINISTRACION",
              "SUPERUSER",
            ],
          },
          {
            href: `/${slug}/ajustes/terceros`,
            label: "Terceros",
            requiresTables: ["third_parties"],
            active: pathname === `/${slug}/ajustes/terceros`,
            roles: [
              "JEFE_ALMACEN",
              "ANALISTA_ALMACEN",
              "JEFE_PLANIFICACION",
              "ANALISTA_PLANIFICACION",
              "SUPERUSER",
            ],
          },
          {
            href: `/${slug}/ajustes/condiciones`,
            label: "Condiciones",
            requiresTables: ["conditions"],
            active: pathname === `/${slug}/ajustes/condiciones`,
            roles: [...CATALOG_ROLES.conditions],
          },
          {
            href: `/${slug}/ajustes/fuentes_informacion`,
            label: "Fuentes de Informacion",
            requiresTables: ["information_sources"],
            active: pathname === `/${slug}/ajustes/fuentes_informacion`,
            roles: [
              "JEFE_SMS",
              "ANALISTA_SMS",
              "SUPERUSER",
              "COORDINADOR_SMS",
              "GENRENTE_SMS",
              "EJECUTIVO_RESPONSABLE",
            ],
          },
          {
            href: `/${slug}/ajustes/agencias_envio`,
            label: "Agencias de Envío",
            requiresTables: ["shipping_agencies"],
            active: pathname === `/${slug}/ajustes/agencias_envio`,
            roles: [...CATALOG_ROLES.shippingAgencies],
          },
          {
            href: `/${slug}/ajustes/pilotos`,
            label: "Pilotos",
            requiresTables: ["pilots"],
            active: pathname === `/${slug}/ajustes/pilotos`,
            requiresOmac: false,
            roles: [
              "JEFE_PLANIFICACION",
              "ANALISTA_PLANIFICACION",
              "SUPERUSER",
            ],
          },
        ],
      },
      {
        href: `/${slug}/ajustes/empresa`,
        label: "Organización",
        active: pathname.startsWith(`/${slug}/ajustes/empresa`),
        icon: Building2,
        roles: ["ADMIN", "SUPERUSER"],
        submenus: [
          {
            href: `/${slug}/ajustes/empresa/ubicaciones`,
            label: "Administrar Ubicaciones",
            requiresTables: ["locations"],
            active: pathname === `/${slug}/ajustes/empresa/ubicaciones`,
          },
          {
            href: `/${slug}/ajustes/empresa/empleados`,
            label: "Administrar Empleados",
            requiresTables: ["employees"],
            active: pathname === `/${slug}/ajustes/empresa/empleados`,
          },
          {
            href: `/${slug}/ajustes/empresa/cargos`,
            label: "Administrar Cargos",
            requiresTables: ["job_titles"],
            active: pathname === `/${slug}/ajustes/empresa/cargos`,
          },
          {
            href: `/${slug}/ajustes/empresa/departamentos`,
            label: "Administrar Departamentos",
            requiresTables: ["departments"],
            active: pathname === `/${slug}/ajustes/empresa/departamentos`,
          },
          {
            href: `/${slug}/ajustes/empresa/almacenes`,
            label: "Administrar Almacenes",
            requiresTables: ["warehouses"],
            active: pathname === `/${slug}/ajustes/empresa/almacenes`,
          },
          {
            href: `/${slug}/ajustes/empresa/parametros`,
            label: "Parámetros de la Empresa",
            requiresTables: ["company_settings"],
            active: pathname === `/${slug}/ajustes/empresa/parametros`,
            roles: ["SUPERUSER"],
          },
        ],
      },
      {
        href: `/${slug}/ajustes/autorizaciones`,
        label: "Autorizaciones",
        active: pathname.startsWith(`/${slug}/ajustes/autorizaciones`),
        icon: KeyRound,
        roles: ["ADMIN", "SUPERUSER"],
        submenus: [
          {
            href: `/${slug}/ajustes/autorizaciones/convenios`,
            label: "Convenios entre Empresas",
            active: pathname === `/${slug}/ajustes/autorizaciones/convenios`,
          },
          {
            href: `/${slug}/ajustes/autorizaciones/autorizados`,
            label: "Personal Externo",
            active: pathname === `/${slug}/ajustes/autorizaciones/autorizados`,
          },
        ],
      },
    ],
  };
}
