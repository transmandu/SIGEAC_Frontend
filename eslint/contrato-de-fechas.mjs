/**
 * Contrato de fechas: el backend guarda en UTC y cada compañía lee sus fechas en
 * la zona que eligió (CompanySetting "timezone").
 *
 *   - Un INSTANTE (columna datetime) se muestra con `formatInstant(valor, zona,
 *     formato)` —o el componente `FormattedInstant`— y la zona sale de
 *     `useCompanyTimezone()`.
 *   - Una FECHA DE CALENDARIO (columna date) se muestra con `formatCalendarDate`
 *     y se lee con `parseCalendarDate`: nunca se convierte de zona.
 *   - "Hoy" para un selector o un rango por defecto es `companyNow()`.
 *
 * Estas reglas vuelven un error de lint las formas que se saltan eso: mostrar
 * con la zona del navegador o sacar el día de un `toISOString()` (que es el día
 * UTC: en Caracas, desde las 8 p. m. ya es "mañana"). Guía: lib/date.ts.
 *
 * Se combina con los demás contratos en `eslint.config.mjs`: dos bloques
 * `no-restricted-syntax` sobre los mismos archivos se pisan entre sí.
 */

const HOW =
  "Usa formatInstant(valor, zona, formato) / FormattedInstant para un instante, formatCalendarDate para una fecha de calendario, y companyNow() para \"hoy\" (lib/date.ts).";

export const archivosSinContratoDeFechas = ["lib/date.ts"];

export const reglasDeFechas = [
  {
    selector:
      "CallExpression[callee.property.name=/^toLocale(Date|Time)String$/]",
    message: `toLocaleDateString/toLocaleTimeString muestran la fecha en la zona del navegador, no la de la compañía. ${HOW}`,
  },
  {
    selector:
      "CallExpression[callee.property.name='toLocaleString'][callee.object.type='NewExpression'][callee.object.callee.name='Date']",
    message: `new Date(...).toLocaleString() muestra la fecha en la zona del navegador, no la de la compañía. ${HOW}`,
  },
  {
    selector:
      "CallExpression[callee.property.name=/^(slice|split|substring|substr)$/][callee.object.callee.property.name='toISOString']",
    message: `toISOString() da el día UTC: cerca de la medianoche es el día equivocado. Para "hoy" usa instantToCalendarDay(new Date(), zona); para un día elegido en un calendario, toCalendarPayload(fecha). ${HOW}`,
  },
  {
    selector: "CallExpression[callee.property.name='getTimezoneOffset']",
    message: `Compensar con getTimezoneOffset() depende de la zona del navegador. Para una fecha de calendario usa parseCalendarDate. ${HOW}`,
  },
];
