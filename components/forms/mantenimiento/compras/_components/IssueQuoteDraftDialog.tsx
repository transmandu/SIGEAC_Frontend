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
 *
 * Las listas largas se desplazan por dentro solo desde `sm`: en móvil el
 * diálogo ocupa toda la pantalla y ya desplaza, y un segundo scroll anidado
 * es incómodo.
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
                className="min-w-35 gap-2"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Emitir cotización
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-3">
          {blocked && (
            <div className="rounded-xl border border-amber-300/50 bg-amber-50/50 px-3.5 py-3 dark:border-amber-700/40 dark:bg-amber-950/20">
              <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
                Sin respuesta todavía ({pending.length})
              </p>
              <ScrollArea
                className={cn(
                  "mt-1.5",
                  pending.length > 5 && "h-28 max-sm:h-auto",
                )}
              >
                <div className="flex flex-col gap-1">
                  {pending.map((line, index) => (
                    <p
                      key={`${line.label}-${index}`}
                      className="text-[13px] leading-snug text-amber-900/80 wrap-anywhere dark:text-amber-200/80"
                    >
                      {line.label}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {(quoted.length > 0 || notQuoted.length > 0) && (
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-700/60 dark:bg-slate-900/60">
              <ScrollArea
                className={cn(
                  quoted.length + notQuoted.length > 6 && "h-44 max-sm:h-auto",
                )}
              >
                <div className="flex flex-col gap-3">
                  {quoted.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[13px] font-semibold text-muted-foreground">
                        Cotizados ({quoted.length})
                      </p>
                      {quoted.map((line, index) => (
                        <div
                          key={`${line.label}-${index}`}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="min-w-0 text-[13px] text-foreground wrap-anywhere">
                            {line.label}
                          </span>
                          <span className="shrink-0 font-mono text-[13px] tabular-nums">
                            ${line.total!.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {notQuoted.length > 0 && (
                    <div
                      className={cn(
                        "flex flex-col gap-1.5",
                        quoted.length > 0 && "border-t border-border/60 pt-3",
                      )}
                    >
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
                        <Ban className="size-3.5" />
                        No cotizados ({notQuoted.length})
                      </p>
                      {notQuoted.map((line, index) => (
                        <p
                          key={`${line.label}-${index}`}
                          className="text-[13px] text-muted-foreground wrap-anywhere"
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
              <div className="flex items-baseline justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 dark:border-slate-700/60 dark:bg-slate-900/60">
                <span className="text-[13px] font-semibold text-muted-foreground">
                  Total
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>

              <p className="rounded-xl border border-amber-300/50 bg-amber-50/50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-200">
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
