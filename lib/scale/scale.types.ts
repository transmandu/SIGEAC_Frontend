/**
 * scale.types.ts
 * Tipos y contratos puros del dominio de balanza.
 */
export type ScaleStatus = "idle" | "connecting" | "connected" | "disconnected" | "error" | "unsupported";

export interface ScaleReading {
    weight: number;
    raw: string;
    timestamp: number;
}

export interface ScaleState {
    status: ScaleStatus;
    error: string | null;
    reading: ScaleReading | null;
    isStable: boolean;
    isSimulated: boolean;
}

export interface ScaleConfig {
    baudRate: number;
    dataBits: 7 | 8;
    stopBits: 1 | 2;
    parity: "none" | "even" | "odd";
    bufferSize: number;
    flowControl: "none" | "hardware";
}

/**
 * Resultado de una captura de peso estable.
 * Preparado para trazabilidad futura con Laravel.
 */
export interface ScaleCaptureResult {
    weight: number;
    capturedAt: string; // ISO 8601
    capturedFromScale: boolean; // true = hardware real, false = simulacion
}

/**
 * Patrón Strategy: permite agregar parsers de diferentes marcas de balanza.
 */
export interface ScaleParserStrategy {
    readonly name: string;
    parse(raw: string): number | null;
}

/**
 * Interfaz unificada para drivers de balanza (real o simulado).
 */
export interface ScaleDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    onData(callback: (chunk: string) => void): void;
    offData(callback: (chunk: string) => void): void;
}








