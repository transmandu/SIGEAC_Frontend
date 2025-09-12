"use client";

import { Company } from "@/types";
import { format } from "date-fns";
import {
  AreaChartIcon,
  Award,
  Blocks,
  BookCheck,
  BookUser,
  Building2,
  CalendarClock,
  CalendarFold,
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
  Presentation,
  Receipt,
  ScrollText,
  ShieldAlert,
  SquarePen,
  User2,
  UserRoundCog,
  Wrench,
} from "lucide-react";

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
  // Verificar acceso por rol
  const hasRoleAccess = (menuItem: { roles?: string[] }): boolean => {
    return (
      !menuItem.roles ||
      menuItem.roles.length === 0 ||
      menuItem.roles.some((role) => userRoles.includes(role))
    );
  };

  // Verificar si el módulo está activo para la compañía
  const isModuleActive = (moduleValue?: string): boolean => {
    // Si no requiere módulo específico o no hay compañía seleccionada, está activo
    if (!moduleValue || !currentCompany) return true;
    // Verificar si la compañía tiene este módulo
    return currentCompany.modules.some((m) => m.value === moduleValue);
  };

  const fullMenu: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: `/${currentCompany?.slug}/dashboard`,
          label: "Dashboard",
          active: pathname.includes(`/${currentCompany?.slug}/dashboard`),
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
          href: `/${currentCompany?.slug}/general/cursos`,
          label: "Cursos",
          roles: [
            "JEFE_ADMINISTRACION",
            "SUPERUSER",
            "JEFE_ALMACEN",
            "JEFE_COMPRAS",
            "JEFE_SMS",
            "JEFE_CONTADURIA",
            "JEFE_RRHH",
            "JEFE_OPERACIONES",
            "JEFE_MANTENIMIENTO",
            "JEFE_PLANIFICACION",
          ],
          active: pathname === `/${currentCompany?.slug}/general/cursos`,
          icon: Presentation,
          submenus: [
            {
              href: `/${currentCompany?.slug}/general/cursos/calendario`,
              label: "Calendario",
              active:
                pathname ===
                `/${currentCompany?.slug}/general/cursos/calendario`,
            },
            {
              href: `/${currentCompany?.slug}/general/cursos`,
              label: "Cursos",
              active: pathname === `/${currentCompany?.slug}/general/cursos`,
            },
            {
              href: `/${currentCompany?.slug}/general/cursos/estadisticas`,
              label: "Estadisticas",
              active:
                pathname ===
                `/${currentCompany?.slug}/general/cursos/estadisticas`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/general/reporte`,
          label: "SMS Reportes",
          active: pathname.includes(`/${currentCompany?.slug}/reporte`),
          icon: ClipboardPen,
          roles: [],
          submenus: [
            {
              href: `/${currentCompany?.slug}/general/reporte/voluntario`,
              label: "Voluntario",
              roles: [],
              active:
                pathname ===
                `/${currentCompany?.slug}/general/reporte/voluntario`,
            },
            {
              href: `/${currentCompany?.slug}/general/reporte/obligatorio`,
              label: "Obligatorio",
              roles: [],
              active:
                pathname ===
                `/${currentCompany?.slug}/general/reporte/obligatorio`,
            },
            {
              href: `/${currentCompany?.slug}/general/reporte/codigos_qr`,
              label: "Codigos QR",
              roles: [],
              active:
                pathname ===
                `/${currentCompany?.slug}/general/reporte/codigos_qr`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/general/inventario`,
          label: "Inventario",
          active: pathname.includes(
            `/${currentCompany?.slug}/general/inventario`
          ),
          icon: PackageSearch,
          roles: [
            "SUPERUSER",
            "JEFE_ALMACEN",
            "ANALISTA_ALMACEN",
            "ANALISTA_COMPRAS",
            "ANALISTA_PLANIFICACION",
            "JEFE_PLANIFICACION",
            "JEFE_ALMACENAMIENTO",
            "ANALISTA_ADMINISTRACION",
            "RRHH_ADMINISTRACION",
            "JEFE_ADMINISTRACION",
            "CONTADOR_ADMINISTRACION",
            "TESTER",
            "ENGINEERING",
          ],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/general/requisiciones`,
          label: "Solicitudes de Compra",
          active: pathname.includes(
            `/${currentCompany?.slug}/general/requisiciones`
          ),
          icon: ScrollText,
          roles: [
            "SUPERUSER",
            "JEFE_ALMACEN",
            "ANALISTA_ALMACEN",
            "ANALISTA_COMPRAS",
            "ANALISTA_DESARROLLO",
            "ANALISTA_PLANIFICACION",
            "JEFE_PLANIFICACION",
            "JEFE_ALMACENAMIENTO",
            "ANALISTA_ADMINISTRACION",
            "RRHH_ADMINISTRACION",
            "JEFE_ADMINISTRACION",
            "CONTADOR_ADMINISTRACION",
            "TESTER",
            "ENGINEERING",
          ],
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Desarrollo",
      moduleValue: "development",
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
      groupLabel: "Administración",
      moduleValue: "administration",
      menus: [
        {
          href: `/${currentCompany?.slug}/administracion/creditos`,
          label: "Créditos",
          active: pathname.includes(
            `/${currentCompany?.slug}/administracion/creditos`
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
              href: `/${currentCompany?.slug}/administracion/creditos/credito_arrendamiento`,
              label: "Arrendamiento",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/creditos/credito_arrendamiento`,
            },
            {
              href: `/${currentCompany?.slug}/administracion/creditos/cuentas_por_pagar`,
              label: "Cuentas por Pagar",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/creditos/cuentas_por_pagar`,
            },
            {
              href: `/${currentCompany?.slug}/administracion/creditos/credito_vuelo`,
              label: "Vuelos",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/creditos/credito_vuelo`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/administracion/gestion_cajas`,
          label: "Finanzas",
          active: pathname.includes(
            `/${currentCompany?.slug}/administracion/gestion_cajas`
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
              href: `/${currentCompany?.slug}/administracion/gestion_cajas/categorias`,
              label: "Categorías",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_cajas/categorias`,
            },
            {
              href: `/${currentCompany?.slug}/administracion/gestion_cajas/cajas`,
              label: "Cajas",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_cajas/cajas`,
            },
            {
              href: `/${currentCompany?.slug}/administracion/gestion_cajas/cuentas`,
              label: "Cuentas",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_cajas/cuentas`,
            },
            {
              href: `/${currentCompany?.slug}/administracion/gestion_cajas/movimientos`,
              label: "Movimientos",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_cajas/movimientos`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/administracion/gestion_general`,
          label: "General",
          active: pathname.includes(
            `/${currentCompany?.slug}/administracion/gestion_general`
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
              href: `/${currentCompany?.slug}/administracion/gestion_general/clientes`,
              label: "Clientes",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_general/clientes`,
            },
            {
              href: `/${currentCompany?.slug}/administracion/gestion_general/proveedor`,
              label: "Proveedor",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_general/proveedor`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/administracion/operaciones`,
          label: "Operaciones",
          active: pathname.includes(
            `/${currentCompany?.slug}/administracion/operaciones`
          ),
          icon: PackageOpen,
          roles: [
            "SUPERUSER",
            "ANALISTA_ADMINISTRACION",
            "JEFE_ADMINISTRACION",
          ],
          submenus: [
            {
              href: `/${currentCompany?.slug}/administracion/operaciones/arrendamiento`,
              label: "Arrendamiento",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/operaciones/arrendamiento`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/administracion/gestion_vuelos`,
          label: "Vuelos",
          active: pathname.includes(
            `/${currentCompany?.slug}/administracion/gestion_vuelos`
          ),
          icon: PlaneIcon,
          roles: [
            "SUPERUSER",
            "ANALISTA_ADMINISTRACION",
            "JEFE_ADMINISTRACION",
            "RRHH_ADMINISTRACION",
          ],
          submenus: [
            {
              href: `/${currentCompany?.slug}/administracion/gestion_vuelos/aviones`,
              label: "Aeronaves",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_vuelos/aviones`,
              roles: [
                "SUPERUSER",
                "ANALISTA_ADMINISTRACION",
                "JEFE_ADMINISTRACION",
                "RRHH_ADMINISTRACION",
              ],
            },
            {
              href: `/${currentCompany?.slug}/administracion/gestion_vuelos/rutas`,
              label: "Rutas",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_vuelos/rutas`,
              roles: [
                "SUPERUSER",
                "ANALISTA_ADMINISTRACION",
                "JEFE_ADMINISTRACION",
              ], // RRHH no puede ver Rutas
            },
            {
              href: `/${currentCompany?.slug}/administracion/gestion_vuelos/vuelos`,
              label: "Vuelos",
              active:
                pathname ===
                `/${currentCompany?.slug}/administracion/gestion_vuelos/vuelos`,
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
      moduleValue: "sms",
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
          active: pathname.includes(
            `/${currentCompany?.slug}/sms/gestion_reportes`
          ),
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
          active: pathname.includes(
            `/${currentCompany?.slug}/sms/estadisticas`
          ),
          roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/estadisticas/general`,
              label: "General",
              roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/estadisticas/general`,
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
          label: "Planificación",
          active: pathname.includes(
            `/${currentCompany?.slug}/sms/planificacion`
          ),
          icon: CalendarClock,
          roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/planificacion/actividades/calendario`,
              label: "Calendario Actividades",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/actividades/calendario`,
            },
            {
              href: `/${currentCompany?.slug}/sms/planificacion/actividades`,
              label: "Actividades",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/actividades`,
            },
            {
              href: `/${currentCompany?.slug}/sms/planificacion/capacitacion_personal`,
              label: "Capacitación",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/capacitacion_personal`,
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Compras",
      moduleValue: "purchases",
      menus: [
        {
          href: `/${currentCompany?.slug}/compras/requisiciones`,
          label: "Requisiciones",
          active: pathname.includes(
            `/${currentCompany?.slug}/compras/requisiciones`
          ),
          icon: ClipboardList,
          roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/compras/cotizaciones`,
          label: "Cotizaciones",
          active: pathname.includes(
            `/${currentCompany?.slug}/compras/cotizaciones`
          ),
          icon: HandCoins,
          roles: ["ANALISTA_COMPRAS", "JEFE_COMPRAS", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/compras/ordenes_compra`,
          label: "Ordenes de Compra",
          active: pathname.includes(
            `/${currentCompany?.slug}/compras/ordenes_compra`
          ),
          icon: Receipt,
          roles: [
            "ANALISTA_COMPRAS",
            "JEFE_COMPRAS",
            "SUPERUSER",
            "JEFE_ADMINISTRACION",
          ],
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Carga Administrativa",
      moduleValue: "warehouse",
      menus: [
        {
          href: "",
          label: "Control de Ingreso",
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/inventario/ingreso`
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
              href: `/${currentCompany?.slug}/almacen/ingreso/registrar_ingreso`,
              label: "Ingreso de Articulo",
              active:
                pathname ===
                `/${currentCompany?.slug}/almacen/ingreso/registrar_ingreso`,
            },
            // {
            //   href: `/${currentCompany?.slug}/almacen/ingreso/en_transito`,
            //   label: "Articulos en Tránsito",
            //   active: pathname === `/${currentCompany?.slug}/almacen/ingreso/en_transito`
            // },
            // {
            //   href: `/${currentCompany?.slug}/almacen/ingreso/en_recepcion`,
            //   label: "Articulos en Recepción",
            //   active: pathname === `/${currentCompany?.slug}/almacen/ingreso/en_recepcion`
            // },
          ],
        },
      ],
    },
    {
      groupLabel: "Almacen",
      moduleValue: "warehouse",
      menus: [
        {
          href: "",
          label: "Solicitudes",
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/solicitudes`
          ),
          icon: ClipboardCopy,
          roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/almacen/solicitudes/salida`,
              label: "Salida",
              active:
                pathname ===
                `/${currentCompany?.slug}/almacen/solicitudes/salida`,
            },
            {
              href: `/${currentCompany?.slug}/almacen/solicitudes/pendiente`,
              label: "Pendiente",
              active:
                pathname ===
                `/${currentCompany?.slug}/almacen/solicitudes/pendiente`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/almacen/inventario`,
          label: "Inventario",
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/inventario`
          ),
          icon: PackageOpen,
          roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/almacen/inventario/gestion`,
              label: "Gestión",
              active:
                pathname ===
                  `/${currentCompany?.slug}/almacen/inventario/gestion` ||
                pathname ===
                  `/${currentCompany?.slug}/almacen/inventario/gestion/crear`,
            },
            {
              href: `/${currentCompany?.slug}/almacen/inventario/entregado`,
              label: "Entregado",
              active:
                pathname ===
                `/${currentCompany?.slug}/almacen/inventario/entregado`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/almacen/caja_herramientas`,
          label: "Cajas de Herramientas",
          roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/caja_herramientas`
          ),
          icon: Wrench,
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/almacen/gestion_cantidades`,
          label: "Gestión de Cantidades",
          roles: ["JEFE_ALMACEN", "SUPERUSER"],
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/gestion_cantidades`
          ),
          icon: Wrench,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Planificación",
      moduleValue: "planification",
      menus: [
        {
          href: `/${currentCompany?.slug}/planificacion/calendario`,
          label: "Calendario de Servicios",
          active: pathname.includes(
            `/${currentCompany?.slug}/planificacion/calendario`
          ),
          icon: CalendarFold,
          roles: ["ANALISTA_ADMINISTRACION", "JEFE_PLANIFICACION", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
          label: "Ordenes de Trabajo",
          active: pathname.includes(
            `/${currentCompany?.slug}/planificacion/ordenes_trabajo`
          ),
          icon: SquarePen,
          roles: ["ANALISTA_ADMINISTRACION", "JEFE_PLANIFICACION", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/planificacion/ordenes_trabajo/`,
              label: "Gestionar Ordenes",
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/planificacion/aeronaves`,
          label: "Aeronaves",
          active: pathname.includes(
            `/${currentCompany?.slug}/planificacion/reportes`
          ),
          icon: Plane,
          roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/planificacion/aeronaves`,
              label: "Gestión de Aeronaves",
              active:
                pathname === `/${currentCompany?.slug}/planificacion/aeronaves`,
            },
            {
              href: `/${currentCompany?.slug}/planificacion/aeronaves/partes`,
              label: "Gestión de Partes",
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/aeronaves/partes`,
            },
          ],
        },
        {
          href: `/${currentCompany?.slug}/planificacion/aeronaves`,
          label: "Control de Vuelos",
          active: pathname.includes(
            `/${currentCompany?.slug}/planificacion/control_vuelos`
          ),
          icon: BookCheck,
          roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/planificacion/control_vuelos/vuelos`,
              label: "Vuelos",
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/control_vuelos/vuelos`,
            },
            {
              href: `/${currentCompany?.slug}/planificacion/control_vuelos/reportes`,
              label: "Reportes",
              active:
                pathname ===
                `/${currentCompany?.slug}/planificacion/control_vuelos/reportes`,
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Mantenimiento",
      moduleValue: "maintenance",
      menus: [
        {
          href: `/${currentCompany?.slug}/mantenimiento/servicios`,
          label: "Servicios",
          active: pathname.includes(
            `/${currentCompany?.slug}/mantenimiento/servicios`
          ),
          icon: Drill,
          roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Ingenieria",
      moduleValue: "engineering",
      menus: [
        {
          href: `/${currentCompany?.slug}/ingenieria/certificados`,
          label: "Certificados",
          active: pathname.includes(
            `/${currentCompany?.slug}/ingenieria/certificados`
          ),
          icon: Award,
          roles: ["SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/ingenieria/requisiciones/nueva_requisicion`,
          label: "Solicitudes de Compras",
          active: pathname.includes(
            `/${currentCompany?.slug}/ingenieria/requisiciones/nueva_requisicion`
          ),
          icon: ScrollText,
          roles: ["SUPERUSER"],
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Ajustes",
      menus: [
        {
          href: "/ajustes/globales",
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
              active: pathname === "/ajustes/globales/fabricantes",
            },
            {
              href: "/ajustes/globales/proveedores",
              label: "Proveedores",
              active: pathname === "/ajustes/globales/proveedores",
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
          roles: [
            "SUPERUSER",
            "ANALISTA_ADMINISTRACION",
            "JEFE_ADMINISTRACION",
          ],
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
          href: "/sistema/modulos",
          label: "Módulos",
          active: pathname.includes("/sistema/modulos"),
          icon: Blocks,
          roles: ["ADMIN", "SUPERUSER"],
          submenus: [],
        },
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
          href: "/sistema/empresas/",
          label: "Empresas",
          active: pathname.includes("/sistema/empresas/"),
          icon: Building2,
          roles: ["ADMIN", "SUPERUSER"],
          submenus: [
            {
              href: "/sistema/empresas/empresas",
              label: "Administrar Empresas",
              active: pathname === "/sistema/empresas/empresas",
            },
            {
              href: "/sistema/empresas/ubicaciones",
              label: "Administrar Ubicaciones",
              active: pathname === "/sistema/empresas/ubicaciones",
            },
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
              href: "/sistema/empresas/almacenes",
              label: "Administrar Almacenes",
              active: pathname === "/sistema/empresas/almacenes",
            },
          ],
        },
      ],
    },
  ];

  // 4. Filtrar el menú completo
  return (
    fullMenu
      // Filtrar grupos por módulo activo
      .filter((group) => isModuleActive(group.moduleValue))
      // Filtrar menús y submenús
      .map((group) => ({
        ...group,
        menus: group.menus
          .filter(
            (menu) => isModuleActive(menu.moduleValue) && hasRoleAccess(menu)
          )
          .map((menu) => ({
            ...menu,
            submenus: menu.submenus.filter(
              (sub) => isModuleActive(sub.moduleValue) && hasRoleAccess(sub)
            ),
          })),
      }))
      // Eliminar grupos vacíos
      .filter((group) => group.menus.length > 0)
  );
}
