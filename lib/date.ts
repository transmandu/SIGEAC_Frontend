import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formateo de fechas del sistema.
 *
 * El backend guarda SIEMPRE en UTC. Lo que cambia es cómo se lee, y eso lo
 * decide la zona horaria configurada por cada compañía (CompanySetting
 * "timezone", que arranca en UTC hasta que alguien la elija).
 *
 * La distinción que gobierna todo este archivo:
 *
 *   - INSTANTE (columna datetime: created_at, submission_date, movements.date)
 *     ocurrió en un momento del tiempo. Se convierte a la zona de la compañía.
 *
 *   - FECHA DE CALENDARIO (columna date: start_date, report_date, expiration)
 *     no tiene hora ni zona. Un curso que vence el 02/09 vence el 02/09 se mire
 *     desde donde se mire, así que se muestra tal cual viene. Convertirla es
 *     justo el bug que el viejo `addDays(+1)` de utils.ts intentaba tapar.
 */

export const DEFAULT_TIMEZONE = "UTC";

/** Los formatos que realmente se usan en la app. */
export const DATE_PRESETS = {
    date: "dd/MM/yyyy",
    dateTime: "dd/MM/yyyy HH:mm",
    long: "PPP",
    short: "dd MMM yyyy",
    time: "HH:mm",
} as const;

export type DatePreset = keyof typeof DATE_PRESETS;

/** Acepta un preset conocido o un patrón de date-fns crudo. */
type FormatSpec = DatePreset | (string & {});

const resolveFormat = (spec: FormatSpec): string =>
    spec in DATE_PRESETS ? DATE_PRESETS[spec as DatePreset] : spec;

/**
 * Fechas viejas guardadas como medianoche UTC: no llevaban hora real, así que
 * convertirlas las corre al día anterior en cualquier zona al oeste de
 * Greenwich. Se leen como fecha de calendario.
 */
const MIDNIGHT_UTC = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(\.0+)?Z$/;

/** "2026-09-02", con o sin hora pegada detrás. */
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/;

/** Un día suelto, sin hora: "2026-09-02". */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Datetime sin marca de zona ("2026-09-02 11:36:35" / "...T11:36:35"), tal como
 * lo serializa una columna sin cast. El backend guarda en UTC, pero `new Date()`
 * lo interpretaría como hora del navegador; se le pega la Z para leerlo bien.
 */
const NAIVE_DATETIME = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?)$/;

/**
 * Interpreta el string del backend como el instante que realmente es. Se aísla
 * aquí para que toda la app lea las fechas igual, incluso las de columnas a las
 * que todavía les falte el cast.
 */
const parseInstant = (value: string | Date): Date | null => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

    const naive = value.match(NAIVE_DATETIME);
    const date = new Date(naive ? `${naive[1]}T${naive[2]}Z` : value);

    return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Un Date "de mentira" cuyos campos locales son los de la zona pedida. Sirve
 * solo para dárselo a date-fns, que siempre formatea en la zona del navegador.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * `Intl.DateTimeFormat` es caro de construir y aquí se llama una vez por celda
 * de tabla; se reutiliza por zona. Una zona inválida haría lanzar a Intl y
 * tumbaría el render entero, así que cae a UTC en vez de romper la pantalla.
 */
const formatterFor = (timeZone: string): Intl.DateTimeFormat => {
    const cached = formatterCache.get(timeZone);
    if (cached) return cached;

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    };

    let formatter: Intl.DateTimeFormat;
    try {
        formatter = new Intl.DateTimeFormat("en-US", { ...options, timeZone });
    } catch {
        formatter = new Intl.DateTimeFormat("en-US", { ...options, timeZone: DEFAULT_TIMEZONE });
    }

    formatterCache.set(timeZone, formatter);

    return formatter;
};

