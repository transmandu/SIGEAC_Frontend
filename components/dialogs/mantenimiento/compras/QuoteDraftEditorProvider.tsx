"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { FileClock, Trash2 } from "lucide-react";
import { useDeleteQuoteDraft } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { CreateQuoteForm } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { CreateGeneralQuoteForm } from "@/components/forms/general/compras/CreateGeneralQuoteForm";
import { Button } from "@/components/ui/button";
import { DiscardQuoteDraftDialog } from "./DiscardQuoteDraftDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetMyQuoteDrafts } from "@/hooks/mantenimiento/compras/useGetMyQuoteDrafts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { isGeneralDraft, requisitionFromDraft } from "@/lib/purchases/quote-draft";

/**
 * Abre el editor de un borrador desde cualquier parte del listado de
 * requisiciones (el badge de la fila, el dropdown de acciones).
 *
 * Se recibe solo el id porque quien dispara la acción tiene la requisición, no
 * el borrador completo: el borrador con sus líneas se resuelve aquí, desde la
 * lista de borradores propios que ya está en caché.
 */
const QuoteDraftEditorContext = createContext<((draftId: number) => void) | null>(
  null,
);

export const useOpenQuoteDraftEditor = () => useContext(QuoteDraftEditorContext);

export function QuoteDraftEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: drafts, isLoading } = useGetMyQuoteDrafts(
    selectedCompany?.slug ?? null,
  );

  const { deleteQuoteDraft } = useDeleteQuoteDraft();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [discarding, setDiscarding] = useState(false);

  const open = useCallback((draftId: number) => setEditingId(draftId), []);

  const editing = drafts?.find((draft) => draft.id === editingId) ?? null;

  const pricedCount = (editing?.article_quote_order ?? []).filter(
    (line) => !line.is_not_quoted && Number(line.unit_price) > 0,
  ).length;

  return (
    <QuoteDraftEditorContext.Provider value={open}>
      {children}

      <Dialog
        open={editingId !== null}
        onOpenChange={(next) => !next && setEditingId(null)}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-215 p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <div className="shrink-0 relative bg-linear-to-br from-primary/5 via-background to-background px-4 sm:px-6 pt-6 sm:pt-7 pb-4">
            <div className="absolute inset-0 bg-grid-white/[0.02]" />

            <DialogHeader className="relative">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border bg-background shadow-xs">
                  <FileClock className="h-6 w-6 text-primary" />
                </div>

                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold tracking-tight leading-none">
                    Continuar cotización
                  </DialogTitle>

                  <p className="text-sm font-medium text-primary">
                    {editing?.requisition_order?.order_number ?? ""}
                  </p>

                  <DialogDescription className="max-w-107.5 text-sm leading-relaxed">
                    Guarde el avance cuantas veces necesite. Al emitirla tomará
                    su número y no podrá editarse.
                  </DialogDescription>
                </div>

                {/* Descartar vive en el header y no junto a guardar/emitir: es
                    la salida del borrador, no un paso de la captura. Separado
                    del botón de cerrar (×) de Radix para no pulsarlo por error. */}
                <Button
                  variant="outline"
                  disabled={!editing || deleteQuoteDraft.isPending}
                  onClick={() => setDiscarding(true)}
                  className="h-8 shrink-0 gap-1.5 px-2.5 text-xs border-slate-200/60 dark:border-slate-700/60 text-muted-foreground hover:border-destructive/40 hover:text-destructive sm:ml-auto sm:mr-8"
                >
                  <Trash2 className="size-3.5" />
                  Descartar borrador
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto px-4 sm:px-6 py-5">
            {/* key: este diálogo no se desmonta al cerrarse, solo cambia el
                borrador en edición. Sin remontar el formulario, react-hook-form
                conservaría los defaultValues del borrador anterior y el
                siguiente guardado escribiría los precios de otra solicitud. */}
            {editing ? (
              isGeneralDraft(editing) ? (
                <CreateGeneralQuoteForm
                  key={editing.id}
                  req={requisitionFromDraft(editing)}
                  draft={editing}
                  onClose={() => setEditingId(null)}
                />
              ) : (
                <CreateQuoteForm
                  key={editing.id}
                  req={requisitionFromDraft(editing)}
                  draft={editing}
                  onClose={() => setEditingId(null)}
                />
              )
            ) : isLoading ? (
              <LoadingPage />
            ) : (
              /* La lista llegó y el borrador no está: lo emitió o descartó otra
                 pestaña. Sin este caso el diálogo se quedaría cargando para
                 siempre, sin forma de salir más que cerrarlo. */
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Este borrador ya no está disponible: puede haberse emitido o
                  descartado.
                </p>
                <Button
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => setEditingId(null)}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DiscardQuoteDraftDialog
        orderNumber={editing?.requisition_order?.order_number}
        pricedCount={pricedCount}
        open={discarding}
        onOpenChange={setDiscarding}
        isPending={deleteQuoteDraft.isPending}
        onConfirm={() => {
          if (!editing || !selectedCompany) return;
          deleteQuoteDraft.mutate(
            { id: editing.id, company: selectedCompany.slug },
            {
              onSuccess: () => setEditingId(null),
              onSettled: () => setDiscarding(false),
            },
          );
        }}
      />
    </QuoteDraftEditorContext.Provider>
  );
}
