import axiosInstance from "@/lib/axios";
import { invalidateFlightData } from "./actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const COUNTER_KEYS = [
  "time_since_new",
  "time_since_overhaul",
  "cycles_since_new",
  "cycles_since_overhaul",
] as const;

export type FlightLogCounterKey = (typeof COUNTER_KEYS)[number];

export interface FlightLogReconciliationLine {
  expected: number;
  after: number;
  difference: number;
  matches: boolean;
}

export interface FlightLogReport {
  dry_run: boolean;
  aircraft: string;
  rows: {
    read: number;
    imported: number;
    skipped_blank: number;
    skipped_zero: number;
  };
  period: { from: string; to: string };
  imported: { hours: number; cycles: number };
  aircraft_counters: Record<
    "hours" | "cycles",
    { before: number; added: number; after: number }
  >;
  parts: {
    part_id: number;
    part_number: string;
    type: string | null;
    serial: string | null;
    counters: Record<
      FlightLogCounterKey,
      { before: number | null; after: number | null }
    >;
  }[];
  reconciliation: Partial<
    Record<"hours" | "cycles", FlightLogReconciliationLine>
  > | null;
  warnings: string[];
}

export interface ImportFlightLogParams {
  company: string;
  acronym: string;
  file: File;
  dryRun: boolean;
  allowOverlap: boolean;
  expectedHours?: number | null;
  expectedCycles?: number | null;
}

/** Fila del Excel que el servidor rechazó. */
export interface FlightLogRowError {
  row: number;
  message: string;
}

/**
 * Importa el historial de vuelos de una aeronave desde un Excel. Con `dryRun` el
 * servidor calcula el informe y revierte; solo la carga real invalida lo cacheado.
 * Los errores no se avisan aquí: el diálogo los muestra con sus filas.
 */
export const useImportFlightLog = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      company,
      acronym,
      file,
      dryRun,
      allowOverlap,
      expectedHours,
      expectedCycles,
    }: ImportFlightLogParams) => {
      const body = new FormData();
      body.append("file", file);
      body.append("acronym", acronym);
      body.append("dry_run", dryRun ? "1" : "0");
      body.append("allow_overlap", allowOverlap ? "1" : "0");
      if (expectedHours != null)
        body.append("expected_hours", String(expectedHours));
      if (expectedCycles != null)
        body.append("expected_cycles", String(expectedCycles));

      const { data } = await axiosInstance.post<{
        message: string;
        report: FlightLogReport;
      }>(`/${company}/flight-hours-import`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },
    onSuccess: (data) => {
      if (data.report.dry_run) return;

      invalidateFlightData(queryClient);
    },
  });

  return { importFlightLog: mutation };
};
