import { type ClassValue, clsx } from "clsx";
import { addDays, format, Locale, parse, subDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import { es } from "date-fns/locale";
import { formatCalendarDate } from "./date";

interface Period {
    from: string | Date | undefined;
    to: string | Date | undefined;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// El backend a veces devuelve URLs absolutas de assets (image_url, etc.) con un
// host distinto al configurado actualmente en NEXT_PUBLIC_HOSTNAME (por ejemplo,
// generadas cuando el servidor tenía otra IP). Como el resto de la app sí es
// alcanzable en el host configurado, reescribimos solo el origin y conservamos
// la ruta tal cual la mandó el backend, en vez de descartar la URL entera.
export function normalizeAssetUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    if (!hostname) return url;

    try {
        const target = new URL(url);
        const base = new URL(hostname);
        target.protocol = base.protocol;
        target.host = base.host;
        return target.toString();
    } catch {
        return url;
    }
}

export const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-") // Reemplazar espacios con "-"
        .replace(/[^\w-]/g, ""); // Remover caracteres especiales excepto "-"
};

import { DateRange } from "react-day-picker";
import { batches_categories } from "./batches_categories";

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
    locale?: Locale,
): string => {
    // Verificar si `period.from` es una fecha válida
    if (
        (!period.from ||
            !(period.from instanceof Date) ||
            isNaN(period.from.getTime())) &&
        (!period.from ||
            !(period.from instanceof Date) ||
            isNaN(period.from.getTime()))
    ) {
        return "Invalid date";
    }

    return `${format(period.from, "LLL dd", { locale })} - ${format(period.to!, "LLL dd, y", { locale })}`;
};

// Si ambas fechas son válidas, formatea el rango

export function formatCurrency(value: number) {
    return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
}

/**
 * Cantidades de inventario: mínimo 2 decimales y hasta 6, sin ceros de relleno.
 * El stock guarda la precisión real de las conversiones entre unidades (10.001),
 * pero un entero se sigue leyendo "10,00".
 */
export function formatQuantity(value: number | string | null | undefined): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(Number(value ?? 0));
}

/**
 * Costos: 2 decimales, y hasta 4 solo si el valor los tiene. Un costo por unidad
 * base sale de dividir ($10 entre una caja de 3 = 3,3333), pero lo facturado es
 * siempre de 2 y no debe mostrarse como "12,0000".
 */
export function formatCost(value: number | string | null | undefined): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(Number(value ?? 0));
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
    locale: string = "es-US",
): string {
    // Convertir a número
    const numericValue =
        typeof value === "string"
            ? parseFloat(value.replace(",", ".")) // Reemplaza comas por puntos para locales que usan coma decimal
            : value;

    // Verificar si es un número válido
    if (isNaN(numericValue)) {
        return "Valor inválido";
    }

    const symbol = getCurrencySymbol(coinType);
    const formattedValue = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue);

    return `${formattedValue} ${symbol}`.trim();
}

// Función para formatear fechas, la forma correcta de implementar es: {formatDate(datexxx,1)}
export const formatDate = (dateInput: string | Date, daysToAdd: number = 0) => {
    if (daysToAdd !== 0) {
        const base = dateInput instanceof Date
            ? dateInput
            : parseServerDate(dateInput) ?? new Date(dateInput);

        if (Number.isNaN(base.getTime())) return "Fecha inválida";

        return format(addDays(base, daysToAdd), "dd/MM/yyyy", { locale: es });
    }

    return formatCalendarDate(dateInput, "dd/MM/yyyy", "Fecha inválida");
};

/**
 * Fechas de calendario (start_date, report_date, expiration...). Delega en
 * formatCalendarDate: se muestran tal cual vienen, sin convertir de zona.
 *
 * Antes sumaba un día a mano para compensar que `new Date("2026-09-02")` es
 * medianoche UTC y en UTC−4 se renderiza como el 1. Ese parche ya no hace falta
 * porque los componentes de la fecha se leen del string sin pasar por una zona.
 */
export function dateFormat(date: string | Date | null | undefined, DateFormat: string) {
    return formatCalendarDate(date, DateFormat);
}

export function timeFormat(hour: Date, outPutFormat: string = "HH:mm") {
    // Para transformate date a strins y mostrarlos en Tables
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

export const getValueFromLabel = (label: string): string => {
    const category = batches_categories.find(
        (cat) => cat.label.toUpperCase() === label.toUpperCase(),
    );
    return category?.value || "";
};

export const getThirdPartyTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        CLIENT_COMPANY: "EMPRESA",
        CLIENT_PERSON: "PERSONA",
        OTHER: "Otro",
        SIN_TIPO: "Sin Tipo",
    };
    return labels[type] || type;
};


// Helper to parse server date strings (YYYY-MM-DD) as local dates
export function parseServerDate(input?: string | Date | null): Date | undefined {
    if (!input) return undefined;
    if (input instanceof Date) return input;
    const s = String(input);
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnly.test(s)) {
        const [y, m, d] = s.split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed;
    return undefined;
}

/**
 * `requested_date` es el día en que se pidió algo, no un instante: se muestra
 * tal cual, sin convertir. Antes esta función resolvía a mano el caso de la
 * medianoche UTC y fijaba America/Caracas; ahora eso vive en formatCalendarDate,
 * que hace lo mismo para cualquier fecha de calendario.
 */
export function formatRequestedDate(
    input?: string | Date | null,
    dateFormat: string = "dd MMM yyyy",
): string {
    return formatCalendarDate(input, dateFormat);
}
