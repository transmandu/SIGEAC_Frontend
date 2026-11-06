"use client";

import {
  useCascadeDeleteQuote,
  useDeleteQuote,
  useUpdateQuoteStatus,
} from "@/actions/mantenimiento/compras/cotizaciones/actions";
import { useCreatePurchaseOrder } from "@/actions/mantenimiento/compras/ordenes_compras/actions";
import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import LoadingPage from "@/components/misc/LoadingPage";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Quote } from "@/types/purchase";
import { ClipboardCheck, ClipboardX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  quote: Quote;
  openReject: boolean;
  setOpenReject: (open: boolean) => void;
  openApprove: boolean;
  setOpenApprove: (open: boolean) => void;
  openDelete: boolean;
  setOpenDelete: (open: boolean) => void;
  openCascadeDelete: boolean;
  setOpenCascadeDelete: (open: boolean) => void;
  onSuccessUpdate?: () => void;
  onSuccessDelete?: () => void;
};

const QuoteDropdownDialogs = ({
  quote,
  openReject,
  setOpenReject,
  openApprove,
  setOpenApprove,
  openDelete,
  setOpenDelete,
  openCascadeDelete,
  setOpenCascadeDelete,
  onSuccessUpdate,
  onSuccessDelete,
}: Props) => {
  const { selectedCompany } = useCompanyStore();

  const { updateStatusQuote } = useUpdateQuoteStatus();
  const { createPurchaseOrder } = useCreatePurchaseOrder();
  const { deleteQuote } = useDeleteQuote();
  const { cascadeDeleteQuote } = useCascadeDeleteQuote();

  const [observation, setObservation] = useState("");

  if (!selectedCompany) return <LoadingPage />;

  // Los diálogos de confirmación cierran solo si `onConfirm` resuelve: lo que
  // lanza una mutación (ya avisada por toast) los deja abiertos para reintentar.
  const handleReject = async () => {
    await updateStatusQuote.mutateAsync({
      id: quote.id,
      data: {
        status: "REJECTED",
        observation: observation.trim() || null,
      },
      company: selectedCompany.slug,
    });

    setObservation("");
    onSuccessUpdate?.();
  };

  const handleApprove = async () => {
    const locationId =
      quote.article_quote_order.find((a) => a.location)?.location?.id ??
      quote.general_article_quote_order.find((a) => a.location)?.location?.id;

    if (locationId == null) {
      toast.error("Ningún artículo de la cotización tiene sede asignada.");
      return;
    }

    // sub_total/total no se envían: una cotización con varios proveedores (o
    // comercios) se parte en una orden por cada uno, y el backend calcula los
    // montos de cada orden solo con los artículos que le tocan.
    const poData = {
      quote_order_id: Number(quote.id),
      location_id: Number(locationId),
      purchase_date: new Date().toISOString(),
      articles_purchase_orders: quote.article_quote_order.map((a) => ({
        article_quote_order_id: a.id,
      })),
      general_articles_purchase_orders: quote.general_article_quote_order.map(
        (a) => ({
          general_article_quote_order_id: a.id,
        }),
      ),
    };

    try {
      await createPurchaseOrder.mutateAsync({
        data: poData,
        company: selectedCompany.slug,
      });

      onSuccessUpdate?.();
    } catch {
      // El hook ya reportó el error (incluido el 409). Se cierra igual: dejarlo
      // abierto tras un fallo solo invita a insistir con el botón.
    }
  };

  const handleDelete = async () => {
    await deleteQuote.mutateAsync({
      id: quote.id,
      company: selectedCompany.slug,
    });

    onSuccessDelete?.();
  };

  const handleCascadeDelete = async () => {
    await cascadeDeleteQuote.mutateAsync({
      id: quote.id,
      company: selectedCompany.slug,
    });

    onSuccessDelete?.();
  };

  return (
    <>
      <ConfirmDeleteDialog
        open={openCascadeDelete}
        onOpenChange={setOpenCascadeDelete}
        title="Eliminar cotización en cascada"
        entityName={`la cotización ${quote.quote_number} y toda su cadena`}
        confirmLabel="Eliminar en cascada"
        warning={
          <>
            Esta acción es <b>irreversible</b>. Se eliminarán también sus
            cotizaciones complementarias y cualquier orden de compra generada a
            partir de ellas, revirtiendo el inventario (artículos y stock) que
            ya se haya afectado, sin importar el estado en que se encuentren.
          </>
        }
        isPending={cascadeDeleteQuote.isPending}
        onConfirm={handleCascadeDelete}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar cotización"
        entityName={`la cotización ${quote.quote_number}`}
        warning={
          <>
            Esta acción es <b>irreversible</b> y eliminará el registro del
            sistema.
          </>
        }
        isPending={deleteQuote.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmActionDialog
        open={openReject}
        onOpenChange={setOpenReject}
        title="Rechazar cotización"
        entityName={quote.quote_number ?? undefined}
        icon={ClipboardX}
        tone="amber"
        confirmLabel="Rechazar"
        isPending={updateStatusQuote.isPending}
        onConfirm={handleReject}
        extra={
          <div className="space-y-1.5">
            <Label htmlFor="quote-reject-observation" className="text-xs">
              Observación de rechazo (opcional)
            </Label>
            <Textarea
              id="quote-reject-observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ej.: precio no competitivo, el proveedor no cumple los requisitos."
              className="min-h-22 resize-none text-sm"
            />
          </div>
        }
      >
        La cotización será rechazada. Esta acción es <b>irreversible</b> y
        afectará el estado de la solicitud asociada.
      </ConfirmActionDialog>

      <ConfirmActionDialog
        open={openApprove}
        onOpenChange={setOpenApprove}
        title="Aprobar cotización"
        entityName={quote.quote_number ?? undefined}
        icon={ClipboardCheck}
        tone="primary"
        confirmLabel={
          createPurchaseOrder.isPending ? "Generando orden..." : "Aprobar"
        }
        isPending={createPurchaseOrder.isPending}
        onConfirm={handleApprove}
      >
        Se generará automáticamente una orden de compra a partir de la
        cotización y se actualizará el flujo de la solicitud.
      </ConfirmActionDialog>
    </>
  );
};

export default QuoteDropdownDialogs;
