import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
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

export function buildPlanificationGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
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
        active: isPathWithin(pathname, audit),
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
        active: isPathWithin(pathname, aircrafts),
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
          },
        ],
      },
      {
        href: workOrders,
        label: "Órdenes de Trabajo",
        keywords: ["ot", "work order"],
        requiresTables: ["work_orders"],
        active: isPathWithin(pathname, workOrders),
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
            label: "Gestionar Órdenes",
          },
        ],
      },
      {
        // El contenedor apunta a su única pantalla; antes apuntaba a la de
        // aeronaves y las migajas mandaban a otra sección.
        href: `${flights}/vuelos`,
        label: "Control de Horas Vuelos",
        requiresTables: ["flights"],
        active: isPathWithin(pathname, flights),
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
          },
        ],
      },
      {
        href: maintenance,
        label: "Control de Mantenimiento",
        requiresTables: ["maintenance_controls"],
        active: isPathWithin(pathname, maintenance),
        icon: Wrench,
        requiresOmac: true,
        roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [
          {
            href: maintenance,
            label: "Gestionar",
          },
          {
            href: `${maintenance}/historial`,
            label: "Histórico",
          },
        ],
      },
      {
        href: components,
        label: "Control de Componentes",
        requiresTables: ["component_controls"],
        active: isPathWithin(pathname, components),
        icon: Cog,
        requiresOmac: true,
        roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [
          {
            href: components,
            label: "Gestionar",
          },
        ],
      },
      {
        href: avionics,
        label: "Control de Aviónica",
        requiresTables: ["avionics_controls"],
        active: isPathWithin(pathname, avionics),
        icon: Radio,
        requiresOmac: true,
        roles: ["ANALISTA_PLANIFICACION", "JEFE_PLANIFICACION", "SUPERUSER"],
        submenus: [
          {
            href: avionics,
            label: "Gestionar",
          },
        ],
      },
      {
        href: directives,
        label: "Control de Directivas",
        requiresTables: ["directive_controls"],
        active: isPathWithin(pathname, directives),
        icon: ShieldAlert,
        requiresOmac: true,
        roles: ["SUPERUSER"],
        submenus: [
          {
            href: directives,
            label: "Gestionar",
          },
        ],
      },
    ],
  };
}
