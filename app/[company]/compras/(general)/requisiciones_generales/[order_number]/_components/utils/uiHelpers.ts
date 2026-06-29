import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const priorityLabel = (priority?: string) => {
  switch (priority) {
    case 'LOW':
      return 'BAJA'
    case 'MEDIUM':
      return 'MEDIA'
    case 'HIGH':
      return 'ALTA'
    default:
      return '—'
  }
}

export const articleStatusUI = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'PENDIENTE',
        className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/15 dark:hover:text-yellow-200 select-none',
      };

    case 'APPROVED':
      return {
        label: 'APROBADO',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200 select-none',
      };

    case 'PARTIAL':
      return {
        label: 'PARCIAL',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200 select-none',
      };

    case 'REJECTED':
      return {
        label: 'RECHAZADO',
        className: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200 select-none',
      };

    default:
      return {
        label: '—',
        className: 'select-none',
      };
  }
};

export const requisitionStatusLabel = (status?: string) => {
  switch (status) {
    case 'CREATED':
      return 'CREADA'
    case 'RECEIVED':
      return 'RECIBIDA'
    case 'IN_PROGRESS':
      return 'EN PROCESO'
    case 'QUOTED':
      return 'COTIZADA'
    case 'APPROVED':
      return 'APROBADA'
    case 'REJECTED':
      return 'RECHAZADA'
    default:
      return status ?? '—'
  }
}

export const statusBadgeCls = (status?: string) => {
  const early =
    status === 'CREATED' ||
    status === 'RECEIVED'

  const process =
    status === 'IN_PROGRESS' ||
    status === 'QUOTED'

  const approved = status === 'APPROVED'

  return [
    "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm transition-colors duration-150 cursor-default hover:scale-100 hover:translate-y-0 select-none",
    early &&
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 dark:hover:text-sky-200 select-none",
    process &&
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 dark:hover:text-amber-200 select-none",
    approved &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 dark:hover:text-emerald-200 select-none",
    !early &&
      !process &&
      !approved &&
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/15 dark:hover:text-red-200 select-none",
  ].filter(Boolean).join(' ')
}

export const requisitionTypeLabel = (type?: string) => {
  switch (type) {
    case 'AERONAUTICAL':
      return 'material aeronáutico'

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