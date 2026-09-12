// schedule-x no importa Temporal: lo busca en el global. La implementación del
// estándar todavía no existe en los navegadores, así que este import la instala.
// Tiene que correr antes de que monte cualquier calendario y los cuatro
// importan este módulo, así que alcanza con dejarlo acá.
import "temporal-polyfill/global";

/**
 * Puente entre las fechas que viajan en la aplicación y los objetos Temporal
 * que schedule-x pide desde la versión 3.
 *
 * El backend manda los eventos del calendario como texto ("YYYY-MM-DD HH:mm") y
 * los formularios esperan lo mismo de vuelta, así que la conversión vive acá en
 * lugar de repetirse en los cuatro calendarios.
 *
 * La hora de pared no se mueve en ninguna dirección: un curso de 08:00 es de
 * 08:00 se convierta o no. Por eso el ida y vuelta usa la zona del navegador,
 * que es exactamente la que aplicaba el `new Date("YYYY-MM-DD HH:mm")` anterior.
 * Convertir de zona acá sería justo el error que la regla de fechas de
 * calendario del sistema prohíbe.
 */

/** Lo que schedule-x acepta en `start` y `end`. */
export type CalendarMoment = Temporal.ZonedDateTime | Temporal.PlainDate;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Acepta el separador con espacio y la hora de un dígito que usa la app. */
const normalize = (value: string) =>
  value.trim().replace(" ", "T").replace(/T(\d):/, "T0$1:");

/**
 * La zona en la que se arman los eventos. El calendario tiene que recibir esta
 * misma en su opción `timezone`: schedule-x 3 convierte cada evento a la zona
 * configurada antes de dibujarlo, y con su default (UTC) un evento de las 08:00
 * de Caracas se mostraba a las 12:00.
 *
 * Es la del navegador porque es la que ya aplicaba el
 * `new Date("YYYY-MM-DD HH:mm")` anterior, así que ni lo que se ve ni lo que se
 * manda al backend cambian respecto de schedule-x 2.
 */
export const calendarTimeZone = (): string => Temporal.Now.timeZoneId();

const zone = calendarTimeZone;

const pad = (value: number) => String(value).padStart(2, "0");

/** Fecha sin hora: se toma tal cual, sin pasar por ninguna zona. */
export const toCalendarDate = (value: string | Date): Temporal.PlainDate =>
  value instanceof Date
    ? Temporal.PlainDate.from({
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
      })
    : Temporal.PlainDate.from(normalize(value).slice(0, 10));

export const toCalendarDateTime = (
  value: string | Date,
): Temporal.ZonedDateTime => {
  if (value instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(
      value.getTime(),
    ).toZonedDateTimeISO(zone());
  }

  const text = normalize(value);

  return DATE_ONLY.test(text)
    ? Temporal.PlainDate.from(text).toZonedDateTime(zone())
    : Temporal.PlainDateTime.from(text).toZonedDateTime(zone());
};

/**
 * Un evento de día completo llega sin hora y el resto con hora; se decide por la
 * forma del texto para no inventarle un 00:00 al primero.
 */
export const toCalendarMoment = (value: string | Date): CalendarMoment =>
  typeof value === "string" && DATE_ONLY.test(normalize(value))
    ? toCalendarDate(value)
    : toCalendarDateTime(value);

const isDateOnly = (value: CalendarMoment): value is Temporal.PlainDate =>
  !("hour" in value);

/** De vuelta al texto que esperan los formularios y el backend. */
export const calendarMomentToString = (value: CalendarMoment): string =>
  isDateOnly(value)
    ? value.toString()
    : `${value.toPlainDate().toString()} ${pad(value.hour)}:${pad(value.minute)}`;

export const calendarMomentToTime = (value: CalendarMoment): string =>
  isDateOnly(value) ? "00:00" : `${pad(value.hour)}:${pad(value.minute)}`;

export const calendarMomentToDate = (value: CalendarMoment): Date =>
  new Date(
    (isDateOnly(value) ? value.toZonedDateTime(zone()) : value)
      .epochMilliseconds,
  );
