import type { Group, MenuContext } from "@/lib/menus/types";
import {
  BookCheck,
  ClipboardCheck,
  Cog,
  Plane,
  Radio,
  ShieldAlert,
  SquarePen,
  Wrench,
} from "lucide-react";

/**
 * Pertenece a la sección: la ruta misma o cualquiera de sus sub-rutas (detalle,
 * crear, editar). Con límite de segmento: `/control_mantenimiento` no cubre
 * `/control_mantenimiento_x`.
 */
const isWithin = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export function buildPlanificationGroup({
  pathname,
  currentCompany,
}: MenuContext): Group {
  const base = `/${currentCompany?.slug}/planificacion`;

  const audit = `${base}/auditoria`;
  const aircrafts = `${base}/aeronaves`;
  const workOrders = `${base}/ordenes_trabajo`;
  const flights = `${base}/control_vuelos`;
  const maintenance = `${base}/control_mantenimiento`;
  const components = `${base}/control_componentes`;
  const avionics = `${base}/control_avionica`;
  const directives = `${base}/control_directivas`;

  return {
    groupLabel: "Planificación",
    moduleValue: "planification",
    menus: [
      {
        href: audit,
        label: "Auditoría",
        requiresTables: ["planification_audit_logs"],
        active: isWithin(pathname, audit),
        icon: ClipboardCheck,
        requiresOmac: true,
        // Los mismos roles que el middleware de esas rutas (ver
        // PLANIFICATION_AUDIT_ROLES).
        roles: ["JEFE_CONTROL_CALIDAD", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [],
      },
      {
        href: aircrafts,
        label: "Aeronaves",
        requiresTables: ["aircrafts"],
        active: isWithin(pathname, aircrafts),
        icon: Plane,
        roles: [
          "ANALISTA_PLANIFICACION",
          "JEFE_MANTENIMIENTO",
          "JEFE_PLANIFICACION",
          "SUPERUSER",
        ],
        requiresOmac: true,
        submenus: [
          {
            href: aircrafts,
            label: "Gestión de Aeronaves",
            active: isWithin(pathname, aircrafts),
          },
        ],
      },
      {
        href: workOrders,
        label: "Ordenes de Trabajo",
        keywords: ["ot", "work order"],
        requiresTables: ["work_orders"],
        active: isWithin(pathname, workOrders),
        icon: SquarePen,
        roles: [
          "ANALISTA_PLANIFICACION",
          "JEFE_MANTENIMIENTO",
          "JEFE_PLANIFICACION",
          "SUPERUSER",
        ],
        requiresOmac: true,
        submenus: [
          {
            href: workOrders,
            label: "Gestionar Ordenes",
            active: isWithin(pathname, workOrders),
          },
        ],
      },
      {
        // El contenedor apunta a su única pantalla; antes apuntaba a la de
        // aeronaves y las migajas mandaban a otra sección.
        href: `${flights}/vuelos`,
        label: "Control de Horas Vuelos",
        requiresTables: ["flights"],
        active: isWithin(pathname, flights),
        icon: BookCheck,
        requiresOmac: true,
        roles: [
          "ANALISTA_PLANIFICACION",
          "JEFE_MANTENIMIENTO",
          "JEFE_PLANIFICACION",
          "SUPERUSER",
        ],
        submenus: [
          {
            href: `${flights}/vuelos`,
            label: "Vuelos",
            active: isWithin(pathname, flights),
          },
        ],
      },
      {
        href: maintenance,
        label: "Control de Mantenimiento",
        requiresTables: ["maintenance_controls"],
        active: isWithin(pathname, maintenance),
        icon: Wrench,
        requiresOmac: true,
        roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [
          {
            href: maintenance,
            label: "Gestionar",
            active:
              isWithin(pathname, maintenance) &&
              !isWithin(pathname, `${maintenance}/historial`),
          },
          {
            href: `${maintenance}/historial`,
            label: "Histórico",
            active: isWithin(pathname, `${maintenance}/historial`),
          },
        ],
      },
      {
        href: components,
        label: "Control de Componentes",
        requiresTables: ["component_controls"],
        active: isWithin(pathname, components),
        icon: Cog,
        requiresOmac: true,
        roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [
          {
            href: components,
            label: "Gestionar",
            active: isWithin(pathname, components),
          },
        ],
      },
      {
        href: avionics,
        label: "Control de Aviónica",
        requiresTables: ["avionics_controls"],
        active: isWithin(pathname, avionics),
        icon: Radio,
        requiresOmac: true,
        roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [
          {
            href: avionics,
            label: "Gestionar",
            active: isWithin(pathname, avionics),
          },
        ],
      },
      {
        href: directives,
        label: "Control de Directivas",
        requiresTables: ["directive_controls"],
        active: isWithin(pathname, directives),
        icon: ShieldAlert,
        requiresOmac: true,
        roles: ["SUPERUSER"],
        submenus: [
          {
            href: directives,
            label: "Gestionar",
            active: isWithin(pathname, directives),
          },
        ],
      },
    ],
  };
}
