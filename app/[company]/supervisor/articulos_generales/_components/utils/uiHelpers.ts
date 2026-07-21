import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

export const formatSupervisorDate = (date?: string | Date | null): string | undefined => {
  if (!date) return undefined;

  const d = typeof date === 'string' ? new Date(date) : date;

  const day = format(d, 'dd');
  const month = format(d, 'MMMM', { locale: es }).toUpperCase();
  const year = format(d, 'yyyy');

  return `${day} ${month} ${year}`;
};

export const formatSupervisorDateTime = (date?: string | Date | null): string => {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  return `${formatSupervisorDate(d)} · ${format(d, 'HH:mm')}`;
};

/** Cantidades siempre a 2 decimales, para que las columnas alineen en tabular-nums. */
export const formatQuantity = (value: number | string | null | undefined): string =>
  Number(value ?? 0).toFixed(2);
