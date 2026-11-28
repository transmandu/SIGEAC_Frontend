import { isPathWithin } from "@/lib/menus/helpers";
import type { GroupDef, MenuContext } from "@/lib/menus/types";
import {
  AreaChartIcon,
  CalendarClock,
  ClipboardCheck,
  ClipboardPen,
  FileText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Shirt,
} from "lucide-react";

export function buildSmsGroup({
  pathname,
  currentCompany,
}: MenuContext): GroupDef {
  return {
    groupLabel: "SMS",
    moduleValue: "sms",
    menus: [
      {
        href: `/${currentCompany?.slug}/sms/reportes`,
        label: "Reportes",
        requiresTables: ["voluntary_reports"],
        active: isPathWithin(pathname, `/${currentCompany?.slug}/sms/reportes`),
        icon: ClipboardPen,
        roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
        requiresOmac: false,
        submenus: [],
      },
      {
        href: `/${currentCompany?.slug}/sms`,
        label: "Gestión de Reportes",
        requiresTables: ["danger_identifications"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/gestion_reportes`,
        ),
        icon: ShieldAlert,
        roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
        requiresOmac: false,
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/gestion_reportes/peligros_identificados`,
            label: "Peligros Identificados",
            requiresTables: ["danger_identifications"],
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
          {
            href: `/${currentCompany?.slug}/sms/gestion_reportes/planes_de_mitigacion`,
            label: "Planes de Mitigación",
            requiresTables: ["mitigation_plans"],
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
        ],
      },
      {
        href: `/${currentCompany?.slug}/sms`,
        label: "Estadísticas",
        requiresTables: ["voluntary_reports"],
        icon: AreaChartIcon,
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/estadisticas`,
        ),
        roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
        requiresOmac: false,
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/general`,
            label: "General",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/reportes_voluntarios`,
            label: "Reportes Voluntarios",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/reportes_obligatorios`,
            label: "Reportes Obligatorios",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/indicadores_riesgo`,
            label: "Indicadores de Riesgo",
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
          {
            href: `/${currentCompany?.slug}/sms/estadisticas/actividades`,
            label: "Actividades",
            requiresTables: ["sms_activities"],
            roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
          },
        ],
      },
      {
        href: "",
        label: "Aseguramiento de la Calidad",
        requiresTables: ["change_requests"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/aseguramiento_calidad`,
        ),
        icon: ShieldCheck,
        roles: [
          "SUPERUSER",
          "JEFE_SMS",
          "ANALISTA_SMS",
          "COORDINADOR_SMS",
          "GERENTE_SMS",
          "PRESIDENCIA",
        ],
        // La ruta es única para ambos tipos de empresa: adentro, `useIsOmac`
        // decide si se muestran los datos aeronáuticos (OMAC) o los de
        // aerolínea. El menú no necesita distinguirlos.
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/aseguramiento_calidad/gestion_de_cambio`,
            label: "Gestión de Cambio",
            roles: [
              "SUPERUSER",
              "JEFE_SMS",
              "ANALISTA_SMS",
              "COORDINADOR_SMS",
              "GERENTE_SMS",
              "PRESIDENCIA",
            ],
          },
        ],
      },
      {
        href: "",
        label: "Promoción de la Seguridad Operacional",
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/promocion`,
        ),
        icon: CalendarClock,
        roles: [
          "SUPERUSER",
          "JEFE_SMS",
          "ANALISTA_SMS",
          "COORDINADOR_SMS",
          "GERENTE_SMS",
          "PRESIDENCIA",
        ],
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/promocion/actividades/calendario`,
            label: "Calendario Actividades",
            requiresTables: ["sms_activities"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
            requiresOmac: false,
          },
          {
            href: `/${currentCompany?.slug}/sms/promocion/actividades`,
            label: "Actividades",
            requiresTables: ["sms_activities"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
          {
            href: `/${currentCompany?.slug}/sms/promocion/capacitacion_personal`,
            label: "Capacitación",
            requiresTables: ["sms_training_groups"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
            requiresOmac: false,
          },
          {
            href: `/${currentCompany?.slug}/sms/promocion/minutas_reunion`,
            label: "Minutas de Reunión",
            requiresTables: ["meeting_minutes"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
        ],
      },
      {
        href: "",
        label: "Gestión de Encuestas",
        requiresTables: ["surveys"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/gestion_encuestas`,
        ),
        icon: ClipboardCheck,
        roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
        requiresOmac: false,
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/gestion_encuestas/crear`,
            label: "Crear",
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
          {
            href: `/${currentCompany?.slug}/sms/gestion_encuestas/encuestas`,
            label: "Lista",
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
        ],
      },
      {
        href: "",
        label: "Ajustes SMS",
        active: isPathWithin(pathname, `/${currentCompany?.slug}/sms/ajustes`),
        icon: Settings,
        roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
        requiresOmac: false,
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/ajustes/encuesta`,
            label: "Encuesta",
            requiresTables: ["surveys"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
          {
            href: `/${currentCompany?.slug}/sms/ajustes/boletin`,
            label: "Boletines",
            requiresTables: ["safety_bulletins"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
          {
            href: `/${currentCompany?.slug}/sms/ajustes/matriz_simulacro_mesa`,
            label: "Matriz de Simulacro de Mesa",
            requiresTables: ["drill_matrix_criteria"],
            roles: ["SUPERUSER", "JEFE_SMS", "ANALISTA_SMS"],
          },
        ],
      },
      {
        href: `/${currentCompany?.slug}/sms/aeronautical`,
        label: "Gestión de Riesgos",
        requiresTables: ["risk_assessments"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/aeronautical/gestion_de_riesgos`,
        ),
        icon: ShieldAlert,
        requiresOmac: true,
        roles: [
          "COORDINADOR_SMS",
          "GERENTE_SMS",
          "SUPERUSER",
          "PRESIDENCIA",
          "COORDINADOR_SMS",
          "ANALISTA_SMS",
        ],
        submenus: [
          {
            href: `/${currentCompany?.slug}/sms/aeronautical/gestion_de_riesgos/reportes`,
            label: "Reportes",
            requiresTables: ["voluntary_reports"],
            roles: [
              "COORDINADOR_SMS",
              "GERENTE_SMS",
              "SUPERUSER",
              "PRESIDENCIA",
              "COORDINADOR_SMS",
              "ANALISTA_SMS",
            ],
          },
          {
            href: `/${currentCompany?.slug}/sms/aeronautical/gestion_de_riesgos/identificacion`,
            label: "Identificación de Peligros",
            roles: [
              "COORDINADOR_SMS",
              "GERENTE_SMS",
              "SUPERUSER",
              "PRESIDENCIA",
              "COORDINADOR_SMS",
              "ANALISTA_SMS",
            ],
          },
          {
            href: `/${currentCompany?.slug}/sms/aeronautical/gestion_de_riesgos/evaluacion_mitigacion`,
            label: "Evaluación y Mitigación",
            roles: [
              "COORDINADOR_SMS",
              "GERENTE_SMS",
              "SUPERUSER",
              "PRESIDENCIA",
              "COORDINADOR_SMS",
              "ANALISTA_SMS",
            ],
          },
        ],
      },
      {
        href: `/${currentCompany?.slug}/sms/uniformes`,
        label: "Uniformes",
        requiresTables: ["uniform_items"],
        active: isPathWithin(
          pathname,
          `/${currentCompany?.slug}/sms/uniformes`,
        ),
        icon: Shirt,
        roles: ["ANALISTA_SMS", "JEFE_SMS", "SUPERUSER"],
        requiresOmac: false,
        submenus: [],
      },
    ],
  };
}
