"use client";

import { Company } from "@/types";
import { format } from "date-fns";
import {
  AreaChartIcon,
  Blocks,
  BookCheck,
  BookUser,
  Boxes,
  Building2,
  CalendarClock,
  CalendarFold,
  ClipboardCheck,
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
  PackageSearch,
  Plane,
  PlaneIcon,
  Presentation,
  Receipt,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
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
            "ANALISTA_SMS",
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
          label: "SMS",
          active: pathname.includes(`/${currentCompany?.slug}/reporte`),
          icon: ShieldCheck,
          roles: [],
          submenus: [
            {
              href: `/${currentCompany?.slug}/general/reporte/pagina_de_sms`,
              label: "Pagina de SMS",
              roles: [],
              active:
                pathname ===
                `/${currentCompany?.slug}/general/reporte/pagina_de_sms`,
            },
            {
              href: `/${currentCompany?.slug}/general/reporte/voluntario`,
              label: "Reporte Voluntario",
              roles: [],
              active:
                pathname ===
                `/${currentCompany?.slug}/general/reporte/voluntario`,
            },
            {
              href: `/${currentCompany?.slug}/general/reporte/obligatorio`,
              label: "Reporte Obligatorio",
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
          href: `/${currentCompany?.slug}/general/inventario_articulos`,
          label: "Inventario",
          active: pathname.includes(
            `/${currentCompany?.slug}/general/inventario_articulos`
          ),
          icon: PackageSearch,
          roles: [
            "SUPERUSER",
            "ANALISTA_COMPRAS",
            "ANALISTA_PLANIFICACION",
            "JEFE_PLANIFICACION",
            "ANALISTA_ADMINISTRACION",
            "RRHH_ADMINISTRACION",
            "JEFE_ADMINISTRACION",
            "CONTADOR_ADMINISTRACION",
            "TESTER",
            "ENGINEERING",
            "TECNICO_MANTENIMIENTO_AERONAUTICO",
            "JEFE_MANTENIMIENTO",
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
            "JEFE_DESARROLLO",
            "ANALISTA_DESARROLLO",
            "JEFE_PLANIFICACION",
            "ANALISTA_PLANIFICACION",
            "JEFE_MANTENIMIENTO",
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
          href: `/${currentCompany?.slug}/sms/reportes`,
          label: "Reportes",
          active: pathname.includes(`/${currentCompany?.slug}/sms/reportes`),
          icon: ClipboardPen,
          roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          submenus: [],
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
          label: "Promoción",
          active: pathname.includes(`/${currentCompany?.slug}/sms/promocion`),
          icon: CalendarClock,
          roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/promocion/actividades/calendario`,
              label: "Calendario Actividades",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/promocion/actividades/calendario`,
            },
            {
              href: `/${currentCompany?.slug}/sms/promocion/actividades`,
              label: "Actividades",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/promocion/actividades`,
            },
            {
              href: `/${currentCompany?.slug}/sms/promocion/capacitacion_personal`,
              label: "Capacitación",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/promocion/capacitacion_personal`,
            },
            // {
            //   href: `/${currentCompany?.slug}/sms/promocion/boletines`,
            //   label: "Boletines",
            //   roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
            //   active:
            //     pathname ===
            //     `/${currentCompany?.slug}/sms/promocion/boletines`,
            // },
          ],
        },
        {
          href: "",
          label: "Gestión de Encuestas",
          active: pathname.includes(
            `/${currentCompany?.slug}/sms/gestion_encuestas`
          ),
          icon: ClipboardCheck,
          roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/gestion_encuestas/crear`,
              label: "Crear",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/gestion_encuestas/crear`,
            },
            {
              href: `/${currentCompany?.slug}/sms/gestion_encuestas/encuestas`,
              label: "Lista",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname ===
                `/${currentCompany?.slug}/sms/gestion_encuestas/encuestas`,
            },
          ],
        },
        {
          href: "",
          label: "Ajustes SMS",
          active: pathname.includes(`/${currentCompany?.slug}/sms/ajustes`),
          icon: Settings,
          roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/sms/ajustes/encuesta`,
              label: "Encuesta",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname === `/${currentCompany?.slug}/sms/ajustes/encuesta`,
            },
            {
              href: `/${currentCompany?.slug}/sms/ajustes/boletin`,
              label: "Boletines",
              roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
              active:
                pathname === `/${currentCompany?.slug}/sms/ajustes/boletin`,
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
    // {
    //   groupLabel: "Carga Administrativa",
    //   moduleValue: "warehouse",
    //   menus: [
    //     {
    //       href: "",
    //       label: "Control de Ingreso",
    //       active: pathname.includes(
    //         `/${currentCompany?.slug}/almacen/inventario/ingreso`
    //       ),
    //       icon: PackagePlus,
    //       roles: [
    //         "ANALISTA_ALMACEN",
    //         "ANALISTA_COMPRAS",
    //         "SUPERUSER",
    //         "JEFE_ALMACEN",
    //       ],
    //       submenus: [
    //         {
    //           href: `/${currentCompany?.slug}/almacen/ingreso/registrar_ingreso`,
    //           label: "Ingreso de Articulo",
    //           active:
    //             pathname ===
    //             `/${currentCompany?.slug}/almacen/ingreso/registrar_ingreso`,
    //         },
    //         // {
    //         //   href: `/${currentCompany?.slug}/almacen/ingreso/en_transito`,
    //         //   label: "Articulos en Tránsito",
    //         //   active: pathname === `/${currentCompany?.slug}/almacen/ingreso/en_transito`
    //         // },
    //         // {
    //         //   href: `/${currentCompany?.slug}/almacen/ingreso/en_recepcion`,
    //         //   label: "Articulos en Recepción",
    //         //   active: pathname === `/${currentCompany?.slug}/almacen/ingreso/en_recepcion`
    //         // },
    //       ],
    //     },
    //   ],
    // },
    {
      groupLabel: "Almacen",
      moduleValue: "warehouse",
      menus: [
        {
          href: `/${currentCompany?.slug}/almacen/ingresar_inventario`,
          label: "Ingreso de Inventario",
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/ingresar_inventario`
          ),
          icon: Boxes,
          roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/almacen/inventario_articulos`,
          label: "Inventario",
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/inventario`
          ),
          icon: PackageOpen,
          roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
          submenus: [
            {
              href: `/${currentCompany?.slug}/almacen/inventario_articulos`,
              label: "Gestión",
              active:
                pathname ===
                `/${currentCompany?.slug}/almacen/inventario_articulos`,
            },
            {
              href: `/${currentCompany?.slug}/almacen/inventario_articulos/entregado`,
              label: "Entregado",
              active:
                pathname ===
                `/${currentCompany?.slug}/almacen/inventario_articulos/entregado`,
            },
          ],
        },
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
          href: `/${currentCompany?.slug}/almacen/gestion_cantidad_general`,
          label: "Gestión de Cantidades",
          roles: ["ANALISTA_ALMACEN", "JEFE_ALMACEN", "SUPERUSER"],
          active: pathname.includes(
            `/${currentCompany?.slug}/almacen/gestion_cantidad_general`
          ),
          icon: SquarePen,
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
          roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
          submenus: [],
        },
        {
          href: `/${currentCompany?.slug}/planificacion/ordenes_trabajo`,
          label: "Ordenes de Trabajo",
          active: pathname.includes(
            `/${currentCompany?.slug}/planificacion/ordenes_trabajo`
          ),
          icon: SquarePen,
          roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
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
          ],
        },
        {
          href: `/${currentCompany?.slug}/planificacion/aeronaves`,
          label: "Control de Horas Vuelos",
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
          href: `/${currentCompany?.slug}/ingenieria/confirmar_inventario`,
          label: "Confirmar Inventario",
          active: pathname.includes(
            `/${currentCompany?.slug}/ingenieria/confirmar_inventario`
          ),
          icon: ClipboardCheck,
          roles: ["SUPERUSER", "ENGINEERING"],
          submenus: [],
        },
        // {
        //   href: `/${currentCompany?.slug}/ingenieria/certificados`,
        //   label: "Certificados",
        //   active: pathname.includes(
        //     `/${currentCompany?.slug}/ingenieria/certificados`
        //   ),
        //   icon: Award,
        //   roles: ["SUPERUSER"],
        //   submenus: [],
        // },
        // {
        //   href: `/${currentCompany?.slug}/ingenieria/requisiciones/nueva_requisicion`,
        //   label: "Solicitudes de Compra",
        //   active: pathname.includes(
        //     `/${currentCompany?.slug}/ingenieria/requisiciones/nueva_requisicion`
        //   ),
        //   icon: ScrollText,
        //   roles: ["SUPERUSER", "ENGINEERING"],
        //   submenus: [],
        // },
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
          roles: [],
          submenus: [
            {
              href: "/ajustes/globales/unidades",
              label: "Unidades",
              active: pathname === "/ajustes/globales/unidades",
              roles: [
                "JEFE_ALMACEN",
                "ANALISTA_ALMACEN",
                "SUPERUSER",
                "ENGINEERING",
              ],
            },
            {
              href: "/ajustes/globales/fabricantes",
              label: "Fabricantes",
              active: pathname === "/ajustes/globales/fabricantes",
              roles: [
                "JEFE_ALMACEN",
                "ANALISTA_ALMACEN",
                "JEFE_PLANIFICACION",
                "ANALISTA_PLANIFICACION",
                "SUPERUSER",
              ],
            },
            {
              href: "/ajustes/globales/proveedores",
              label: "Proveedores",
              active: pathname === "/ajustes/globales/proveedores",
              roles: ["JEFE_COMPRAS", "ANALISTA_COMPRAS", "SUPERUSER"],
            },
            {
              href: "/ajustes/globales/clientes",
              label: "Clientes",
              active: pathname === "/ajustes/globales/clientes",
              roles: [
                "JEFE_ADMINISTRACION",
                "ANALISTA_ADMINISTRACION",
                "SUPERUSER",
              ],
            },
            {
              href: "/ajustes/globales/condiciones",
              label: "Condiciones",
              active: pathname === "/ajustes/globales/condiciones",
              roles: [
                "JEFE_PLANIFICACION",
                "ANALISTA_PLANIFICACION",
                "SUPERUSER",
                "ENGINEERING",
              ],
            },
            {
              href: "/ajustes/globales/fuentes_informacion",
              label: "Fuentes de Informacion",
              active: pathname === "/ajustes/globales/fuentes_informacion",
              roles: ["JEFE_SMS", "ANALISTA_SMS", "SUPERUSER"],
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
            // {
            //   href: "/sistema/usuarios_permisos/permisos",
            //   label: "Administrar Permisos",
            //   active: pathname === "/sistema/usuarios_permisos/permisos",
            // },
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
  const isRestrictedCompany = currentCompany?.id === 2;

  return (
    fullMenu
      // Filtrar grupos por módulo activo
      .filter((group) => isModuleActive(group.moduleValue))
      // Filtrar menús y submenús
      .map((group) => {
        // Filtrar por acceso y módulos primero
        let menus = group.menus.filter(
          (menu) => isModuleActive(menu.moduleValue) && hasRoleAccess(menu)
        );

        // Si es la compañía restringida y el grupo es 'General', solo mostrar 'Inventario'
        if (isRestrictedCompany && group.groupLabel === "General") {
          menus = menus.filter(
            (menu) =>
              menu.label === "Inventario" ||
              menu.label === "Solicitudes de Compra"
          );
        }

        return {
          ...group,
          menus: menus.map((menu) => ({
            ...menu,
            submenus: menu.submenus.filter(
              (sub) => isModuleActive(sub.moduleValue) && hasRoleAccess(sub)
            ),
          })),
        };
      })
      // Eliminar grupos vacíos
      .filter((group) => group.menus.length > 0)
  );
}
