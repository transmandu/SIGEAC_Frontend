import { type ClassValue, clsx } from "clsx"
import { format, subDays, Locale } from "date-fns";
import { twMerge } from "tailwind-merge"
import {es} from "date-fns/locale"

interface Period {
  from: string | Date | undefined
  to: string | Date | undefined
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Reemplazar espacios con "-"
    .replace(/[^\w-]/g, ''); // Remover caracteres especiales excepto "-"
};

// export function formatDateRange(period?: Period) {
//   const defaultTo = new Date();
//   const defaultFrom = subDays(defaultTo, 30);
//   const locale = es;//

//   if(!period?.from) {
//     return `${format(defaultFrom, "LLL dd", {locale})} - ${format(defaultTo, "LLL dd, y", {locale})}`
//   }//

//   if(period.to) {
//     return `${format(period.from, "LLL dd")} - ${format(period.to, "LLL dd, y", {locale})}`
//   }//

//   return format(period.from, "LLL dd, y", {locale});
// }

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
  if (!period.from || !(period.from instanceof Date) || isNaN(period.from.getTime())) {
    return "Invalid date";
  }

  // Si `period.to` no está definido o no es una fecha válida, solo formatea `period.from`
  if (!period.to || !(period.to instanceof Date) || isNaN(period.to.getTime())) {
    return format(period.from, "LLL dd, y", { locale });
  }

  // Si ambas fechas son válidas, formatea el rango
  return `${format(period.from, "LLL dd", { locale })} - ${format(period.to, "LLL dd, y", { locale })}`;
};//ESTO ES NUEVO lo que esta en comentarios era viejo... las fechas se muestran decrementadas un numero en el dia


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
