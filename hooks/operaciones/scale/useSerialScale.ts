"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScaleState,
  ScaleReading,
  ScaleDriver,
  ScaleCaptureResult,
} from "@/lib/scale/scale.types";
import {
  SIMULATED,
  DEFAULT_SCALE_CONFIG,
  STABILITY_WINDOW_MS,
  STABILITY_THRESHOLD_KG,
  STABILITY_SAMPLE_SIZE,
  SCALE_PARSER,
} from "@/lib/scale/scale.config";
import { scaleParserRegistry } from "@/lib/scale/scaleParser";
import { ScaleSimulator } from "@/lib/scale/scaleSimulator";

interface SerialScaleReturn {
  state: ScaleState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  captureStableWeight: () => ScaleCaptureResult | null;
}

/**
 * Hook orquestador de balanza.
 * Soporta: conexión real (Web Serial API), simulación, auto-reconnect, estabilidad.
 */

export function useSerialScale(): SerialScaleReturn {
  const [state, setState] = useState<ScaleState>({
    status: "idle",
    error: null,
    reading: null,
    isStable: false,
    isSimulated: SIMULATED,
  });

  const driverRef = useRef<ScaleDriver | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const bufferRef = useRef<string>("");
  const samplesRef = useRef<{ weight: number; timestamp: number }[]>([]);

  // ── Helpers de estabilidad ─────────────────────────────────────
  const checkStability = useCallback((samples: typeof samplesRef.current) => {
    const now = Date.now();
    const windowed = samples.filter(
      (s) => now - s.timestamp <= STABILITY_WINDOW_MS,
    );
    if (windowed.length < STABILITY_SAMPLE_SIZE) return false;

    const mean =
      windowed.reduce((acc, s) => acc + s.weight, 0) / windowed.length;
    const variance =
      windowed.reduce((acc, s) => acc + Math.pow(s.weight - mean, 2), 0) /
      windowed.length;
    const stdDev = Math.sqrt(variance);

    return stdDev <= STABILITY_THRESHOLD_KG;
  }, []);

  const processChunk = useCallback(
    (chunk: string) => {
      bufferRef.current += chunk;

      let lines = bufferRef.current.split(/[\r\n]+/);
      bufferRef.current = lines.pop() || "";

      const parser = scaleParserRegistry.get(SCALE_PARSER);

      for (const line of lines) {
        if (!line.trim()) continue;
        const weight = parser.parse(line);
        if (weight !== null) {
          const reading: ScaleReading = {
            weight,
            raw: line,
            timestamp: Date.now(),
          };

          samplesRef.current.push({ weight, timestamp: Date.now() });
          const cutoff = Date.now() - STABILITY_WINDOW_MS * 2;
          samplesRef.current = samplesRef.current.filter(
            (s) => s.timestamp > cutoff,
          );

          const isStable = checkStability(samplesRef.current);
          setState((prev) => ({
            ...prev,
            reading,
            isStable,
          }));
        }
      }
    },
    [checkStability],
  );


  // ── Simulación ────────────────────────────────────────────────
  const connectSimulator = useCallback(async () => {
    const sim = new ScaleSimulator();

    sim.onData((chunk) => {
      processChunk(chunk);
    });

    await sim.connect();
    driverRef.current = sim;
    setState((prev) => ({
      ...prev,
      status: "connected",
      isSimulated: true,
      error: null,
    }));
  }, [processChunk]);

  // ── Hardware real ─────────────────────────────────────────────
  const connectReal = useCallback(async () => {
    if (!navigator.serial) {
      throw new Error(
        "Tu navegador no soporta Web Serial API. Usa Google Chrome, Edge y Opera.",
      );
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open(DEFAULT_SCALE_CONFIG);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable!.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      const driver: ScaleDriver = {
        connect: async () => {},
        disconnect: async () => {
          reader.cancel();
          await readableStreamClosed.catch(() => {});
          await port.close();
        },
        onData: () => {},
        offData: () => {},
      };

      driverRef.current = driver;

      setState((prev) => ({
        ...prev,
        status: "connected",
        isSimulated: false,
        error: null,
      }));

      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) processChunk(value);
          }
        } catch (err) {
          console.error("[Serial] Error de lectura:", err);
        }
      })();
    } catch (err: any) {
      throw new Error(err.message || "No se pudo conectar a la balanza");
    }
  }, [processChunk]);

  // ── Auto-connect con puertos previamente autorizados ────────────
  const attemptAutoConnect = useCallback(async () => {
    if (SIMULATED || !navigator.serial) return;
    const ports = await navigator.serial.getPorts();
    if (ports.length === 0) return;

    try {
      const port = ports[0];
      await port.open(DEFAULT_SCALE_CONFIG);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable!.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      const driver: ScaleDriver = {
        connect: async () => {},
        disconnect: async () => {
          reader.cancel();
          await readableStreamClosed.catch(() => {});
          await port.close();
        },
        onData: () => {},
        offData: () => {},
      };
      driverRef.current = driver;

      setState((prev) => ({
        ...prev,
        status: "connected",
        isSimulated: false,
        error: null,
      }));

      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) processChunk(value);
          }
        } catch (err) {
          console.error("[Serial] Error de lectura:", err);
        }
      })();
    } catch (err: any) {}
  }, [processChunk]);

  // ── Auto-connect al montar (solo una vez) ──────────────────────
  useEffect(() => {
    if (SIMULATED || !navigator.serial) return;
    attemptAutoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Eventos de conexión/desconexión física ──────────────────────
  useEffect(() => {
    if (SIMULATED || !navigator.serial) return;

    const handleConnect = () => {
      // Solo auto-reconecta si no hay conexión activa
      if (driverRef.current === null) {
        attemptAutoConnect();
      }
    };

    const handleDisconnect = () => {
      setState((prev) => ({
        ...prev,
        status: "disconnected",
        reading: null,
        isStable: false,
      }));
      if (readerRef.current) {
        try {
          readerRef.current.cancel();
        } catch {}
        readerRef.current = null;
      }
      driverRef.current = null;
    };

    navigator.serial.addEventListener("connect", handleConnect);
    navigator.serial.addEventListener("disconnect", handleDisconnect);

    return () => {
      navigator.serial.removeEventListener("connect", handleConnect);
      navigator.serial.removeEventListener("disconnect", handleDisconnect);
    };
  }, [attemptAutoConnect]);

  // ── Conectar / Desconectar manuales ─────────────────────────────
  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "connecting", error: null }));
    try {
      if (SIMULATED) {
        await connectSimulator();
      } else {
        await connectReal();
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err.message,
      }));
    }
  }, [connectSimulator, connectReal]);

  const disconnect = useCallback(async () => {
    // Guardar referencia local para evitar race conditions
    const driver = driverRef.current;
    driverRef.current = null;

    if (driver) {
      try {
        await driver.disconnect();
      } catch (err) {
        // NO propagamos el error: siempre limpiamos el estado
      }
    }

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {}
      readerRef.current = null;
    }

    bufferRef.current = "";
    samplesRef.current = [];

    setState({
      status: "idle",
      error: null,
      reading: null,
      isStable: false,
      isSimulated: SIMULATED,
    });
  }, []);

  // ── Captura con trazabilidad ────────────────────────────────────
  const captureStableWeight = useCallback((): ScaleCaptureResult | null => {
    if (!state.isStable || !state.reading) return null;
    return {
      weight: parseFloat(state.reading.weight.toFixed(2)),
      capturedAt: new Date().toISOString(),
      capturedFromScale: !SIMULATED,
    };
  }, [state.isStable, state.reading]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { state, connect, disconnect, captureStableWeight };
}
