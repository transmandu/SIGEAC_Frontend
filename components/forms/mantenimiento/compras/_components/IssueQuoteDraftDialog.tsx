"use client";

import { AlertTriangle, Ban, Loader2, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface IssueDraftSummaryLine {
  label: string;
  /** null = sin respuesta todavía; un número = precio cotizado. */
  total: number | null;
  notQuoted: boolean;
}

/**
 * Confirmación de emisión. Lo que el comprador tiene que ver antes de aceptar
 * es qué se va a emitir y qué queda declarado como no cotizado — una vez
 * emitida, la cotización no se puede editar.
 *
 * Sigue la métrica de los diálogos de confirmación del módulo
 * (AdvanceRequisitionStatusDialog): max-w-md, título text-base, cuerpo en
 * bloques y pie con borde.
 */
export function IssueQuoteDraftDialog({
  lines,
  total,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  lines: IssueDraftSummaryLine[];
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}) {
  const pending = lines.filter(
    (line) => line.total === null && !line.notQuoted,
  );
  const notQuoted = lines.filter((line) => line.notQuoted);
  const quoted = lines.filter((line) => line.total !== null && !line.notQuoted);

  const blocked = pending.length > 0;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <AlertDialogContent className="max-w-md gap-3 p-5">
        <AlertDialogHeader className="space-y-1.5">
          <AlertDialogTitle className="flex items-center gap-2 text-base">
            {blocked ? (
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-500" />
            ) : (
              <Send className="size-5 text-primary" />
            )}
            {blocked
              ? "Faltan artículos por decidir"
              : "¿Emitir la cotización?"}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs">
            {blocked
              ? "Cada artículo necesita un precio, o quedar marcado como no cotizado con su justificación. El borrador se guarda igual."
              : "La cotización tomará su número y quedará pendiente de aprobación."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2.5">
          {blocked && (
            <div className="rounded-lg border border-amber-300/50 bg-amber-50/50 px-3 py-2 dark:border-amber-700/40 dark:bg-amber-950/20">
              <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                Sin respuesta todavía ({pending.length})
              </p>
              <ScrollArea className={pending.length > 5 ? "mt-1 h-24" : "mt-1"}>
                <div className="flex flex-col gap-0.5">
                  {pending.map((line) => (
                    <p
                      key={line.label}
                      className="truncate text-[11px] leading-relaxed text-amber-900/80 dark:text-amber-200/80"
                    >
                      {line.label}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {(quoted.length > 0 || notQuoted.length > 0) && (
            <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5">
              <ScrollArea
                className={quoted.length + notQuoted.length > 6 ? "h-40" : ""}
              >
                <div className="flex flex-col gap-2">
                  {quoted.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Cotizados ({quoted.length})
                      </p>
                      {quoted.map((line) => (
                        <div
                          key={line.label}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="truncate text-[11px] text-foreground">
                            {line.label}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] tabular-nums">
                            ${line.total!.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {notQuoted.length > 0 && (
                    <div
                      className={cn(
                        "flex flex-col gap-1",
                        quoted.length > 0 && "border-t border-border/60 pt-2",
                      )}
                    >
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <Ban className="size-3" />
                        No cotizados ({notQuoted.length})
                      </p>
                      {notQuoted.map((line) => (
                        <p
                          key={line.label}
                          className="truncate text-[11px] text-muted-foreground"
                        >
                          {line.label}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {!blocked && (
            <>
              <div className="flex items-baseline justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Total
                </span>
                <span className="font-mono text-base font-semibold tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>

              <p className="rounded-lg border border-amber-300/50 bg-amber-50/50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
                Una vez emitida no podrá editarse: las diferencias posteriores
                van por cotización complementaria.
              </p>
            </>
          )}
        </div>

        <AlertDialogFooter className="gap-2 border-t pt-4 sm:gap-0">
          <AlertDialogCancel
            disabled={isPending}
            className="mt-0 h-9 border-border/70 bg-background/70 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {blocked ? "Seguir cotizando" : "Revisar"}
          </AlertDialogCancel>

          {!blocked && (
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className="h-9 gap-1.5 text-xs font-semibold shadow-xs transition-all hover:shadow-md"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Emitir cotización
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
