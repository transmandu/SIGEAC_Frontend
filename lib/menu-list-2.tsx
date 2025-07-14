"use client";

import { Company } from "@/types";
import { format } from "date-fns";
import { LucideIcon, LayoutGrid, CreditCardIcon, UserRoundCog, PackageSearch, ScrollText, SquarePen, ClipboardPen, ShieldAlert, AreaChartIcon, Activity, ClipboardList, HandCoins, Receipt } from "lucide-react";

// Tipos actualizados
type Submenu = {
  href: string;
  label: string;
  active: boolean;
  roles?: string[];
  moduleValue?: string;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  roles: string[];
  moduleValue?: string;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  moduleValue?: string;
  menus: Menu[];
};

export function getMenuList(
  pathname: string,
  currentCompany: Company | null,
  userRoles: string[]
): Group[] {
  const date = format(new Date(), "yyyy-MM-dd");
  // 1. Verificar acceso por rol
  const hasRoleAccess = (menuItem: { roles?: string[] }): boolean => {
    return !menuItem.roles || menuItem.roles.length === 0 ||
           menuItem.roles.some(role => userRoles.includes(role));
  };

  // 2. Verificar si el módulo está activo para la compañía
  const isModuleActive = (moduleValue?: string): boolean => {
    // Si no requiere módulo específico o no hay compañía seleccionada, está activo
    if (!moduleValue || !currentCompany) return true;
    // Verificar si la compañía tiene este módulo
    return currentCompany.modules.some(m => m.value === moduleValue);
  };

  // 3. Definición completa del menú con hrefs dinámicos
  const fullMenu: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: `/${currentCompany?.slug}/dashboard`,
          label: "Dashboard",
          active: pathname.includes("/${currentCompany.slug}/dashboard"),
          icon: LayoutGrid,
          roles: [],
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "General",
      moduleValue: "",
      menus: [
        {
          href: `/${currentCompany?.slug}/general/inventario`,
          label: "Inventario",
          active: pathname.includes(`/${currentCompany?.slug}/general/inventario`),
          icon: PackageSearch,
          roles: [],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/general/requisiciones`,
          label: "Requisiciones",
          active: pathname.includes(`/${currentCompany?.slug}/general/requisiciones`),
          icon: ScrollText,
          roles: [],
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Administración",
      moduleValue: "administration",
      menus: [
        {
          href: `/${currentCompany?.slug || ''}/administracion/creditos`,
          label: "Créditos",
          active: pathname.includes("/administracion/creditos"),
          icon: CreditCardIcon,
          roles: ["SUPERUSER", "ANALISTA_ADMINISTRACION"],
          moduleValue: "administration",
          submenus: [],
        },
        {
          href: "/configuracion", // Ruta compartida sin prefijo de compañía
          label: "Configuración Global",
          active: pathname.includes("/configuracion"),
          icon: UserRoundCog,
          roles: ["SUPERUSER"],
          submenus: [],
        },
      ],
    },
    {
            groupLabel: "Desarrollo",
            menus: [
              {
                href: `/${currentCompany?.slug}/desarrollo`,
                label: "Actividades",
                active: pathname.includes(`/${currentCompany?.slug}/desarrollo`),
                icon: SquarePen,
                roles: ["ANALISTA_DESARROLLO", "JEFE_DESARROLLO", "SUPERUSER"],
                submenus: [
                  {
                    href: `/${currentCompany?.slug}/desarrollo/actividades_diarias/registro/${date}/`,
                    label: "Registro de Actividades",
                    active:
                      pathname ===
                      `/${currentCompany?.slug}/desarrollo/actividades_diarias/registro/`,
                  },
                  {
                    href: `/${currentCompany?.slug}/desarrollo/actividades_diarias`,
                    label: "Gestion de Actividades",
                    active:
                      pathname ===
                      `/${currentCompany?.slug}/desarrollo/actividades_diarias/`,
                  },
                ],
              },
            ],
    },
    {
      groupLabel: "SMS",
      menus: [
        {
          href: `/${currentCompany?.slug}/sms`,
          label: "Reportes",
          active: pathname.includes(`/${currentCompany?.slug}/sms/reportes`),
          icon: ClipboardPen,
          roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/reportes/reportes_voluntarios`,
              label: "Reportes Voluntarios",
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/reportes/reportes_voluntarios`,
            },
            {
              href: `/${currentCompany?.slug}/sms/reportes/reportes_obligatorios`,
              label: "Reportes Obligatorios",
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/reportes/reportes_obligatorios`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/sms`,
          label: "Gestion de Reportes",
          active: pathname.includes(`/${currentCompany?.slug}/sms/gestion_reportes`),
          icon: ShieldAlert,
          roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/gestion_reportes/peligros_identificados`,
              label: "Peligros Identificados",
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/gestion_reportes/peligros_identificados`,
            },
            {
              href: `/${currentCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion`,
              label: "Planes de Mitigacion",
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/sms`,
          label: "Estadisticas",
          icon: AreaChartIcon,
          active: pathname.includes(`/${currentCompany?.slug}/sms/estadisticas`),
          roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/estadisticas/general`,
              label: "General",
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
              active: pathname === `/${currentCompany?.slug}/sms/estadisticas/general`,
            },

          {
            href: `/${currentCompany?.slug}/sms/estadisticas/reportes_voluntarios`,
            label: "Reportes Voluntarios",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
            active:
              pathname ===
              `/${currentCompany?.slug}/sms/estadisticas/reportes_voluntarios`,
          },
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/reportes_obligatorios`,
            label: "Reportes Obligatorios",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
            active:
              pathname ===
              `/${currentCompany?.slug}/sms/estadisticas/reportes_obligatorios`,
          },
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/indicadores_riesgo`,
            label: "Indicadores de Riesgo",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
            active:
              pathname ===
              `/${currentCompany?.slug}/sms/estadisticas/indicadores_riesgo`,
          },
        ],
      },
      {
        href: "",
        label: "Planificacion",
        active: pathname.includes(`/${currentCompany?.slug}/sms/planificacion`),
        icon: Activity,
        roles: ["SUPERUSER"],
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/planificacion/cursos`,
            label: "Cursos SMS",
            roles: ["SUPERUSER"],
            active:
              pathname === `/${currentCompany?.slug}/planificacion/cursos`,
          },
          {
            href: `/${currentCompany?.slug}/sms/planificacion/actividades`,
            label: "Actividades SMS",
            roles: ["SUPERUSER"],
            active: pathname === `/${currentCompany?.slug}/planificacion/actividades`,
          },
        ],
      },
      {
        href: `/${currentCompany?.slug}/sms`,
        label: "Reportes",
        active: pathname.includes(`/${currentCompany?.slug}/sms`),
        icon: ClipboardPen,
        roles: [],
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/reportes/reportes_voluntarios/nuevo_reporte`,
            label: "Reportes Voluntarios",
            roles: [],
            active:
              pathname ===
              `/${currentCompany?.slug}/sms/reportes/reportes_voluntarios/nuevo_reporte`,
          },
          {
            href: `/${currentCompany?.slug}/sms/reportes/reportes_obligatorios/nuevo_reporte`,
            label: "Reportes Obligatorios",
            roles: [],
            active:
              pathname ===
              `/${currentCompany?.slug}/sms/reportes/reportes_obligatorios/nuevo_reporte`,
          },
        ],
      },
    ],
    },
    {
      groupLabel: "Compras",
      menus: [
        {
          href: `/${currentCompany?.slug}/compras/requisiciones`,
          label: "Requisiciones",
          active: pathname.includes(`/${currentCompany?.slug}/compras/requisiciones`),
          icon: ClipboardList,
          roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/compras/cotizaciones`,
          label: "Cotizaciones",
          active: pathname.includes(`/${currentCompany?.slug}/compras/cotizaciones`),
          icon: HandCoins,
          roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/compras/ordenes_compra`,
          label: "Ordenes de Compra",
          active: pathname.includes(`/${currentCompany?.slug}/compras/ordenes_compra`),
          icon: Receipt,
          roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER", "JEFE_ADMINISTRACION"],
          submenus: [],
        },
      ],
    },
  ];

  // 4. Filtrar el menú completo
  return fullMenu
    // Filtrar grupos por módulo activo
    .filter(group => isModuleActive(group.moduleValue))
    // Filtrar menús y submenús
    .map(group => ({
      ...group,
      menus: group.menus
        .filter(menu =>
          isModuleActive(menu.moduleValue) &&
          hasRoleAccess(menu)
        )
        .map(menu => ({
          ...menu,
          submenus: menu.submenus.filter(sub =>
            isModuleActive(sub.moduleValue) &&
            hasRoleAccess(sub)
          ),
        })),
    }))
    // Eliminar grupos vacíos
    .filter(group => group.menus.length > 0);
}
