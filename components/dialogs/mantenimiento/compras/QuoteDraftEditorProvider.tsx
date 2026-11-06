"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { FileClock } from "lucide-react";
import { useDeleteQuoteDraft } from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { CreateQuoteForm } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { CreateGeneralQuoteForm } from "@/components/forms/general/compras/CreateGeneralQuoteForm";
import { Button } from "@/components/ui/button";
import { DiscardQuoteDraftDialog } from "./DiscardQuoteDraftDialog";
import { Dialog } from "@/components/ui/dialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetMyQuoteDrafts } from "@/hooks/mantenimiento/compras/useGetMyQuoteDrafts";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  isGeneralDraft,
  quoteDraftProgress,
  requisitionFromDraft,
} from "@/lib/purchases/quote-draft";

/**
 * Abre el editor de un borrador desde cualquier parte del listado de
 * requisiciones (el badge de la fila, el dropdown de acciones).
 *
 * Se recibe solo el id porque quien dispara la acción tiene la requisición, no
 * el borrador completo: el borrador con sus líneas se resuelve aquí, desde la
 * lista de borradores propios que ya está en caché.
 */
const QuoteDraftEditorContext = createContext<
  ((draftId: number) => void) | null
>(null);

export const useOpenQuoteDraftEditor = () =>
  useContext(QuoteDraftEditorContext);

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

  // Cuenta también las líneas generales: un borrador general descartaba sin
  // advertir cuánto avance perdía.
  const pricedCount = editing ? quoteDraftProgress(editing).priced : 0;

  return (
    <QuoteDraftEditorContext.Provider value={open}>
      {children}

      <Dialog
        open={editingId !== null}
        onOpenChange={(next) => !next && setEditingId(null)}
      >
        <FormDialogContent
          className="sm:max-w-215"
          icon={FileClock}
          title="Continuar cotización"
          description={
            <>
              {editing?.requisition_order?.order_number && (
                <span className="mb-1 block text-sm font-medium text-primary">
                  {editing.requisition_order.order_number}
                </span>
              )}
              Guarde el avance cuantas veces necesite. Al emitirla tomará su
              número y no podrá editarse.
            </>
          }
        >
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
                onDiscard={() => setDiscarding(true)}
                isDiscarding={deleteQuoteDraft.isPending}
                onClose={() => setEditingId(null)}
              />
            ) : (
              <CreateQuoteForm
                key={editing.id}
                req={requisitionFromDraft(editing)}
                draft={editing}
                onDiscard={() => setDiscarding(true)}
                isDiscarding={deleteQuoteDraft.isPending}
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
        </FormDialogContent>
      </Dialog>

      <DiscardQuoteDraftDialog
        orderNumber={editing?.requisition_order?.order_number}
        pricedCount={pricedCount}
        open={discarding}
        onOpenChange={setDiscarding}
        isPending={deleteQuoteDraft.isPending}
        onConfirm={async () => {
          if (!editing || !selectedCompany) return;
          await deleteQuoteDraft.mutateAsync({
            id: editing.id,
            company: selectedCompany.slug,
          });
          setEditingId(null);
        }}
      />
    </QuoteDraftEditorContext.Provider>
  );
}
