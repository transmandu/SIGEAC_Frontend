"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SMSCertificateImportResult } from "@/types";

import type { CertificateImportPhase } from "./types";

interface CertificateImportResultListProps {
  phase: CertificateImportPhase;
  results: SMSCertificateImportResult[];
}

const StatusIcon = ({ result }: { result: SMSCertificateImportResult }) =>
  result.status === "imported" ? (
    <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
  ) : (
    <AlertTriangle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
  );

/** Detalle archivo por archivo de una carga masiva. */
export const CertificateImportResultList = ({
  phase,
  results,
}: CertificateImportResultListProps) => (
  <div className="rounded-md border">
    <div className="flex items-center justify-between border-b px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Detalle por archivo
      </p>
      {phase === "processing" && (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      )}
    </div>

    <ScrollArea className="h-64">
      <div className="flex flex-col divide-y">
        {results.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {phase === "uploading"
              ? "Esperando a que terminen de subir los archivos..."
              : "Procesando los archivos. El detalle aparecerá aquí..."}
          </p>
        )}

        {results.map((result, index) => (
          <div
            key={`${result.file}-${index}`}
            className="flex items-start gap-2 px-3 py-2"
          >
            <StatusIcon result={result} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{result.file}</p>
              <p className="text-[11px] text-muted-foreground">
                {result.dni ? `DNI ${result.dni}` : "Sin DNI en el nombre"}
                {result.employee ? ` · ${result.employee}` : ""}
              </p>
              {result.status === "failed" && result.message && (
                <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400">
                  {result.message}
                </p>
              )}
            </div>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                result.status === "imported"
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
              )}
            >
              {result.status === "imported" ? "Cargado" : "Falló"}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);
