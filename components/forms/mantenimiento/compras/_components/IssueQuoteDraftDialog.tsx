"use client";

import { AlertTriangle, Ban, Loader2, Send } from "lucide-react";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
    <Dialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <FormDialogContent
        className="sm:max-w-md"
        icon={blocked ? AlertTriangle : Send}
        tone={blocked ? "amber" : "primary"}
        title={
          blocked ? "Faltan artículos por decidir" : "¿Emitir la cotización?"
        }
        description={
          blocked
            ? "Cada artículo necesita un precio, o quedar marcado como no cotizado con su justificación. El borrador se guarda igual."
            : "La cotización tomará su número y quedará pendiente de aprobación."
        }
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault();
        }}
        footer={
          <>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {blocked ? "Seguir cotizando" : "Revisar"}
            </Button>

            {!blocked && (
              <Button
                onClick={onConfirm}
                disabled={isPending}
                className="gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Emitir cotización
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-3">
          {blocked && (
            <div className="rounded-xl border border-amber-300/50 bg-amber-50/50 px-3 py-2 dark:border-amber-700/40 dark:bg-amber-950/20">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Sin respuesta todavía ({pending.length})
              </p>
              <ScrollArea className={pending.length > 5 ? "mt-1 h-24" : "mt-1"}>
                <div className="flex flex-col gap-0.5">
                  {pending.map((line) => (
                    <p
                      key={line.label}
                      className="truncate text-xs leading-relaxed text-amber-900/80 dark:text-amber-200/80"
                    >
                      {line.label}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {(quoted.length > 0 || notQuoted.length > 0) && (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-900/60">
              <ScrollArea
                className={quoted.length + notQuoted.length > 6 ? "h-40" : ""}
              >
                <div className="flex flex-col gap-2">
                  {quoted.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Cotizados ({quoted.length})
                      </p>
                      {quoted.map((line) => (
                        <div
                          key={line.label}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="truncate text-xs text-foreground">
                            {line.label}
                          </span>
                          <span className="shrink-0 font-mono text-xs tabular-nums">
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
                      <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <Ban className="size-3" />
                        No cotizados ({notQuoted.length})
                      </p>
                      {notQuoted.map((line) => (
                        <p
                          key={line.label}
                          className="truncate text-xs text-muted-foreground"
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
              <div className="flex items-baseline justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700/60 dark:bg-slate-900/60">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total
                </span>
                <span className="font-mono text-base font-semibold tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>

              <p className="rounded-xl border border-amber-300/50 bg-amber-50/50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
                Una vez emitida no podrá editarse: las diferencias posteriores
                van por cotización complementaria.
              </p>
            </>
          )}
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
