import { type ClassValue, clsx } from "clsx";
import { addDays, format, Locale, parse, subDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import { es } from "date-fns/locale";

interface Period {
  from: string | Date | undefined;
  to: string | Date | undefined;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Reemplazar espacios con "-"
    .replace(/[^\w-]/g, ""); // Remover caracteres especiales excepto "-"
};


import { DateRange } from "react-day-picker";

export const formatDateRangeUpdate = (range: DateRange) => {
  if (!range?.from && !range?.to) {
    return "Filtrado de fechas";
  }

  if (range.from && !range.to) {
    return `Desde ${format(range.from, "MMM dd, yyyy")}`;
  }

  if (!range.from && range.to) {
    return `Hasta ${format(range.to, "MMM dd, yyyy")}`;
  }

  if (range.from && range.to) {
    return `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`;
  }

  return "Filtrado de fechas";
};

export const formatDateRange = (
  period: { from?: Date | null; to?: Date | null },
  locale?: Locale
): string => {
  // Verificar si `period.from` es una fecha válida
  if ((!period.from || !(period.from instanceof Date) || isNaN(period.from.getTime())) && (!period.from || !(period.from instanceof Date) || isNaN(period.from.getTime()))) {
    return "Invalid date";
  }

  return `${format(period.from, "LLL dd", { locale })} - ${format(period.to!, "LLL dd, y", { locale })}`;
}

  // Si ambas fechas son válidas, formatea el rango


export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-US",{
    style: 'currency',
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

//función auxiliar para manejar la lógica de los símbolos
export function getCurrencySymbol(coinType: string): string {
  const symbolMap: Record<string, string> = {
    DOLARES: "$",
    EUROS: "€",
    BOLIVARES: "Bs.",
    // Se pueden agregar más monedas aquí en un futuro ...
  };
  return symbolMap[coinType.toUpperCase()] || "";
}

//funcion formateo de simbolo y de número
export function formatCurrencyJ(
  value: number | string, // Acepta ambos tipos
  coinType: string,
  locale: string = 'es-US'
): string {
  // Convertir a número
  const numericValue = typeof value === 'string'
    ? parseFloat(value.replace(',', '.')) // Reemplaza comas por puntos para locales que usan coma decimal
    : value;

  // Verificar si es un número válido
  if (isNaN(numericValue)) {
    return 'Valor inválido';
  }

  const symbol = getCurrencySymbol(coinType);
  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);

  return `${formattedValue} ${symbol}`.trim();
}

// Función para formatear fechas, la forma correcta de implementar es: {formatDate(datexxx,1)}
export const formatDate = (dateInput: string | Date, daysToAdd: number = 0) => {
  let date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (daysToAdd !== 0) {
    date = new Date(date.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function dateFormat(date: string | Date, DateFormat: string) {
  const newDate = addDays(new Date(date), 1);
  return format(newDate, DateFormat, {
    locale: es,
  });
}

export function timeFormat(hour: Date, outPutFormat: string = "HH:mm") {
  const timeString = hour.toString();
  const parsedTime = parse(timeString, "HH:mm:ss", new Date());
  const time = format(parsedTime, outPutFormat);
  return time;
}

export function getResult(index: string) {
  const INTOLERABLE: string[] = ["5A", "5B", "5C", "4A", "4B", "3A"];
  const TOLERABLE: string[] = [
    "5D",
    "5E",
    "4C",
    "4D",
    "4E",
    "3B",
    "3C",
    "3D",
    "2A",
    "2B",
    "2C",
  ];
  const ACCEPTABLE: string[] = ["3E", "2D", "2E", "1A", "1B", "1C", "1D", "1E"];

  if (INTOLERABLE.includes(index)) {
    return "INTOLERABLE";
  } else if (TOLERABLE.includes(index)) {
    return "TOLERABLE";
  } else if (ACCEPTABLE.includes(index)) {
    return "ACEPTABLE";
  }
}

// COLORES PARA LOS GRAFICOS ESTADISTICOS DYNAMIC CHART & PIE CHART COMPONENT
export const COLORS: string[] = [
  // Agregamos 'export' aquí
  "#7bcac4",
  "#9e90dd",
  "#ba61f0",
  "#aa94eb",
  "#b685f5",
  "#92b1d8",
  "#98aadd",
  "#9ea2e1",
  "#a49be6",
  "#b685f5",
  "#bc7dfa",
];
