"use client";

import { useMemo, useState } from "react";
import { FileClock, Loader2, Trash2 } from "lucide-react";
import { useDeleteQuoteDraft } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiscardQuoteDraftDialog } from "./DiscardQuoteDraftDialog";
import { useOpenQuoteDraftEditor } from "./QuoteDraftEditorProvider";
import { useGetMyQuoteDrafts } from "@/hooks/mantenimiento/compras/useGetMyQuoteDrafts";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Quote } from "@/types/purchase";
import {
  DRAFT_DISCARD_AFTER_DAYS,
  DRAFT_STALE_AFTER_DAYS,
  isGeneralDraft,
  quoteDraftDaysIdle,
  quoteDraftProgress,
} from "@/lib/purchases/quote-draft";

/**
 * Los borradores del comprador, para retomarlos.
 *
 * Un borrador no aparece en el listado de cotizaciones (todavía no es una), así
 * que sin esta puerta quedaría inalcanzable después de cerrar el formulario.
 *
 * El disparador vive en la barra de filtros, así que copia su métrica (h-8,
 * text-xs, fondo translúcido) en vez de la del botón de acción principal.
 */
export function QuoteDraftsDialog({
  scope = "AERONAUTICAL",
}: {
  /**
   * Familia de borradores a listar. Cada pantalla del módulo es de una familia,
   * así que el botón muestra solo los suyos: mezclarlos llevaría al comprador a
   * abrir un borrador que no pertenece a la pantalla en la que está.
   */
  scope?: "AERONAUTICAL" | "GENERAL";
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: drafts, isLoading } = useGetMyQuoteDrafts(
    selectedCompany?.slug ?? null,
  );
  const { deleteQuoteDraft } = useDeleteQuoteDraft();
  // El editor lo monta QuoteDraftEditorProvider: así hay una sola copia del
  // diálogo de edición, que además sabe elegir el formulario según la familia.
  const openDraftEditor = useOpenQuoteDraftEditor();

  const [open, setOpen] = useState(false);
  const [discarding, setDiscarding] = useState<Quote | null>(null);

  const scoped = useMemo(
    () =>
      (drafts ?? []).filter((draft) =>
        scope === "GENERAL" ? isGeneralDraft(draft) : !isGeneralDraft(draft),
      ),
    [drafts, scope],
  );

  const count = scoped.length;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-8 gap-1.5 px-2.5 text-xs bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FileClock className="size-3.5" />
            Borradores
            {count > 0 && (
              <Badge
                variant="outline"
                className="ml-0.5 select-none rounded-md border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[9px] font-semibold tabular-nums text-amber-700 dark:text-amber-300"
              >
                {count}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-150 p-0 overflow-hidden max-h-[85vh] flex flex-col">
          {/* HEADER — mismo lenguaje que los diálogos del módulo: degradado
              suave, icono en cuadro redondeado y título en dos niveles. */}
          <div className="shrink-0 relative bg-linear-to-br from-primary/5 via-background to-background px-4 sm:px-6 pt-6 sm:pt-7 pb-4">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            <DialogHeader className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border bg-background shadow-xs">
                  <FileClock className="h-6 w-6 text-primary" />
                </div>

                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold tracking-tight leading-none">
                    Borradores de cotización
                  </DialogTitle>

                  <p className="text-sm font-medium text-primary">
                    Cotizaciones sin emitir
                  </p>

                  <DialogDescription className="max-w-107.5 text-sm leading-relaxed">
                    Retome una cotización a medio capturar. Mientras no se
                    emita, su solicitud sigue contando como pendiente.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* BODY */}
          <div className="overflow-y-auto px-4 sm:px-6 py-5">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : count === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                  <FileClock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No tiene borradores sin emitir.
                </p>
              </div>
            ) : (
              <ScrollArea className={count > 5 ? "h-70 pr-3" : ""}>
                <div className="flex flex-col gap-1.5">
                  {scoped.map((draft) => {
                    const idle = quoteDraftDaysIdle(draft);
                    const { priced, excluded, pending } =
                      quoteDraftProgress(draft);

                    return (
                      <div
                        key={draft.id}
                        className="group flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-background/70 backdrop-blur-xs border-slate-200/70 dark:border-slate-700/60 hover:border-primary/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                            <FileClock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          </div>

                          <div className="flex min-w-0 flex-col leading-tight">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                                {draft.requisition_order?.order_number ??
                                  "Solicitud"}
                              </span>

                              {idle >= DRAFT_STALE_AFTER_DAYS && (
                                <Badge
                                  variant="outline"
                                  className="select-none rounded-md border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[9px] font-semibold tracking-wide text-amber-700 dark:text-amber-300"
                                >
                                  se descarta en{" "}
                                  {Math.max(0, DRAFT_DISCARD_AFTER_DAYS - idle)} d
                                </Badge>
                              )}
                            </div>

                            <span className="truncate text-[11px] text-muted-foreground">
                              {priced} con precio
                              {pending > 0 && ` · ${pending} sin responder`}
                              {excluded > 0 && ` · ${excluded} no cotizado`}
                              {" · "}
                              {idle === 0
                                ? "editado hoy"
                                : `${idle} día(s) sin cambios`}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs border-slate-200/60 dark:border-slate-700/60 hover:border-primary/40 hover:text-primary"
                            onClick={() => {
                              setOpen(false);
                              openDraftEditor?.(draft.id);
                            }}
                          >
                            Continuar
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Descartar borrador"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            disabled={deleteQuoteDraft.isPending}
                            onClick={() => setDiscarding(draft)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DiscardQuoteDraftDialog
        orderNumber={discarding?.requisition_order?.order_number}
        pricedCount={
          discarding ? quoteDraftProgress(discarding).priced : 0
        }
        open={!!discarding}
        onOpenChange={(next) => !next && setDiscarding(null)}
        isPending={deleteQuoteDraft.isPending}
        onConfirm={() => {
          if (!discarding || !selectedCompany) return;
          deleteQuoteDraft.mutate(
            { id: discarding.id, company: selectedCompany.slug },
            { onSettled: () => setDiscarding(null) },
          );
        }}
      />
    </>
  );
}
