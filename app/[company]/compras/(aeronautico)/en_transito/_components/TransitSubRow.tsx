"use client";

import { type AppRow } from "@/lib/table";
import {
  INCOMING_REASON_ACTIONS,
  INCOMING_REASON_LABELS,
  isReadyForIncoming,
} from "@/lib/incoming-readiness";
import { FileWarning } from "lucide-react";
import type { TransitArticle } from "@/types/purchase";

type Props = {
  row: AppRow<TransitArticle>;
};

export default function TransitSubRow({ row }: Props) {
  const article = row.original;

  const readiness = article.incoming_readiness;
  const isBlocked =
    article.status?.toUpperCase() === "RECEPTION" &&
    !isReadyForIncoming(readiness);
  const blockingReasons = readiness?.reasons ?? [];

  const hasInfo =
    article.manufacturer ||
    article.condition ||
    article.quantity != null ||
    article.unit ||
    isBlocked;

  if (!hasInfo) {
    return (
      <div className="px-4 py-2 text-xs text-muted-foreground italic">
        Sin información adicional
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="grid grid-cols-3 gap-6 text-xs">
        {/* MANUFACTURER */}
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Fabricante</div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {article.manufacturer?.name ?? "—"}
          </div>
        </div>

        {/* CONDITION */}
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Condición</div>
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {article.condition?.name ?? "—"}
          </div>
        </div>

        {/* QUANTITY */}
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Cantidad</div>
          <div
            className="
                flex items-baseline gap-2
                tabular-nums
            "
          >
            <span
              className="
                text-sm font-semibold
                text-slate-900 dark:text-slate-100
                tracking-tight
                "
            >
              {article.quantity ?? "—"}
            </span>
            {article.unit && (
              <span
                className="
                    text-xs
                    px-1.5 py-0.5
                    rounded
                    bg-slate-100/70 dark:bg-slate-800/40
                    border border-slate-200/50 dark:border-slate-700/40
                    text-muted-foreground

                "
              >
                {article.unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lo que compras debe aportar para que almacén pueda inspeccionarlo. */}
      {isBlocked && (
        <div
          className="
          rounded-md border border-red-200 bg-red-50/60
          px-3 py-2
          dark:border-red-800/50 dark:bg-red-950/20
        "
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400">
            <FileWarning className="size-3" />
            Este artículo se registró sin información obligatoria para el
            incoming
          </p>

          <ul className="mt-1.5 space-y-1">
            {blockingReasons.map((reason) => (
              <li key={reason} className="text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {INCOMING_REASON_LABELS[reason] ?? reason}
                </span>
                <span className="ml-1 text-muted-foreground">
                  — {INCOMING_REASON_ACTIONS[reason]?.purchasing}
                </span>
              </li>
            ))}
          </ul>

          {readiness?.pending_documents?.length ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Documentos sin cargar:{" "}
              {readiness.pending_documents
                .map((doc) => doc.document_type?.name)
                .filter(Boolean)
                .join(", ")}
              .
            </p>
          ) : null}

          <p className="mt-1.5 text-xs text-muted-foreground">
            Use el botón de editar para completarlo. El pase a incoming lo hace
            almacén.
          </p>
        </div>
      )}
    </div>
  );
}
