"use client";

import { useCompanySettings } from "@/hooks/general/useCompanySettings";
import { DEFAULT_TIMEZONE, formatInstant } from "@/lib/date";

/** Un instante UTC del servidor en la zona de la compañía. */
export function Instant({
  value,
  fallback = "Nunca",
}: {
  value: string | null;
  fallback?: string;
}) {
  const { data: settings } = useCompanySettings();

  return (
    <>
      {formatInstant(
        value,
        settings?.timezone ?? DEFAULT_TIMEZONE,
        "dd/MM/yyyy HH:mm",
        fallback,
      )}
    </>
  );
}
