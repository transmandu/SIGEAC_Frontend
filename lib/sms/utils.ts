export type OrderStatus = "CLOSED" | "IN_PROCESS" | "OPEN" | string;

// Badges soft (borders-only) segun el estado del reporte.
// Ambar reservado para estados intermedios (Proceso/Pendiente/En transito).
// Color = significado, no decoracion.
const BADGE_STYLES: Record<string, string> = {
  CERRADO:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800",
  PROCESO:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  EN_PROCESO:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  PENDIENTE:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  ABIERTO:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
  OPEN: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
};

const DEFAULT_BADGE =
  "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800";

// OBTENER CLASES DE BADGE SEGUN EL ESTADO DEL REPORTE
export const getBadgeStatusClass = (status: OrderStatus): string => {
  const baseClasses =
    "justify-center items-center text-center font-bold font-sans pointer-events-none";
  const colorClass = BADGE_STYLES[status?.toUpperCase()] || DEFAULT_BADGE;

  return `${baseClasses} ${colorClass}`;
};
