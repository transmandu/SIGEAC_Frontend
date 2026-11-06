"use client";

import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { formatInstant } from "@/lib/date";

interface Props {
  value: string | Date | null | undefined;
  /** Preset o patrón de date-fns; por defecto fecha y hora. */
  format?: Parameters<typeof formatInstant>[2];
  fallback?: string;
}

/**
 * Un instante (columna datetime) en la zona de la compañía. Existe para las
 * celdas de tabla, que no pueden llamar al hook de la zona por sí solas.
 */
export default function FormattedInstant({ value, format, fallback }: Props) {
  const timeZone = useCompanyTimezone();

  return <>{formatInstant(value, timeZone, format, fallback)}</>;
}
