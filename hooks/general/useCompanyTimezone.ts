import { DEFAULT_TIMEZONE } from "@/lib/date";
import { useCompanySettings } from "@/hooks/general/useCompanySettings";

/**
 * La zona con que la compañía lee sus fechas. Mientras no se haya elegido una,
 * se muestra la hora tal como está guardada (UTC) en vez de presumir un país.
 */
export const useCompanyTimezone = (): string => {
    const { data } = useCompanySettings();

    const timezone = data?.timezone;

    if (!timezone) return DEFAULT_TIMEZONE;

    // Una zona inválida guardada haría reventar a Intl en cada render.
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        return timezone;
    } catch {
        return DEFAULT_TIMEZONE;
    }
};
