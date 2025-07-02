"use client";

import { format } from "date-fns";
import {
  Activity,
  AreaChartIcon,
  Award,
  BookCheck,
  BookUser,
  Cat,
  ClipboardCopy,
  ClipboardList,
  ClipboardPen,
  CreditCardIcon,
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
  PlaneIcon,
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
  roles?: string[];
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

export function getMenuList(
  pathname: string,
  company: CompanyMenu,
  userRoles: string[]
): Group[] {
  const date = format(new Date(), "yyyy-MM-dd");
  function hasAccess(menuItem: Menu | Submenu): boolean {
    if (!menuItem.roles || menuItem.roles.length === 0) {
      return true; // No roles specified, so everyone has access
    }
    return menuItem.roles.some((role) => userRoles.includes(role));
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
            groupLabel: "Desarrollo",
            menus: [
              {
                href: "/transmandu/desarrollo",
                label: "Actividades",
                active: pathname.includes("/transmandu/desarrollo"),
                icon: SquarePen,
                roles: ["ANALISTA_DESARROLLO", "JEFE_DESARROLLO", "SUPERUSER"],
                submenus: [
                  {
                    href: `/transmandu/desarrollo/actividades_diarias/registro/${date}/`,
                    label: "Registro de Actividades",
                    active:
                      pathname ===
                      `/transmandu/desarrollo/actividades_diarias/registro/`,
                  },
                  {
                    href: "/transmandu/desarrollo/actividades_diarias",
                    label: "Gestion de Actividades",
                    active:
                      pathname ===
                      `/transmandu/desarrollo/actividades_diarias/`,
                  },
                ],
              },
            ],
          },
          {
            groupLabel: "Administración",
            menus: [
              {
                href: "/transmandu/administracion/creditos",
                label: "Créditos",
                active: pathname.includes(
                  "/transmandu/administracion/creditos"
                ),
                icon: CreditCardIcon,
                roles: [
                  "SUPERUSER",
                  "ANALISTA_ADMINISTRACION",
                  "JEFE_ADMINISTRACION",
                  "JEFE_CONTADURIA",
                  "RRHH_ADMINISTRACION",
                ],
                submenus: [
                  {
                    href: "/transmandu/administracion/creditos/credito_arrendamiento",
                    label: "Arrendamiento",
                    active:
                      pathname ===
                      "/transmandu/administracion/creditos/credito_arrendamiento",
                  },
                  {
                    href: "/transmandu/administracion/creditos/cuentas_por_pagar",
                    label: "Cuentas por Pagar",
                    active:
                      pathname ===
                      "/transmandu/administracion/creditos/cuentas_por_pagar",
                  },
                  //  {
                  //    href: "/transmandu/administracion/creditos/credito_venta",
                  //    label: "Ventas",
                  //    active:
                  //      pathname ===
                  //      "/transmandu/administracion/creditos/credito_venta",
                  //  },
                  {
                    href: "/transmandu/administracion/creditos/credito_vuelo",
                    label: "Vuelos",
                    active:
                      pathname ===
                      "/transmandu/administracion/creditos/credito_vuelo",
                  },
                ],
              },
              {
                href: "/transmandu/administracion/gestion_cajas",
                label: "Finanzas",
                active: pathname.includes(
                  "/transmandu/administracion/gestion_cajas"
                ),
                icon: Landmark,
                roles: [
                  "SUPERUSER",
                  "ANALISTA_ADMINISTRACION",
                  "JEFE_ADMINISTRACION",
                  "JEFE_CONTADURIA",
                  "RRHH_ADMINISTRACION",
                ],
                submenus: [
                  {
                    href: "/transmandu/administracion/gestion_cajas/categorias",
                    label: "Categorías",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_cajas/categorias",
                  },
                  {
                    href: "/transmandu/administracion/gestion_cajas/cajas",
                    label: "Cajas",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_cajas/cajas",
                  },
                  {
                    href: "/transmandu/administracion/gestion_cajas/cuentas",
                    label: "Cuentas",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_cajas/cuentas",
                  },
                  {
                    href: "/transmandu/administracion/gestion_cajas/movimientos",
                    label: "Movimientos",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_cajas/movimientos",
                  },
                ],
              },
              {
                href: "/transmandu/administracion/gestion_general",
                label: "General",
                active: pathname.includes(
                  "/transmandu/administracion/gestion_general"
                ),
                icon: BookUser,
                roles: [
                  "SUPERUSER",
                  "ANALISTA_ADMINISTRACION",
                  "JEFE_ADMINISTRACION",
                  "JEFE_CONTADURIA",
                  "RRHH_ADMINISTRACION",
                ],
                submenus: [
                  {
                    href: "/transmandu/administracion/gestion_general/clientes",
                    label: "Clientes",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_general/clientes",
                  },
                  //  {
                  //    href: "/transmandu/administracion/gestion_general/empresa",
                  //    label: "Gestionar Empresa",
                  //    active:
                  //      pathname ===
                  //      "/transmandu/administracion/gestion_general/empresa",
                  //  },
                  {
                    href: "/transmandu/administracion/gestion_general/proveedor",
                    label: "Proveedor",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_general/proveedor",
                  },
                ],
              },
              {
                href: "/transmandu/administracion/operaciones",
                label: "Operaciones",
                active: pathname.includes(
                  "/transmandu/administracion/operaciones"
                ),
                icon: PackageOpen,
                roles: [
                  "SUPERUSER",
                  "ANALISTA_ADMINISTRACION",
                  "JEFE_ADMINISTRACION",
                ],
                submenus: [
                  {
                    href: "/transmandu/administracion/operaciones/arrendamiento",
                    label: "Arrendamiento",
                    active:
                      pathname ===
                      "/transmandu/administracion/operaciones/arrendamiento",
                  },
                ],
              },
              {
                href: "/transmandu/administracion/gestion_vuelos",
                label: "Vuelos",
                active: pathname.includes(
                  "/transmandu/administracion/gestion_vuelos"
                ),
                icon: PlaneIcon,
                roles: [
                  "SUPERUSER",
                  "ANALISTA_ADMINISTRACION",
                  "JEFE_ADMINISTRACION",
                  "RRHH_ADMINISTRACION", // RRHH ve el menú principal, pero no todos los submenús
                ],
                submenus: [
                  {
                    href: "/transmandu/administracion/gestion_vuelos/aviones",
                    label: "Aeronaves",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_vuelos/aviones",
                    roles: [
                      "SUPERUSER",
                      "ANALISTA_ADMINISTRACION",
                      "JEFE_ADMINISTRACION",
                      "RRHH_ADMINISTRACION",
                    ], // RRHH puede ver Aeronaves
                  },
                  {
                    href: "/transmandu/administracion/gestion_vuelos/rutas",
                    label: "Rutas",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_vuelos/rutas",
                    roles: [
                      "SUPERUSER",
                      "ANALISTA_ADMINISTRACION",
                      "JEFE_ADMINISTRACION",
                    ], // RRHH no puede ver Rutas
                  },
                  {
                    href: "/transmandu/administracion/gestion_vuelos/vuelos",
                    label: "Vuelos",
                    active:
                      pathname ===
                      "/transmandu/administracion/gestion_vuelos/vuelos",
                    roles: [
                      "SUPERUSER",
                      "ANALISTA_ADMINISTRACION",
                      "JEFE_ADMINISTRACION",
                    ], // RRHH no puede ver Vuelos
                  },
                ],
              },
            ],
          },
          {
            groupLabel: "SMS",
            menus: [
              {
                href: "/transmandu/sms",
                label: "Reportes",
                active: pathname.includes("/transmandu/sms/reportes"),
                icon: ClipboardPen,
                roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                submenus: [
                  {
                    href: "/transmandu/sms/reportes/reportes_voluntarios",
                    label: "Reportes Voluntarios",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/reportes/reportes_voluntarios",
                  },
                  {
                    href: "/transmandu/sms/reportes/reportes_obligatorios",
                    label: "Reportes Obligatorios",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/reportes/reportes_obligatorios",
                  },
                ],
              },
              {
                href: "/transmandu/sms",
                label: "Gestion de Reportes",
                active: pathname.includes("/transmandu/sms/gestion_reportes"),
                icon: ShieldAlert,
                roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                submenus: [
                  {
                    href: "/transmandu/sms/gestion_reportes/peligros_identificados",
                    label: "Peligros Identificados",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/gestion_reportes/peligros_identificados",
                  },
                  {
                    href: "/transmandu/sms/gestion_reportes/planes_de_mitigacion",
                    label: "Planes de Mitigacion",
                    roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
                    active:
                      pathname ===
                      "/transmandu/sms/gestion_reportes/planes_de_mitigacion",
                  },
                ],
              },
              {
                href: "/transmandu/sms",
                label: "Estadisticas",
                icon: AreaChartIcon,
                active: pathname.includes("/transmandu/sms/estadisticas"),
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
              {
                href: "/transmandu/sms",
                label: "Planificacion",
                active: pathname.includes("/transmandu/sms/planificacion"),
                icon: Activity,
                roles: ["SUPERUSER"],
                submenus: [
                  {
                    href: "/transmandu/sms/planificacion/actividades",
                    label: "Actividades SMS",
                    roles: ["SUPERUSER"],
                    active:
                      pathname === "/transmandu/planificacion/actividades",
                  },
                ],
              },
              {
                href: "/transmandu/sms",
                label: "Reportes",
                active: pathname.includes("/transmandu/sms"),
                icon: ClipboardPen,
                roles: [],
                submenus: [
                  {
                    href: "/transmandu/sms/reportes/reportes_voluntarios/nuevo_reporte",
                    label: "Reportes Voluntarios",
                    roles: [],
                    active:
                      pathname ===
                      "/transmandu/sms/reportes/reportes_voluntarios/nuevo_reporte",
                  },
                  {
                    href: "/transmandu/sms/reportes/reportes_obligatorios/nuevo_reporte",
                    label: "Reportes Obligatorios",
                    roles: [],
                    active:
                      pathname ===
                      "/transmandu/sms/reportes/reportes_obligatorios/nuevo_reporte",
                  },
                ],
              },
            ],
          },
          {
            groupLabel: "General",
            menus: [
              {
                href: "/transmandu/general/cursos",
                label: "Cursos",
                active: pathname.includes("/transmandu/general/cursos"),
                icon: Cat,
                roles: ["SUPERUSER"],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Compras",
            menus: [
              {
                href: "/transmandu/compras/requisiciones",
                label: "Requisiciones",
                active: pathname.includes("/transmandu/compras/requisiciones"),
                icon: ClipboardList,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
              },
              {
                href: "/transmandu/compras/cotizaciones",
                label: "Cotizaciones",
                active: pathname.includes("/transmandu/compras/cotizaciones"),
                icon: HandCoins,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
              },
              {
                href: "/transmandu/compras/ordenes_compra",
                label: "Ordenes de Compra",
                active: pathname.includes("/transmandu/compras/ordenes_compra"),
                icon: Receipt,
                roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Sistema",
            menus: [
              {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios Y Permisos",
                active: pathname.includes("/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/usuarios_permisos/usuarios",
                    label: "Administrar Usuarios",
                    active: pathname === "/sistema/usuarios_permisos/usuarios",
                  },
                  {
                    href: "/sistema/usuarios_permisos/roles",
                    label: "Administrar Roles",
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
                href: "/sistema/empresas/empleados",
                label: "Empleados",
                active: pathname.includes("/sistema/empresas/empleados"),
                icon: User2,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/empresas/empleados",
                    label: "Administrar Empleados",
                    active: pathname === "/sistema/empresas/empleados",
                  },
                  {
                    href: "/sistema/empresas/cargos",
                    label: "Administrar Cargos",
                    active: pathname === "/sistema/empresas/cargos",
                  },
                  {
                    href: "/sistema/empresas/departamentos",
                    label: "Administrar Departamentos",
                    active: pathname === "/sistema/empresas/departamentos",
                  },
                  {
                    href: "/sistema/empresas/departamentos",
                    label: "Administrar Almacenes",
                    active: pathname === "/sistema/empresas/almacenes",
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
                  {
                    href: "/ajustes/unidades",
                    label: "Unidades",
                    active: pathname === "/ajustes/unidades",
                  },
                  {
                    href: "/ajustes/fabricantes",
                    label: "Fabricantes",
                    active: pathname === "/ajustes/fabricantes",
                  },
                  {
                    href: "/ajustes/proveedores",
                    label: "Proveedores",
                    active: pathname === "/ajustes/proveedores",
                  },
                  {
                    href: "/ajustes/condiciones",
                    label: "Condiciones",
                    active: pathname === "/ajustes/condiciones",
                  },
                  {
                    href: "/ajustes/globales/fuentes_informacion",
                    label: "Fuentes de Información",
                    active:
                      pathname === "/ajustes/globales/fuentes_informacion",
                  },
                ],
              },
              {
                href: "/ajustes/cuentas_bancos",
                label: "Cuentas y Bancos",
                active: pathname.includes("/ajustes"),
                icon: UserRoundCog,
                roles: [
                  "ANALISTA_ADMINISTRACION",
                  "JEFE_ADMINISTRACION",
                  "JEFE_CONTADURIA",
                  "RRHH_ADMINISTRACION",
                  "ANALISTA_COMPRAS",
                  "JEFE_COMPRAS",
                  "SUPERUSER",
                ],
                submenus: [],
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
          {
            groupLabel: "Settings",
            menus: [
              {
                href: "/cuenta",
                label: "Cuenta",
                active: pathname.includes("/cuenta"),
                icon: Settings,
                roles: [],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Desarrollo",
            menus: [
              {
                href: "/transmandu/desarrollo",
                label: "Actividades",
                active: pathname.includes("/transmandu/desarrollo"),
                icon: SquarePen,
                roles: ["ANALISTA_DESARROLLO", "JEFE_DESARROLLO", "SUPERUSER"],
                submenus: [
                  {
                    href: `/transmandu/desarrollo/actividades_diarias/registro/${date}/`,
                    label: "Registro de Actividades",
                    active:
                      pathname ===
                      `/transmandu/desarrollo/actividades_diarias/registro/`,
                  },
                  {
                    href: "/transmandu/desarrollo/actividades_diarias",
                    label: "Gestion de Actividades",
                    active:
                      pathname ===
                      `/transmandu/desarrollo/actividades_diarias/`,
                  },
                ],
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
                  "ANALISTA_ADMINISTRACION",
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
            groupLabel: "Ingenieria",
            menus: [
              {
                href: "/hangar74/ingenieria/certificados",
                label: "Certificados",
                active: pathname.includes("/hangar74/ingenieria/certificados"),
                icon: Award,
                roles: ["SUPERUSER"],
                submenus: [],
              },
              {
                href: "/hangar74/general/requisiciones/nueva_requisicion",
                label: "Requisiciones",
                active: pathname.includes(
                  "/hangar74/general/requisiciones/nueva_requisicion"
                ),
                icon: ScrollText,
                roles: ["SUPERUSER"],
                submenus: [],
              },
            ],
          },
          {
            groupLabel: "Sistema",
            menus: [
              {
                href: "/sistema/usuarios_permisos",
                label: "Usuarios Y Permisos",
                active: pathname.includes("/sistema/usuarios_permisos"),
                icon: User2,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/usuarios_permisos/usuarios",
                    label: "Administrar Usuarios",
                    active: pathname === "/sistema/usuarios_permisos/usuarios",
                  },
                  {
                    href: "/sistema/usuarios_permisos/roles",
                    label: "Administrar Roles",
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
                href: "/sistema/empresas/empleados",
                label: "Empleados",
                active: pathname.includes("/sistema/empresas/empleados"),
                icon: User2,
                roles: ["ADMIN", "SUPERUSER"],
                submenus: [
                  {
                    href: "/sistema/empresas/empleados",
                    label: "Administrar Empleados",
                    active: pathname === "/sistema/empresas/empleados",
                  },
                  {
                    href: "/sistema/empresas/cargos",
                    label: "Administrar Cargos",
                    active: pathname === "/sistema/empresas/cargos",
                  },
                  {
                    href: "/sistema/empresas/departamentos",
                    label: "Administrar Departamentos",
                    active: pathname === "/sistema/empresas/departamentos",
                  },
                  {
                    href: "/sistema/empresas/departamentos",
                    label: "Administrar Almacenes",
                    active: pathname === "/sistema/empresas/almacenes",
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
                  href: "/ajustes/globales/clientes",
                  label: "Clientes",
                  active: pathname === "/ajustes/globales/clientes",
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
              href: "/ajustes/cuenta",
              label: "Cuenta",
              active: pathname.includes("/ajustes/cuenta"),
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
              label: "Usuarios Y Permisos",
              active: pathname.includes("/sistema/usuarios_permisos"),
              icon: User2,
              roles: ["ADMIN", "SUPERUSER"],
              submenus: [
                {
                  href: "/sistema/usuarios_permisos/usuarios",
                  label: "Administrar Usuarios",
                  active: pathname === "/sistema/usuarios_permisos/usuarios",
                },
                {
                  href: "/sistema/usuarios_permisos/roles",
                  label: "Administrar Roles",
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
              href: "/sistema/empresas/empleados",
              label: "Empleados",
              active: pathname.includes("/sistema/empresas/empleados"),
              icon: User2,
              roles: ["ADMIN", "SUPERUSER"],
              submenus: [
                {
                  href: "/sistema/empresas/empleados",
                  label: "Administrar Empleados",
                  active: pathname === "/sistema/empresas/empleados",
                },
                {
                  href: "/sistema/empresas/cargos",
                  label: "Administrar Cargos",
                  active: pathname === "/sistema/empresas/cargos",
                },
                {
                  href: "/sistema/empresas/departamentos",
                  label: "Administrar Departamentos",
                  active: pathname === "/sistema/empresas/departamentos",
                },
              {
                  href: "/sistema/empresas/departamentos",
                  label: "Administrar Almacenes",
                  active: pathname === "/sistema/empresas/almacenes",
                },
              ],
            },
          ],
        },
      ]
  )
    .map((group) => {
      // Filter menus within each group
      const filteredMenus = group.menus
        .filter((menu) => hasAccess(menu))
        .map((menu) => {
          // Filter submenus within each menu
          const filteredSubmenus = menu.submenus.filter((submenu) =>
            hasAccess(submenu)
          );
          return { ...menu, submenus: filteredSubmenus };
        });

      return { ...group, menus: filteredMenus };
    })
    .filter((group) => group.menus.length > 0);
}