const shiftToTimeZone = (date: Date, timeZone: string): Date => {
    const parts = formatterFor(timeZone).formatToParts(date);

    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);

    return new Date(
        get("year"),
        get("month") - 1,
        get("day"),
        // A medianoche Intl devuelve la hora como 24 en vez de 0.
        get("hour") % 24,
        get("minute"),
        get("second"),
    );
};

/**
 * Un instante en la zona de la compañía. Para columnas datetime: created_at,
 * submission_date, movements.date, changed_at...
 */
export const formatInstant = (
    value: string | Date | null | undefined,
    timeZone: string = DEFAULT_TIMEZONE,
    spec: FormatSpec = "dateTime",
    fallback = "N/A",
): string => {
    if (!value) return fallback;

    const pattern = resolveFormat(spec);

    // Un string sin hora del día no es un instante por más que lo pidan aquí:
    // convertirlo lo correría un día. Se atiende como fecha de calendario en vez
    // de confiar en que cada punto de la app haya clasificado bien la columna.
    if (typeof value === "string" && (DATE_ONLY.test(value) || MIDNIGHT_UTC.test(value))) {
        return formatCalendarDate(value, spec, fallback);
    }

    const date = parseInstant(value);
    if (!date) return fallback;

    return format(shiftToTimeZone(date, timeZone), pattern, { locale: es });
};

/**
 * Una fecha de calendario, tal cual la mandó el backend. NUNCA se convierte de
 * zona. Para columnas date: start_date, end_date, report_date, expiration...
 */
export const formatCalendarDate = (
    value: string | Date | null | undefined,
    spec: FormatSpec = "date",
    fallback = "N/A",
): string => {
    if (!value) return fallback;

    const pattern = resolveFormat(spec);

    if (value instanceof Date) {
        return format(value, pattern, { locale: es });
    }

    // Se leen los componentes del string en vez de dejar que el motor los
    // interprete: `new Date("2026-09-02")` es medianoche UTC y en UTC−4 cae el
    // día anterior.
    const match = String(value).match(CALENDAR_DATE);
    if (match) {
        const [, y, m, d] = match;
        return format(new Date(Number(y), Number(m) - 1, Number(d)), pattern, { locale: es });
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return fallback;

    return format(parsed, pattern, { locale: es });
};

/**
 * "02 SEPTIEMBRE 2026". El formato de las cabeceras de compras, cotizaciones y
 * supervisor, que antes estaba copiado en siete uiHelpers.ts distintos.
 */
export const formatLongUpperDate = (
    value: string | Date | null | undefined,
    fallback?: string,
): string | undefined => {
    if (!value) return fallback;

    // Un solo pase: date-fns respeta el texto entre comillas simples, así que el
    // mes se saca en mayúsculas sin volver a parsear la fecha tres veces.
    const formatted = formatCalendarDate(value, "dd|MMMM|yyyy", "");
    if (!formatted) return fallback;

    const [day, month, year] = formatted.split("|");

    return `${day} ${month.toUpperCase()} ${year}`;
};

/**
 * El día de calendario de un instante, en la zona de la compañía: para agrupar
 * o comparar por día sin arrastrar la hora. Devuelve "yyyy-MM-dd".
 */
export const instantToCalendarDay = (
    value: string | Date | null | undefined,
    timeZone: string = DEFAULT_TIMEZONE,
): string | null => {
    if (!value) return null;

    // Una fecha sin hora ya ES el día: convertirla lo correría.
    if (typeof value === "string" && (DATE_ONLY.test(value) || MIDNIGHT_UTC.test(value))) {
        return value.slice(0, 10);
    }

    const date = parseInstant(value);
    if (!date) return null;

    return format(shiftToTimeZone(date, timeZone), "yyyy-MM-dd");
};

/**
 * Una fecha de calendario lista para mandar al backend, en hora local. El
 * `.toISOString()` de un Date tomado del calendario corre el día hacia atrás
 * para cualquier usuario al oeste de Greenwich.
 */
export const toCalendarPayload = (value: Date | null | undefined): string | undefined =>
    value ? format(value, "yyyy-MM-dd") : undefined;
