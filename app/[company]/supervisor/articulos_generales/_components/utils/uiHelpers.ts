import { cn } from '@/lib/utils';
import { DEFAULT_TIMEZONE, formatInstant, formatLongUpperDate } from '@/lib/date';

/**
 * Lenguaje visual del módulo SUPERVISOR: hereda la estructura del módulo de
 * compras (app/[company]/compras) — badges translúcidos con variante dark,
 * labels micro-tipográficos en mayúsculas, fechas en formato largo — pero se
 * expresa íntegramente en azul cielo.
 *
 * La paleta es deliberadamente monocromática: es una herramienta de saneamiento
 * a la que el supervisor llega cuando el inventario ya está roto, así que la
 * interfaz debe transmitir calma. Nada aquí usa rojo/ámbar de alarma; las
 * distinciones se hacen por intensidad dentro de la misma familia, no por
 * cambio de color.
 */

const DUPLICATE_REASON_LABELS: Record<string, string> = {
  BRAND_MODEL: 'MARCA DISTINTA',
  UNIT: 'UNIDAD DISTINTA',
};

export const reasonLabel = (reason?: string) =>
  DUPLICATE_REASON_LABELS[reason ?? ''] ?? reason ?? '—';

const badgeBase =
  'rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none';

/**
 * Badge del motivo por el que el detector agrupó unos artículos. Ambos motivos
 * comparten la familia sky y se distinguen por intensidad: marca en sky suave
 * (diferencia de escritura, casi siempre fusionable) y unidad en cyan algo más
 * saturado (requiere decidir conversión, merece un punto más de atención).
 */
export const reasonBadgeCls = (reason?: string) => {
  const brand = reason === 'BRAND_MODEL';
  const unit = reason === 'UNIT';

  return cn(
    badgeBase,

    brand &&
      'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 dark:hover:text-sky-200',

    unit &&
      'border-cyan-500/35 bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/18 dark:hover:text-cyan-200'
  );
};

/**
 * Estado de una fusión en el historial. Aplicada en sky (es el estado normal y
 * esperado, no un "éxito" que celebrar) y deshecha en neutro apagado.
 */
export const mergeStatusBadgeCls = (undone: boolean) =>
  cn(
    badgeBase,

    !undone &&
      'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 dark:hover:text-sky-200',

    undone &&
      'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/60'
  );

/**
 * Badge de dependencias (entradas, costos, conversiones, despachos). Neutro a
 * propósito: son datos informativos, no estados que exijan atención.
 */
export const dependencyBadgeCls = () =>
  'rounded-md border border-border/50 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-wide text-muted-foreground shadow-sm select-none';

// Fecha de calendario: se muestra tal cual, sin convertir de zona.
export const formatSupervisorDate = (date?: string | Date | null): string | undefined =>
  formatLongUpperDate(date);

/**
 * Lleva hora, así que es un instante y sí se convierte a la zona de la compañía.
 * Por eso recibe la zona: este archivo no es un componente y no puede leerla.
 */
export const formatSupervisorDateTime = (
  date?: string | Date | null,
  timeZone: string = DEFAULT_TIMEZONE,
): string => {
  if (!date) return '—';

  // Un solo pase en vez de cuatro: el mes se pasa a mayúsculas después.
  const formatted = formatInstant(date, timeZone, "dd|MMMM|yyyy|HH:mm", '');
  if (!formatted) return '—';

  const [day, month, year, time] = formatted.split('|');

  return `${day} ${month.toUpperCase()} ${year} · ${time}`;
};

export { formatQuantity } from '@/lib/utils';
