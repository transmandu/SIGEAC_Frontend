"use client";

import {
  useCascadeDeleteRequisition,
  useDeleteRequisition,
  useUpdateRequisitionStatus,
} from "@/actions/mantenimiento/compras/requisiciones/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { MyRequisition, Requisition } from "@/types/purchase";
import { ClipboardX, Receipt } from "lucide-react";
import LoadingPage from "@/components/misc/LoadingPage";
import { CreateQuoteForm } from "@/components/forms/mantenimiento/compras/CreateQuoteForm";
import { CreateGeneralQuoteForm } from "@/components/forms/general/compras/CreateGeneralQuoteForm";
import { ConfirmActionDialog } from "@/components/dialogs/shared/ConfirmActionDialog";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  labelClass,
  textareaClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { useState } from "react";

function transformApiData(apiData: any) {
  return {
    order_number: apiData.order_number,
    justification: apiData.justification,
    company: "",
    created_by: apiData.created_by?.id?.toString() ?? "",
    tax: "0",
    requested_by: apiData.requested_by,

    articles: apiData.batch.map((batch: any) => ({
      batch: batch.id.toString(),
      batch_name: batch.name,

      batch_articles: batch.batch_articles.map((article: any) => ({
        part_number:
          article.article_part_number ||
          article.article_alt_part_number ||
          article.pma,

        unit: article.unit,
        quantity: parseFloat(article.quantity),
        image: article.image || null,
      })),
    })),
  };
}

type Props = {
  req: Requisition | MyRequisition;
  openDelete: boolean;
  setOpenDelete: (open: boolean) => void;
  openCascadeDelete?: boolean;
  setOpenCascadeDelete?: (open: boolean) => void;
  openConfirm: boolean;
  setOpenConfirm: (open: boolean) => void;
  openReject: boolean;
  setOpenReject: (open: boolean) => void;
  onSuccessUpdate?: () => void;
  onSuccessDelete?: () => void;
};

const RequisitionDropdownDialogs = ({
  req,
  openDelete,
  setOpenDelete,
  openCascadeDelete,
  setOpenCascadeDelete,
  openConfirm,
  setOpenConfirm,
  openReject,
  setOpenReject,
  onSuccessUpdate,
  onSuccessDelete,
}: Props) => {
  const { user } = useAuth();

  const { selectedCompany } = useCompanyStore();

  const { deleteRequisition } = useDeleteRequisition();

  const { cascadeDeleteRequisition } = useCascadeDeleteRequisition();

  const { updateStatusRequisition } = useUpdateRequisitionStatus();

  const [observation, setObservation] = useState("");

  const initialData = transformApiData(req);

  // Las requisiciones GENERAL cotizan sin proveedor mediante el formulario general.
  const isGeneralRequisition = req.type === "GENERAL";

  if (!selectedCompany) return <LoadingPage />;

  // Los diálogos de confirmación cierran solo si `onConfirm` resuelve: lo que
  // lanza una mutación (ya avisada por toast) los deja abiertos para reintentar.
  const handleDelete = async () => {
    await deleteRequisition.mutateAsync({
      id: req.id,
      company: selectedCompany.slug,
    });

    onSuccessDelete?.();
  };

  const handleCascadeDelete = async () => {
    await cascadeDeleteRequisition.mutateAsync({
      id: req.id,
      company: selectedCompany.slug,
    });

    onSuccessDelete?.();
  };

  const handleReject = async () => {
    await updateStatusRequisition.mutateAsync({
      id: req.id,
      data: {
        status: "REJECTED",
        updated_by: `${user?.first_name} ${user?.last_name}`,
        observation: observation.trim() || null,
      },
      company: selectedCompany.slug,
    });

    setObservation("");
    onSuccessUpdate?.();
  };

  const closeQuoteForm = () => {
    setOpenConfirm(false);
    onSuccessUpdate?.();
  };

  return (
    <>
      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar solicitud"
        entityName={`la solicitud ${req.order_number}`}
        isPending={deleteRequisition.isPending}
        onConfirm={handleDelete}
      />

      {openCascadeDelete !== undefined && setOpenCascadeDelete && (
        <ConfirmDeleteDialog
          open={openCascadeDelete}
          onOpenChange={setOpenCascadeDelete}
          title="Eliminar solicitud en cascada"
          entityName={`la solicitud ${req.order_number} y toda su cadena`}
          confirmLabel="Eliminar en cascada"
          warning={
            <>
              Esta acción es <b>irreversible</b>. Se eliminarán también todas
              sus cotizaciones (incluyendo complementarias) y las órdenes de
              compra generadas por ellas, revirtiendo el inventario (artículos y
              stock) que ya se haya afectado, sin importar el estado en que se
              encuentren.
            </>
          }
          isPending={cascadeDeleteRequisition.isPending}
          onConfirm={handleCascadeDelete}
        />
      )}

      <ConfirmActionDialog
        open={openReject}
        onOpenChange={setOpenReject}
        title="Rechazar solicitud"
        entityName={req.order_number}
        icon={ClipboardX}
        tone="amber"
        confirmLabel="Rechazar"
        isPending={updateStatusRequisition.isPending}
        onConfirm={handleReject}
        extra={
          <div className="space-y-1.5">
            <Label
              htmlFor="requisition-reject-observation"
              className={labelClass}
            >
              Observación de rechazo (opcional)
            </Label>
            <Textarea
              id="requisition-reject-observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ej.: documentación incompleta, el proveedor no cumple los requisitos."
              rows={3}
              className={textareaClass}
            />
          </div>
        }
      >
        La solicitud será marcada como rechazada y cambiará su estado. Esta
        acción es <b>irreversible</b>.
      </ConfirmActionDialog>

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <FormDialogContent
          className="sm:max-w-5xl"
          icon={Receipt}
          title="Generar cotización"
          description={
            <>
              Complete la información requerida para generar una nueva
              cotización asociada a la requisición{" "}
              <span className="font-medium text-foreground">
                {req.order_number}
              </span>
              .
            </>
          }
        >
          {isGeneralRequisition ? (
            <CreateGeneralQuoteForm req={req as any} onClose={closeQuoteForm} />
          ) : (
            <CreateQuoteForm
              // Cotizar es una acción exclusiva del módulo de compras (ver
              // `canQuote` en RequisitionDropdownActions), así que aquí la
              // fila siempre es la del listado ancho, nunca la de "mis
              // solicitudes".
              req={req as Requisition}
              initialData={initialData}
              onClose={closeQuoteForm}
            />
          )}
        </FormDialogContent>
      </Dialog>
    </>
  );
};

export default RequisitionDropdownDialogs;
