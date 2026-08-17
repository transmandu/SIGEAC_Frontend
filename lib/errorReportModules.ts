/**
 * Controla si el usuario normal ve los puntos de entrada a reportes: el botón
 * del navbar y "Mis Reportes" en el menú Perfil. La gestión (`/sistema/reportes`)
 * es aparte y sigue siendo solo de SUPERUSER.
 */
export const ERROR_REPORT_VISIBLE_TO_NORMAL_USERS = true;

export const ERROR_REPORT_MODULES = [
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "INGENIERIA", label: "Ingeniería" },
  { value: "CALIDAD", label: "Calidad" },
  { value: "ALMACEN", label: "Almacén" },
  { value: "COMPRAS", label: "Compras" },
  { value: "PLANIFICACION", label: "Planificación" },
  { value: "ADMINISTRACION", label: "Administración" },
  { value: "SMS", label: "SMS" },
  { value: "CURSO", label: "Curso" },
  { value: "GENERAL", label: "General" },
  { value: "AJUSTES", label: "Ajustes" },
  { value: "PERFIL", label: "Perfil" },
  { value: "SISTEMA", label: "Sistema" },
  { value: "OTRO", label: "Otro" },
];

/**
 * Los módulos de empresa (`Company.modules[].value`, los mismos que gatean el
 * sidebar en `lib/menus/helpers.ts`) usan claves en inglés. Este mapa los
 * traduce a los valores de `ERROR_REPORT_MODULES`.
 */
const COMPANY_MODULE_TO_ERROR_REPORT_MODULE: Record<string, string> = {
  warehouse: "ALMACEN",
  maintenance: "MANTENIMIENTO",
  engineering: "INGENIERIA",
  quality_control: "CALIDAD",
  purchases: "COMPRAS",
  administration: "ADMINISTRACION",
  planification: "PLANIFICACION",
  sms: "SMS",
};

/**
 * Módulos que siempre deben poder reportarse: no están gateados por ningún
 * módulo de empresa (ver grupos sin `moduleValue` en `lib/menus/general.ts`).
 */
const ALWAYS_AVAILABLE_ERROR_REPORT_MODULES = ["GENERAL", "AJUSTES", "PERFIL", "SISTEMA", "OTRO"];

/**
 * Filtra `ERROR_REPORT_MODULES` a los módulos habilitados para la empresa
 * seleccionada (`Company.modules`, la misma fuente que gatea el sidebar),
 * más los módulos genéricos que siempre deben estar disponibles. Si la
 * empresa no tiene módulos cargados, se devuelve la lista completa para no
 * bloquear el formulario.
 */
export function getAvailableErrorReportModules(companyModules?: { value: string }[]) {
  if (!companyModules || companyModules.length === 0) {
    return ERROR_REPORT_MODULES;
  }

  const allowedValues = new Set(
    companyModules
      .map((module) => COMPANY_MODULE_TO_ERROR_REPORT_MODULE[module.value])
      .filter((value): value is string => Boolean(value))
  );

  return ERROR_REPORT_MODULES.filter(
    (option) =>
      allowedValues.has(option.value) ||
      ALWAYS_AVAILABLE_ERROR_REPORT_MODULES.includes(option.value)
  );
}

/** Deduce el módulo por defecto de un usuario a partir del nombre de sus roles (p. ej. "JEFE_ALMACEN" -> "ALMACEN"). */
export function getDefaultErrorReportModule(roles?: { name: string }[]): string | undefined {
  const roleNames = roles?.map((role) => role.name) ?? [];
  if (roleNames.length === 0) return undefined;

  const hasKeyword = (keyword: string) => roleNames.some((name) => name.includes(keyword));

  const orderedKeywords = [
    "SMS",
    "ALMACEN",
    "CALIDAD",
    "COMPRAS",
    "PLANIFICACION",
    "ADMINISTRACION",
    "MANTENIMIENTO",
    "INGENIERIA",
    "CURSO",
  ];

  const matchedKeyword = orderedKeywords.find(hasKeyword);
  if (!matchedKeyword) return undefined;

  return ERROR_REPORT_MODULES.find((module) => module.value === matchedKeyword)?.value;
}
