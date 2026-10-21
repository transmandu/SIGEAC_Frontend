"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import type { ErrorReport } from "@/types";

/**
 * El código con que el backend dejó la entrada en el log, más la pantalla donde
 * ocurrió. Es lo primero que necesita quien atiende un reporte nacido de un
 * aviso de error: con el código va directo al detalle real, sin pedirle nada al
 * usuario. Sin ninguno de los dos no pinta nada (reportes escritos a mano).
 */
export default function ErrorReferenceBlock({
  report,
}: {
  report: Pick<ErrorReport, "error_reference" | "error_code" | "page_url">;
}) {
  const [copied, setCopied] = useState(false);

  if (!report.error_reference && !report.page_url) return null;

  const copy = async () => {
    if (!report.error_reference) return;

    try {
      await navigator.clipboard.writeText(report.error_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles el código sigue a la vista.
    }
  };

  return (
    <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2.5 text-xs dark:border-slate-800/80 dark:bg-slate-900/30">
      {report.error_reference && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Código de error
          </span>
          <span className="font-mono text-sm font-semibold">
            {report.error_reference}
          </span>
          {report.error_code && (
            <span className="font-mono text-muted-foreground">
              {report.error_code}
            </span>
          )}
          <button
            type="button"
            onClick={copy}
            aria-label="Copiar código de error"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
      {report.page_url && (
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Pantalla
          </span>
          <span className="break-all font-mono">{report.page_url}</span>
        </div>
      )}
    </div>
  );
}
