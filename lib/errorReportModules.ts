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
  { value: "OTRO", label: "Otro" },
];

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
