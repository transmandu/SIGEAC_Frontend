"use client";

import { AlertTriangle } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import type { CertificateImportPhase } from "./types";

interface CertificateImportProgressBarProps {
  phase: CertificateImportPhase;
  percentage: number;
  total: number;
  imported: number;
  failed: number;
  processed: number;
  courseName?: string;
  completionDate?: string;
  error?: string | null;
  /** `true` solo cuando el job completo falló (no cuando fallan archivos sueltos). */
  importFailed?: boolean;
}

const StatBox = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) => (
  <div className="rounded-md border bg-background p-2">
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className={cn("text-lg font-bold", valueClassName)}>{value}</p>
  </div>
);

const resolveTitle = (
  phase: CertificateImportPhase,
  importFailed?: boolean,
) => {
  if (phase === "uploading") return "Subiendo archivos...";
  if (phase === "processing") return "Procesando lote...";
  if (importFailed) return "La importación falló";

  return "Balance de la importación";
};

/**
 * Cabecera del progreso de una carga masiva: porcentaje, barra y conteos.
 * No conoce el job ni la API, solo recibe el estado ya calculado.
 */
export const CertificateImportProgressBar = ({
  phase,
  percentage,
  total,
  imported,
  failed,
  processed,
  courseName,
  completionDate,
  error,
  importFailed,
}: CertificateImportProgressBarProps) => {
  return (
    <div className="rounded-lg border bg-accent/20 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {resolveTitle(phase, importFailed)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {courseName
              ? `${courseName}${completionDate ? ` · ${completionDate}` : ""}`
              : "Asignando cada PDF al empleado indicado por su DNI"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-lg font-bold">
          {percentage}%
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <StatBox label="Total" value={total} />
        <StatBox
          label="Importados"
          value={imported}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <StatBox
          label="Fallidos"
          value={failed}
          valueClassName="text-red-600 dark:text-red-400"
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {processed} de {total} archivos revisados
        {phase === "processing" && " · puedes dejar esta ventana abierta"}
      </p>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
