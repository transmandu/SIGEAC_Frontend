import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const priorityLabel = (priority?: string) => {
  switch (priority) {
    case 'LOW':
      return 'Baja'
    case 'MEDIUM':
      return 'Media'
    case 'HIGH':
      return 'Alta'
    default:
      return '—'
  }
}

export const articleStatusUI = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pendiente',
        className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200 select-none',
      };

    case 'APPROVED':
      return {
        label: 'Aprobado',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200 select-none',
      };

    case 'PARTIAL':
      return {
        label: 'Parcial',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200 select-none',
      };

    case 'REJECTED':
      return {
        label: 'Rechazado',
        className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200 select-none',
      };

    default:
      return {
        label: '—',
        className: 'select-none',
      };
  }
};

export const statusBadgeCls = (status?: string) => {
  const process =
    status === 'PROCESO' ||
    status === 'COTIZADO'

  const approved = status === 'APROBADA'

  return [
    "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none",
    process &&
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200 select-none",
    approved &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200 select-none",
    !process &&
      !approved &&
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200 select-none",
  ].filter(Boolean).join(' ')
}

export const requisitionTypeLabel = (type?: string) => {
  switch (type) {
    case 'AERONAUTICAL':
      return 'material aeronáutico'

    case 'STOCK':
      return 'material de re-stock'

    default:
      return 'uso general'
  }
}

export const formatSolicitudDate = (date?: string | Date | null): string | undefined => {
  if (!date) return undefined;

  const d = typeof date === 'string' ? new Date(date) : date;

  const day = format(d, 'dd');
  const month = format(d, 'MMMM', { locale: es }).toUpperCase();
  const year = format(d, 'yyyy');

  return `${day} ${month} ${year}`;
};