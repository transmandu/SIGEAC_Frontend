"use client";

import { format } from "date-fns";
import {
  AreaChartIcon,
  BookCheck,
  BookUser,
  Building,
  ClipboardCopy,
  ClipboardPen,
  Drill,
  Globe,
  HandCoins,
  Landmark,
  LayoutGrid,
  LucideIcon,
  PackageOpen,
  PackagePlus,
  PackageSearch,
  Plane,
  Receipt,
  ScrollText,
  Settings,
  ShieldAlert,
  SquarePen,
  User2,
  UserRoundCog,
  Wrench
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  roles: string[];
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export type CompanyMenu = "transmandu" | "hangar 74";

//TODO: Crear menus para cada empresa. Mismo array o diferente, ir probando.

export function getMenuList(
  pathname: string,
  company: CompanyMenu,
  userRoles: string[]
): Group[] {
  const date = format(new Date(), "yyyy-MM-dd");
  function hasAccess(menu: Menu): boolean {
    return (
      menu.roles.length === 0 ||
      menu.roles.some((role) => userRoles.includes(role))
    );
  }
  return (
    company === "transmandu"
      ? [
          {
            groupLabel: "",
            menus: [
              {
                href: "/transmandu/dashboard",
                label: "Dashboard",
                active: pathname.includes("/transmandu/dashboard"),
                icon: LayoutGrid,
                roles: [],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "SMS",
            menus: [
              {
                href: "/transmandu/sms",
                label: "Reportes",
                active: pathname.includes("/transmandu/sms"),
                icon: ClipboardPen,
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER","GUEST"],
                submenus: [
                  {
                    href: "/transmandu/sms/reportes_voluntarios",
                    label: "Reportes Voluntarios",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER","GUEST"],
                    active: pathname === "/transmandu/sms/reportes_voluntarios",
                  },
                  {
                    href: "/transmandu/sms/reportes_obligatorios",
                    label: "Reportes Obligatorios",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER","GUEST"],
                    active:
                      pathname === "/transmandu/sms/reportes_obligatorios",
                  },
                ],
              },
              {
                href: "/transmandu/sms",
                label: "Gestion de Reportes",
                active: pathname.includes("/transmandu/sms"),
                icon: ShieldAlert ,
                roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                submenus: [
                  {
                    href: "/transmandu/sms/peligros_identificados",
                    label: "Peligros Identificados",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active: pathname === "/transmandu/sms/peligros_identificados",
                  },
                  {
                    href: "/transmandu/sms/planes_de_mitigacion",
                    label: "Planes de Mitigacion",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname === "/transmandu/sms/planes_de_mitigacion",
                  },
                ],
              },
              {
                href: "/transmandu/sms",
                label: "Estadisticas",
                icon: AreaChartIcon,
                active: pathname.includes("/estadisticas"),
                roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                submenus: [
                  {
                    href: "/transmandu/sms/estadisticas/general",
                    label: "General",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active: pathname === "/transmandu/sms/estadisticas/general",
                  },

                  {
                    href: "/transmandu/sms/estadisticas/reportes_voluntarios",
                    label: "Reportes Voluntarios",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/estadisticas/reportes_voluntarios",
                  },
                  {
                    href: "/transmandu/sms/estadisticas/reportes_obligatorios",
                    label: "Reportes Obligatorios",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/estadisticas/reportes_obligatorios",
                  },
                  {
                    href: "/transmandu/sms/estadisticas/indicadores_riesgo",
                    label: "Indicadores de Riesgo",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/estadisticas/indicadores_riesgo",
                  },
                ],
              },
            ],
          },
          {
            groupLabel: "Sistema",
            menus: [
              {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios",
                active: pathname.includes("/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/usuarios_permisos/usuarios",
                    label: "Administrar Usuarios",
                    active: pathname === "/sistema/usuarios_permisos/usuarios",
                  },
                  {
                    href: "/sistema/usuarios_permisos/roles",
                    label: "Administrar  Roles",
                    active: pathname === "/sistema/usuarios_permisos/roles",
                  },
                  {
                    href: "/sistema/usuarios_permisos/permisos",
                    label: "Administrar Permisos",
                    active: pathname === "/sistema/usuarios_permisos/permisos",
                  },
                ],
              },
              {
                href: "/sistema/empresas",
                label: "Empresas",
                active: pathname.includes("/sistema/empresas"),
                icon: Building,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/empresas/almacenes",
                    label: "Administrar Almacenes",
                    active: pathname === "/sistema/empresas/almacenes",
                  },
                  {
                    href: "/sistema/empresas/empleados",
                    label: "Administrar Empleados",
                    active: pathname === "/sistema/empresas/empleados",
                  },
                ],
              },
            ],
          },
          {
            groupLabel: "Ajustes",
            menus: [
              {
                href: "/ajustes/empresas",
                label: "Globales",
                active: pathname.includes("/ajustes/globales"),
                icon: Globe,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/ajustes/globales/pilotos",
                    label: "Pilotos",
                    active: pathname === "/ajustes/globales/pilotos",
                  },
                  {
                    href: "/ajustes/globales/fuentes_informacion",
                    label: "Fuentes de Información",
                    active:
                      pathname === "/ajustes/globales/fuentes_informacion",
                  },
                  {
                    href: "/ajustes/globales/areas",
                    label: "Areas",
                    active: pathname === "/ajustes/globales/areas",
                  },
                ],
              },
              {
                href: "/hangar74/cuenta",
                label: "Cuenta",
                active: pathname.includes("/cuenta"),
                icon: Settings,
                roles: [],
                submenus: [],
              },
            ],
          },
        ]
      : [
          {
            groupLabel: "",
            menus: [
              {
                href: "/hangar74/dashboard",
                label: "Dashboard / Hangar74",
                active: pathname.includes("/hangar74/dashboard"),
                icon: LayoutGrid,
                roles: [],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "General",
            menus: [
              {
                href: "/hangar74/general/inventario",
                label: "Inventario",
                active: pathname.includes("/hangar74/general/inventario"),
                icon: PackageSearch,
                roles: [],
                submenus: [],
              },
              {
                href: "/hangar74/general/requisiciones",
                label: "Requisiciones",
                active: pathname.includes("/hangar74/general/requisiciones"),
                icon: ScrollText,
                roles: [],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Carga Administrativa",
            menus: [
              {
                href: "",
                label: "Control de Ingreso",
                active: pathname.includes(
                  "/hangar74/almacen/inventario/ingreso"
                ),
                icon: PackagePlus,
                roles: [
                  "ANALISTA_ALMACEN",
                  "ANALISTA_COMPRAS",
                  "SUPERUSER",
                  "JEFE_ALMACEN",
                ],
                submenus: [
                  {
                    href: "/hangar74/almacen/ingreso/registrar_ingreso",
                    label: "Ingreso de Articulo",
                    active:
                      pathname ===
                      "/hangar74/almacen/ingreso/registrar_ingreso",
                  },
                  // {
                  //   href: "/hangar74/almacen/ingreso/en_transito",
                  //   label: "Articulos en Tránsito",
                  //   active: pathname === "/hangar74/almacen/ingreso/en_transito"
                  // },
                  // {
                  //   href: "/hangar74/almacen/ingreso/en_recepcion",
                  //   label: "Articulos en Recepción",
                  //   active: pathname === "/hangar74/almacen/ingreso/en_recepcion"
                  // },
                ],
              },
            ],
          },
          {
            groupLabel: "Almacen",
            menus: [
              {
                href: "",
                label: "Solicitudes",
                active: pathname.includes("/hangar74/almacen/solicitudes"),
                icon: ClipboardCopy,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/hangar74/almacen/solicitudes/pendiente",
                    label: "Pendiente",
                    active:
                      pathname === "/hangar74/almacen/solicitudes/pendiente",
                  },
                  {
                    href: "/hangar74/almacen/solicitudes/salida",
                    label: "Salida",
                    active: pathname === "/hangar74/almacen/solicitudes/salida",
                  },
                ],
              },
              {
                href: "/hangar74/almacen/inventario",
                label: "Inventario",
                active: pathname.includes("/hangar74/almacen/inventario"),
                icon: PackageOpen,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/hangar74/almacen/inventario/gestion",
                    label: "Gestión",
                    active:
                      pathname === "/hangar74/almacen/inventario/gestion" ||
                      pathname === "/hangar74/almacen/inventario/gestion/crear",
                  },
                  {
                    href: "/hangar74/almacen/inventario/entregado",
                    label: "Entregado",
                    active:
                      pathname === "/hangar74/almacen/inventario/entregado",
                  },
                ],
              },
              {
                href: "/hangar74/almacen/caja_herramientas",
                label: "Cajas de Herramientas",
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                active: pathname.includes(
                  "/hangar74/almacen/caja_herramientas"
                ),
                icon: Wrench,
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Compras",
            menus: [
              {
                href: "/hangar74/compras/cotizaciones",
                label: "Cotizaciones",
                active: pathname.includes("/hangar74/compras/cotizaciones"),
                icon: HandCoins,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
              },
              {
                href: "/hangar74/compras/ordenes_compra",
                label: "Ordenes de Compra",
                active: pathname.includes("/hangar74/compras/ordenes_compra"),
                icon: Receipt,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
              },
              // {
              //   href: "/hangar74/compras/reportes",
              //   label: "Reporte de Compras",
              //   active: pathname.includes("/hangar74/compras/reportes"),
              //   icon: NotebookPen,
              //   roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
              //   submenus: [
              //     {
              //       href: "/hangar74/compras/reportes/general",
              //       label: "Reporte General",
              //       active: pathname === "/hangar74/compras/reportes/general"
              //     },
              //     {
              //       href: "/hangar74/compras/reportes/aeronave",
              //       label: "Reporte de Aeronave",
              //       active: pathname === "/hangar74/compras/reportes/aeronave"
              //     },
              //     {
              //       href: "/hangar74/compras/reportes/proveedor",
              //       label: "Reporte de Proveedor",
              //       active: pathname === "/hangar74/compras/reportes/proveedor"
              //     },
              //   ]
              // },
            ],
          },
          {
            groupLabel: "Planificación",
            menus: [
              {
                href: "/hangar74/planificacion/ordenes_trabajo",
                label: "Ordenes de Trabajo",
                active: pathname.includes(
                  "/hangar74/planificacion/ordenes_trabajo"
                ),
                icon: SquarePen,
                roles: [
                  "ANALISTA_PLANIFICACION",
                  "JEFE_PLANIFICACION",
                  "SUPERUSER",
                ],
                submenus: [
                  {
                    href: "/hangar74/planificacion/ordenes_trabajo/",
                    label: "Gestionar Ordenes",
                    active:
                      pathname === "/hangar74/planificacion/ordenes_trabajo",
                  },
                ],
              },
              {
                href: "/hangar74/planificacion/aeronaves",
                label: "Aeronaves",
                active: pathname.includes("/hangar74/planificacion/reportes"),
                icon: Plane,
                roles: [
                  "ANALISTA_PLANIFICACION",
                  "JEFE_PLANIFICACION",
                  "SUPERUSER",
                ],
                submenus: [
                  {
                    href: "/hangar74/planificacion/aeronaves",
                    label: "Gestión de Aeronaves",
                    active: pathname === "/hangar74/planificacion/aeronaves",
                  },
                  {
                    href: "/hangar74/planificacion/aeronaves/partes",
                    label: "Gestión de Partes",
                    active:
                      pathname === "/hangar74/planificacion/aeronaves/partes",
                  },
                ],
              },
              {
                href: "/hangar74/planificacion/aeronaves",
                label: "Control de Vuelos",
                active: pathname.includes(
                  "/hangar74/planificacion/control_vuelos"
                ),
                icon: BookCheck,
                roles: [
                  "ANALISTA_PLANIFICACION",
                  "JEFE_PLANIFICACION",
                  "SUPERUSER",
                ],
                submenus: [
                  {
                    href: "/hangar74/planificacion/control_vuelos/vuelos",
                    label: "Vuelos",
                    active:
                      pathname ===
                      "/hangar74/planificacion/control_vuelos/vuelos",
                  },
                  {
                    href: "/hangar74/planificacion/control_vuelos/reportes",
                    label: "Reportes",
                    active:
                      pathname ===
                      "/hangar74/planificacion/control_vuelos/reportes",
                  },
                ],
              },
            ],
          },
          {
            groupLabel: "Mantenimiento",
            menus: [
              {
                href: "/hangar74/mantenimiento/servicios",
                label: "Servicios",
                active: pathname.includes("/hangar74/mantenimiento/servicios"),
                icon: Drill,
                roles: [
                  "ANALISTA_PLANIFICACION",
                  "JEFE_PLANIFICACION",
                  "SUPERUSER",
                ],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Ajustes",
            menus: [
              {
                href: "/ajustes/empresas",
                label: "Globales",
                active: pathname.includes("/ajustes/globales"),
                icon: Globe,
                roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/ajustes/globales/unidades",
                    label: "Unidades",
                    active: pathname === "/ajustes/globales/unidades",
                  },
                  {
                    href: "/ajustes/globales/fabricantes",
                    label: "Fabricantes",
                    active: pathname === "/administracion/globales/fabricantes",
                  },
                  {
                    href: "/ajustes/globales/proveedores",
                    label: "Proveedores",
                    active: pathname === "/administracion/globales/proveedores",
                  },
                  {
                    href: "/ajustes/globales/condiciones",
                    label: "Condiciones",
                    active: pathname === "/ajustes/globales/condiciones",
                  },
                ],
              },
              {
                href: "/ajustes/bancos_cuentas",
                label: "Bancos",
                active: pathname.includes("/bancos_cuentas"),
                icon: Landmark,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/ajustes/bancos_cuentas/bancos",
                    label: "Bancos",
                    active: pathname === "/ajustes/bancos_cuentas/bancos",
                  },
                  {
                    href: "/ajustes/bancos_cuentas/cuentas",
                    label: "Cuentas",
                    active: pathname === "/ajustes/bancos_cuentas/cuentas",
                  },
                  {
                    href: "/ajustes/bancos_cuentas/tarjetas",
                    label: "Tarjetas",
                    active: pathname === "/ajustes/bancos_cuentas/tarjetas",
                  },
                ],
              },
              {
                href: "/ajustes/clientes",
                label: "Clientes",
                active: pathname.includes("/clientes"),
                icon: BookUser,
                roles: ["SUPERUSER"],
                submenus: [],
              },
              {
                href: "/ajustes/cuenta",
                label: "Cuenta",
                active: pathname.includes("/bancos_cuentas"),
                icon: UserRoundCog,
                roles: [],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Sistema",
            menus: [
              {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios",
                active: pathname.includes("/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/usuarios_permisos/usuarios",
                    label: "Administrar Usuarios",
                    active: pathname === "/sistema/usuarios_permisos/usuarios",
                  },
                  {
                    href: "/sistema/usuarios_permisos/roles",
                    label: "Administrar  Roles",
                    active: pathname === "/sistema/usuarios_permisos/roles",
                  },
                  {
                    href: "/sistema/usuarios_permisos/permisos",
                    label: "Administrar Permisos",
                    active: pathname === "/sistema/usuarios_permisos/permisos",
                  },
                ],
              },
              {
                href: "/sistema/empresas",
                label: "Empresas",
                active: pathname.includes("/sistema/empresas"),
                icon: Building,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/empresas/almacenes",
                    label: "Administrar Almacenes",
                    active: pathname === "/sistema/empresas/almacenes",
                  },
                  {
                    href: "/sistema/empresas/empleados",
                    label: "Administrar Empleados",
                    active: pathname === "/sistema/empresas/empleados",
                  },
                ],
              },
            ],
          },
        ]
  )
    .map((group) => ({
      ...group,
      menus: group.menus.filter(hasAccess).map((menu) => ({
        ...menu,
        submenus: menu.submenus.filter(
          (sub) =>
            !menu.roles.length ||
            menu.roles.some((role) => userRoles.includes(role))
        ),
      })),
    }))
    .filter((group) => group.menus.length > 0);
}
