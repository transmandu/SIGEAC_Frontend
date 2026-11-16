"use client";

import { useMemo, useState } from "react";
import { FileClock, Loader2, Trash2 } from "lucide-react";
import { useDeleteQuoteDraft } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
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
            className="h-8 gap-1.5 px-2.5 text-xs max-sm:h-10 bg-white/80 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/60 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FileClock className="size-3.5" />
            Borradores
            {count > 0 && (
              <Badge
                variant="outline"
                className="ml-0.5 select-none rounded-md border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-300"
              >
                {count}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <FormDialogContent
          className="sm:max-w-150"
          icon={FileClock}
          title="Borradores de cotización"
          description="Retome una cotización a medio capturar. Mientras no se emita, su solicitud sigue contando como pendiente."
        >
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : count === 0 ? (
            <EmptyState
              icon={FileClock}
              title="No tiene borradores sin emitir"
              description="Las cotizaciones que deje a medias aparecerán aquí."
            />
          ) : (
            <ScrollArea
              className={count > 5 ? "h-70 pr-3 max-sm:h-auto max-sm:pr-0" : ""}
            >
              <div className="flex flex-col gap-1.5">
                {scoped.map((draft) => {
                  const idle = quoteDraftDaysIdle(draft);
                  const { priced, excluded, pending } =
                    quoteDraftProgress(draft);

                  return (
                    <div
                      key={draft.id}
                      className="group flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 max-sm:flex-col max-sm:items-stretch bg-background/70 backdrop-blur-xs border-slate-200/70 dark:border-slate-700/60 hover:border-primary/40 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <FileClock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </div>

                        <div className="flex min-w-0 flex-col leading-tight">
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                            <span className="text-sm font-medium wrap-anywhere text-slate-800 dark:text-slate-100">
                              {draft.requisition_order?.order_number ??
                                "Solicitud"}
                            </span>

                            {idle >= DRAFT_STALE_AFTER_DAYS && (
                              <TagBadge tone="amber">
                                se descarta en{" "}
                                {Math.max(0, DRAFT_DISCARD_AFTER_DAYS - idle)} d
                              </TagBadge>
                            )}
                          </div>

                          <span className="text-[13px] text-muted-foreground wrap-anywhere">
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

                      <div className="flex shrink-0 items-center gap-1 max-sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs max-sm:h-10 max-sm:flex-1 border-slate-200/60 dark:border-slate-700/60 hover:border-primary/40 hover:text-primary"
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
                          className="h-7 w-7 text-muted-foreground hover:text-destructive max-sm:size-10"
                          disabled={deleteQuoteDraft.isPending}
                          onClick={() => setDiscarding(draft)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </FormDialogContent>
      </Dialog>

      <DiscardQuoteDraftDialog
        orderNumber={discarding?.requisition_order?.order_number}
        pricedCount={discarding ? quoteDraftProgress(discarding).priced : 0}
        open={!!discarding}
        onOpenChange={(next) => !next && setDiscarding(null)}
        isPending={deleteQuoteDraft.isPending}
        onConfirm={async () => {
          if (!discarding || !selectedCompany) return;
          await deleteQuoteDraft.mutateAsync({
            id: discarding.id,
            company: selectedCompany.slug,
          });
        }}
      />
    </>
  );
}
