import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/examples.mobile.json";
import { z } from "zod";

/**
 * Teléfonos del sistema: se guardan SIEMPRE en E.164 (`+584141234567`), el
 * mismo formato que normaliza el backend (`App\Support\Phone`). Aquí vive todo
 * lo que el formulario necesita: países, formato mientras se escribe,
 * validación y presentación.
 */

/** País que se asume cuando un número no trae código internacional. */
export const DEFAULT_PHONE_COUNTRY: CountryCode = "VE";

/** Países que se ofrecen primero en el selector. */
const FEATURED_COUNTRIES: CountryCode[] = [
  "VE",
  "CO",
  "US",
  "ES",
  "PA",
  "MX",
  "BR",
  "AR",
  "CL",
  "PE",
  "EC",
  "DO",
  "CW",
  "AW",
  "TT",
];

/** Máximo de dígitos de un número E.164 (sin el `+`). */
const MAX_DIGITS = 15;

export interface PhoneCountryOption {
  code: CountryCode;
  name: string;
  /** Con el más: `+58`. */
  dial: string;
}

let countriesCache: PhoneCountryOption[] | null = null;

export const getPhoneCountries = (): PhoneCountryOption[] => {
  if (countriesCache) return countriesCache;

  const names = new Intl.DisplayNames(["es"], { type: "region" });

  countriesCache = getCountries()
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      dial: `+${getCountryCallingCode(code)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return countriesCache;
};

export const getFeaturedPhoneCountries = (): PhoneCountryOption[] => {
  const all = getPhoneCountries();

  return FEATURED_COUNTRIES.map((code) =>
    all.find((country) => country.code === code),
  ).filter((country): country is PhoneCountryOption => !!country);
};

export const phoneDial = (country: CountryCode) =>
  `+${getCountryCallingCode(country)}`;

/** Un número de ejemplo del país, con el formato local que debe escribirse. */
export const phonePlaceholder = (country: CountryCode): string =>
  getExampleNumber(country, examples)?.formatNational() ?? "";

const onlyDigits = (raw: string) => raw.replace(/\D/g, "");

/** Lo que se ve en el campo mientras se teclean los dígitos del país elegido. */
export const formatNationalInput = (
  country: CountryCode,
  digits: string,
): string =>
  new AsYouType(country).input(onlyDigits(digits).slice(0, MAX_DIGITS));

/**
 * El valor que viaja al formulario: E.164 de lo escrito. Mientras el número
 * está incompleto no es válido, pero refleja lo tecleado para que la validación
 * lo rechace en vez de ocultarlo.
 */
export const composePhone = (
  country: CountryCode,
  rawDigits: string,
): string => {
  const digits = onlyDigits(rawDigits).slice(0, MAX_DIGITS);

  if (!digits) return "";

  const parsed = parsePhoneNumberFromString(digits, country);

  return parsed?.number ?? `${phoneDial(country)}${digits.replace(/^0+/, "")}`;
};

/** Códigos compartidos por varios países: el que se asume al escribir solo el código. */
const MAIN_COUNTRY_BY_CALLING_CODE: Record<string, CountryCode> = {
  "1": "US",
  "7": "RU",
  "39": "IT",
  "44": "GB",
  "47": "NO",
  "61": "AU",
  "212": "MA",
  "262": "RE",
  "290": "SH",
  "358": "FI",
  "590": "GP",
  "599": "CW",
};

const countryByCallingCode = (callingCode: string): CountryCode | undefined =>
  MAIN_COUNTRY_BY_CALLING_CODE[callingCode] ??
  getCountries().find((code) => getCountryCallingCode(code) === callingCode);

/**
 * Lee un número escrito con código internacional (`+57 300…`) y devuelve el
 * país y los dígitos nacionales, o `undefined` mientras el código aún no está
 * completo (`+`, `+5`).
 */
export const readInternational = (
  raw: string,
): { country: CountryCode; digits: string } | undefined => {
  const typer = new AsYouType();
  typer.input(raw.trim());

  const calling = typer.getCallingCode();
  if (!calling) return undefined;

  const country = typer.getCountry() ?? countryByCallingCode(calling);
  if (!country) return undefined;

  return { country, digits: typer.getNumber()?.nationalNumber ?? "" };
};

/**
 * Parte un valor guardado (E.164 o un formato antiguo) en país y número
 * nacional para el campo. Lo que no se pueda interpretar se muestra tal cual,
 * sin perderlo, para que el usuario lo corrija.
 */
export const splitPhone = (
  value: string | null | undefined,
  fallback: CountryCode = DEFAULT_PHONE_COUNTRY,
): { country: CountryCode; national: string } => {
  const raw = (value ?? "").trim();

  if (!raw) return { country: fallback, national: "" };

  const parsed = parsePhoneNumberFromString(raw, fallback);

  if (parsed) {
    const country =
      parsed.country ?? countryByCallingCode(parsed.countryCallingCode);

    if (country) {
      return {
        country,
        // Con el formato nacional del país (`0414-1234567`), el mismo que
        // produce el campo al escribir.
        national: parsed.formatNational(),
      };
    }
  }

  return { country: fallback, national: onlyDigits(raw) };
};

/** ¿Es un teléfono real? Igual de permisivo que el backend (asume Venezuela). */
export const isValidPhone = (value: string | null | undefined): boolean =>
  !!value &&
  (parsePhoneNumberFromString(value.trim(), DEFAULT_PHONE_COUNTRY)?.isValid() ??
    false);

/**
 * Lo guardado en el formato estándar (E.164) si es un teléfono válido; si no,
 * tal como está. Sirve para comparar un valor antiguo con lo que el campo emite.
 */
export const toPhoneValue = (stored: string | null | undefined): string => {
  const raw = (stored ?? "").trim();
  if (!raw) return "";

  const parsed = parsePhoneNumberFromString(raw, DEFAULT_PHONE_COUNTRY);

  return parsed?.isValid() ? parsed.number : raw;
};

/** Para mostrar (tablas, detalles): `+58 414 1234567`. Lo no interpretable, tal cual. */
export const formatPhone = (value: string | null | undefined): string => {
  const raw = (value ?? "").trim();
  if (!raw) return "";

  const parsed = parsePhoneNumberFromString(raw, DEFAULT_PHONE_COUNTRY);

  return parsed?.isValid() ? parsed.formatInternational() : raw;
};

export const PHONE_ERROR_MESSAGE =
  "Ingrese un teléfono válido para el país seleccionado.";

/**
 * Esquema zod de un teléfono. `keep` es el valor ya guardado: se admite sin
 * cambios aunque sea un dato antiguo que no cumple el formato, para que corregir
 * otro campo no quede bloqueado por él (el diff no lo reenvía si no se toca).
 */
export const phoneSchema = ({
  required = false,
  keep,
}: { required?: boolean; keep?: string | null } = {}) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value === "") {
        if (required) {
          ctx.addIssue({ code: "custom", message: "Ingrese el teléfono." });
        }
        return;
      }

      if (keep && value === keep.trim()) return;

      if (!isValidPhone(value)) {
        ctx.addIssue({ code: "custom", message: PHONE_ERROR_MESSAGE });
      }
    });

/**
 * Coincidencia de búsqueda por teléfono: por dígitos, no por texto. Así
 * `0414-123` encuentra `+584141234567` aunque el número se guarde en E.164 y la
 * búsqueda se escriba en formato local (con o sin el cero de troncal).
 */
export const phoneMatches = (
  stored: string | null | undefined,
  query: string,
): boolean => {
  const wanted = query.replace(/\D/g, "");
  if (!wanted) return false;

  const digits = (stored ?? "").replace(/\D/g, "");

  return (
    digits.includes(wanted) ||
    (wanted.startsWith("0") && digits.includes(wanted.slice(1)))
  );
};
