import { WAREHOUSE_ROLES } from "@/lib/inventory-access";
import type { Group, MenuContext } from "@/lib/menus/types";
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
}: MenuContext): Group {
  const inventoryHref = `/${currentCompany?.slug}/general/inventario_articulos`;

  return {
    groupLabel: "General",
    menus: [
      {
        href: `/${currentCompany?.slug}/general/calendario`,
        label: "Calendario de Eventos",
        active: pathname === `/${currentCompany?.slug}/general/calendario`,
        icon: CalendarRange,
        roles: [],
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/general/cursos`,
        label: "Cursos",
        roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
        active: pathname === `/${currentCompany?.slug}/general/cursos`,
        icon: Presentation,
        submenus: [
          {
            href: `/${currentCompany?.slug}/general/cursos/calendario`,
            label: "Calendario",
            active:
              pathname === `/${currentCompany?.slug}/general/cursos/calendario`,
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
          {
            href: `/${currentCompany?.slug}/sms/certificados`,
            label: "Certificados",
            roles: [],
            active: pathname === `/${currentCompany?.slug}/sms/certificados`,
          },

          {
            href: `/${currentCompany?.slug}/general/cursos/resumen`,
            label: "Resumen",
            roles: [],
            active:
              pathname === `/${currentCompany?.slug}/general/cursos/resumen`,
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
          {
            href: `/acceso_publico/${currentCompany?.slug}/sms`,
            label: "Pagina Principal SMS",
            roles: [],
            active: pathname === `/acceso_publico/${currentCompany?.slug}/sms`,
          },
        ],
      },
      {
        href: inventoryHref,
        label: "Inventario",
        active: pathname.includes(inventoryHref),
        icon: PackageSearch,
        roles: [],
        excludedRoles: [...WAREHOUSE_ROLES],
        submenus: [],
        requiresOmac: true,
      },
      {
        href: `/${currentCompany?.slug}/general/requisiciones`,
        label: "Solicitudes de Compra",
        active: pathname.includes(
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
        active: pathname.includes(`/${currentCompany?.slug}/general/manuales`),
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
        active: pathname.includes(
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
