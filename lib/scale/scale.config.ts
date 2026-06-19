/**
 * scale.config.ts
 * Configuración del módulo de balanza.
 * Lee variables de entorno NEXT_PUBLIC_* para permitir configuración por ambiente.
 */

/**
 * FEATURE FLAG: true = simulador de software, false = hardware real vía Web Serial API.
 * Fallback seguro: false (por defecto asume hardware real).
 */
export const SIMULATED = process.env.NEXT_PUBLIC_SCALE_SIMULATED === "true" || process.env.NEXT_PUBLIC_SCALE_SIMULATED === "1";

/**
 * Modo debug: imprime logs detallados en consola del navegador.
 */
export const SCALE_DEBUG = process.env.NEXT_PUBLIC_SCALE_DEBUG === "true" || process.env.NEXT_PUBLIC_SCALE_DEBUG === "1";

/**
 * Parser activo para extraer peso del stream serial.
 */
export const SCALE_PARSER = process.env.NEXT_PUBLIC_SCALE_PARSER ?? "default";

/**
 * Perfil de simulación: stable | unstable | heavy | light
 */
export const SIMULATION_PROFILE = process.env.NEXT_PUBLIC_SCALE_SIMULATION_PROFILE ?? "stable";

export const DEFAULT_SCALE_CONFIG =  {
    baudRate: 9600,
    dataBits: 8 as 7 | 8,
    stopBits: 1 as 1 | 2,
    parity: "none" as "none" | "even" | "odd",
    bufferSize: 255,
    flowControl: "none" as "none" | "hardware",
};

/**
 * Estabilidad: muestras mínimas para declarar peso estable.
 */
export const STABILITY_SAMPLE_SIZE = 5;

/**
 * Estabilidad: ventana de tiempo en ms para analizar muestras.
 */
export const STABILITY_WINDOW_MS = 800;

/**
 * Estabilidad: umbral de desviación estándar en KG.
 */
export const STABILITY_THRESHOLD_KG = 0.02;

/**
 * Regex por defecto para extraer peso de strings de balanza.
 */
export const DEFAULT_WEIGHT_REGEX = /[+-]?\d+(?:\.\d+)?/;