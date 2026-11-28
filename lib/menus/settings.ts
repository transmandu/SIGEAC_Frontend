import { CATALOG_ROLES } from "@/lib/menus/catalog-roles";
import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import { Building2, Globe, KeyRound } from "lucide-react";

/**
 * Ajustes por compañía: todo lo de aquí se sirve bajo middleware `tenant`, así
 * que las rutas viven bajo /[company]/ y el grupo solo se construye con una
 * compañía seleccionada. Lo que viva en master va en `buildSystemGroup`.
 */
export function buildSettingsGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
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
          isPathWithin(pathname, `/${slug}/ajustes`) &&
          !isPathWithin(pathname, `/${slug}/ajustes/empresa`) &&
          !isPathWithin(pathname, `/${slug}/ajustes/autorizaciones`),
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
            roles: [...CATALOG_ROLES.units],
          },
          {
            href: `/${slug}/ajustes/fabricantes`,
            label: "Fabricantes",
            requiresTables: ["manufacturers"],
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
            roles: [...CATALOG_ROLES.vendors],
          },
          {
            href: `/${slug}/ajustes/comercios`,
            label: "Comercios",
            requiresTables: ["retailers"],
            roles: [...CATALOG_ROLES.retailers],
          },
          {
            href: `/${slug}/ajustes/clientes`,
            label: "Clientes",
            requiresTables: ["clients"],
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
            roles: [...CATALOG_ROLES.conditions],
          },
          {
            href: `/${slug}/ajustes/fuentes_informacion`,
            label: "Fuentes de Información",
            requiresTables: ["information_sources"],
            roles: [
              "JEFE_SMS",
              "ANALISTA_SMS",
              "SUPERUSER",
              "COORDINADOR_SMS",
              "GERENTE_SMS",
              "EJECUTIVO_RESPONSABLE",
            ],
          },
          {
            href: `/${slug}/ajustes/agencias_envio`,
            label: "Agencias de Envío",
            requiresTables: ["shipping_agencies"],
            roles: [...CATALOG_ROLES.shippingAgencies],
          },
          {
            href: `/${slug}/ajustes/pilotos`,
            label: "Pilotos",
            requiresTables: ["pilots"],
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
        active: isPathWithin(pathname, `/${slug}/ajustes/empresa`),
        icon: Building2,
        roles: ["ADMIN", "SUPERUSER"],
        submenus: [
          {
            href: `/${slug}/ajustes/empresa/ubicaciones`,
            label: "Administrar Ubicaciones",
            requiresTables: ["locations"],
          },
          {
            href: `/${slug}/ajustes/empresa/empleados`,
            label: "Administrar Empleados",
            requiresTables: ["employees"],
          },
          {
            href: `/${slug}/ajustes/empresa/cargos`,
            label: "Administrar Cargos",
            requiresTables: ["job_titles"],
          },
          {
            href: `/${slug}/ajustes/empresa/departamentos`,
            label: "Administrar Departamentos",
            requiresTables: ["departments"],
          },
          {
            href: `/${slug}/ajustes/empresa/almacenes`,
            label: "Administrar Almacenes",
            requiresTables: ["warehouses"],
          },
          {
            href: `/${slug}/ajustes/empresa/parametros`,
            label: "Parámetros de la Empresa",
            requiresTables: ["company_settings"],
            roles: ["SUPERUSER"],
          },
          {
            href: `/${slug}/ajustes/empresa/alertas`,
            label: "Alertas Críticas",
            requiresTables: ["critical_alert_settings"],
            roles: ["SUPERUSER"],
          },
          {
            href: `/${slug}/ajustes/empresa/notificaciones`,
            label: "Notificaciones In-App",
            requiresTables: ["notification_audience_rules"],
            roles: ["SUPERUSER"],
          },
          {
            href: `/${slug}/ajustes/empresa/correos`,
            label: "Destinatarios de Correos",
            requiresTables: ["mail_recipient_rules"],
            roles: ["SUPERUSER"],
          },
        ],
      },
      {
        href: `/${slug}/ajustes/autorizaciones`,
        label: "Autorizaciones",
        active: isPathWithin(pathname, `/${slug}/ajustes/autorizaciones`),
        icon: KeyRound,
        roles: ["ADMIN", "SUPERUSER"],
        submenus: [
          {
            href: `/${slug}/ajustes/autorizaciones/convenios`,
            label: "Convenios entre Empresas",
          },
          {
            href: `/${slug}/ajustes/autorizaciones/autorizados`,
            label: "Personal Externo",
          },
        ],
      },
    ],
  };
}
