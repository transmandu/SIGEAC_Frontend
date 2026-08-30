// El paquete "temporal-polyfill" a secas exporta SU PROPIA clase Temporal,
// independiente de la que usa schedule-x internamente: sus `instanceof
// Temporal.ZonedDateTime` comparan contra el `Temporal` global (lo pone
// `schedule-x/react` con este mismo import de efecto secundario). Si acá se
// importa el named export en vez del global, las fechas se arman con OTRA
// clase Temporal y schedule-x las rechaza con "needs to be a
// Temporal.ZonedDateTime" aunque luzcan idénticas.
import "temporal-polyfill/global";

/**
 * A partir de schedule-x v3, los eventos usan Temporal (ZonedDateTime para
 * horarios, PlainDate para todo el día) en vez de strings — estos helpers
 * traducen entre eso y el `Date`/ISO que usa el resto del sistema.
 */
const TIME_ZONE = "America/Caracas";

export function dateToZonedDateTime(date: Date): Temporal.ZonedDateTime {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(TIME_ZONE);
}

export function dateToPlainDate(date: Date): Temporal.PlainDate {
  return dateToZonedDateTime(date).toPlainDate();
}

/**
 * Para un evento all_day, la fecha NO es un instante — es un día de
 * calendario, punto. Convertirla vía huso horario (dateToPlainDate) desplaza
 * el día: una medianoche UTC cae a las 20:00 del día anterior en Caracas
 * (UTC-4), y "el día anterior" ES otro día. Por eso acá se leen los
 * componentes LOCALES del Date tal cual (sin instante ni huso de por medio):
 * el resto del código ya construye ese Date con los mismos componentes
 * locales (ver EventCalendar.tsx), así que el viaje de ida y vuelta es exacto.
 */
export function dateToPlainDateLocal(date: Date): Temporal.PlainDate {
  return new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function zonedDateTimeToDate(value: Temporal.ZonedDateTime): Date {
  return new Date(value.epochMilliseconds);
}

export function plainDateToDate(value: Temporal.PlainDate): Date {
  return new Date(value.year, value.month - 1, value.day);
}

/** Acepta cualquiera de los dos tipos que puede traer un evento de schedule-x. */
export function temporalToDate(value: Temporal.ZonedDateTime | Temporal.PlainDate): Date {
  return "epochMilliseconds" in value ? zonedDateTimeToDate(value) : plainDateToDate(value);
}
