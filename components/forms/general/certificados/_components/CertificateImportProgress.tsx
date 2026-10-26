"use client";

import type { SMSCertificateImportResult } from "@/types";

import { CertificateImportProgressBar } from "./CertificateImportProgressBar";
import { CertificateImportResultList } from "./CertificateImportResultList";
import type { CertificateImportPhase } from "./types";

interface CertificateImportProgressProps {
  phase: CertificateImportPhase;
  percentage: number;
  total: number;
  imported: number;
  failed: number;
  processed: number;
  courseName?: string;
  completionDate?: string;
  error?: string | null;
  importFailed?: boolean;
  results: SMSCertificateImportResult[];
}

/**
 * Bloque completo de seguimiento de una carga masiva: barra de progreso,
 * balance y detalle por archivo. El formulario solo aporta el estado.
 */
export const CertificateImportProgress = ({
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
  results,
}: CertificateImportProgressProps) => (
  <>
    <CertificateImportProgressBar
      phase={phase}
      percentage={percentage}
      total={total}
      imported={imported}
      failed={failed}
      processed={processed}
      courseName={courseName}
      completionDate={completionDate}
      error={error}
      importFailed={importFailed}
    />
    <CertificateImportResultList phase={phase} results={results} />
  </>
);
