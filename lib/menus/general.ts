import { WAREHOUSE_ROLES } from "@/lib/inventory-access";
import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import {
  CalendarRange,
  CircleDollarSign,
  ClipboardList,
  PackageSearch,
  Presentation,
  ShieldCheck,
  BookCheck,
  BookOpen,
} from "lucide-react";

export function buildGeneralGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  const inventoryHref = `/${currentCompany?.slug}/general/inventario_articulos`;

  return {
    groupLabel: "General",
    menus: [
      {
        href: `/${currentCompany?.slug}/general/calendario`,
        label: "Calendario de Eventos",
        requiresTables: ["calendar_events"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/general/calendario`,
        ),
        icon: CalendarRange,
        roles: [],
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/general/cursos`,
        label: "Cursos",
        requiresTables: ["courses"],
        roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/general/cursos`,
        ),
        icon: Presentation,
        submenus: [
          {
            href: `/${currentCompany?.slug}/general/cursos/calendario`,
            label: "Calendario",
          },
          {
            href: `/${currentCompany?.slug}/general/cursos`,
            label: "Cursos",
            requiresTables: ["courses"],
          },
          {
            href: `/${currentCompany?.slug}/general/cursos/matriz-capacitacion`,
            label: "Programación de Personal Aeronáutico",
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
          {
            href: `/${currentCompany?.slug}/general/cursos/estadisticas`,
            label: "Estadísticas",
          },
          {
            href: `/${currentCompany?.slug}/sms/certificados`,
            label: "Certificados",
            requiresTables: ["certificates"],
            roles: [],
          },

          {
            href: `/${currentCompany?.slug}/general/cursos/resumen`,
            label: "Resumen",
            roles: [],
          },
        ],
      },
      {
        href: `/${currentCompany?.slug}/general/reporte`,
        label: "SMS",
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/general/reporte`,
        ),
        icon: ShieldCheck,
        roles: [],
        submenus: [
          {
            href: `/${currentCompany?.slug}/general/reporte/voluntario`,
            label: "Reporte Voluntario",
            requiresTables: ["voluntary_reports"],
            roles: [],
          },
          {
            href: `/${currentCompany?.slug}/general/reporte/obligatorio`,
            label: "Reporte Obligatorio",
            requiresTables: ["obligatory_reports"],
            roles: [],
          },
          {
            href: `/${currentCompany?.slug}/general/reporte/codigos_qr`,
            label: "Códigos QR",
            roles: [],
          },
          {
            href: `/acceso_publico/${currentCompany?.slug}/sms`,
            label: "Página Principal SMS",
            roles: [],
          },
        ],
      },
      {
        href: inventoryHref,
        label: "Inventario",
        requiresTables: ["articles"],
        active: isPathWithin(pathname, inventoryHref),
        icon: PackageSearch,
        roles: [],
        excludedRoles: [...WAREHOUSE_ROLES],
        submenus: [],
        requiresOmac: true,
      },
      {
        href: `/${currentCompany?.slug}/general/requisiciones`,
        label: "Solicitudes de Compra",
        requiresTables: ["requisition_orders"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/general/requisiciones`,
        ),
        icon: ClipboardList,
        roles: [
          "SUPERUSER",
          "JEFE_ALMACEN",
          "ANALISTA_ALMACEN",
          "JEFE_MANTENIMIENTO",
          "ENGINEERING",
        ],
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/general/manuales`,
        label: "Manuales de Mtto.",
        requiresTables: ["maintenance_catalog_manuals"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/general/manuales`,
        ),
        icon: BookOpen,
        moduleValue: [
          "planification",
          "engineering",
          "quality_control",
          "maintenance",
        ],
        roles: [
          "SUPERUSER",
          "ENGINEERING",
          "JEFE_PLANIFICACION",
          "ANALISTA_PLANIFICACION",
          "JEFE_CONTROL_CALIDAD",
          "JEFE_MANTENIMIENTO",
        ],
        requiresOmac: true,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/general/biblioteca`,
        label: "Biblioteca Digital",
        requiresTables: ["library_documents"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/general/biblioteca`,
        ),
        icon: BookCheck,
        roles: [],
        submenus: [],
        requiresOmac: false,
      },
    ],
  };
}
