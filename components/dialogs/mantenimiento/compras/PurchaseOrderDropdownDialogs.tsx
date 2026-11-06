"use client";

import { ClipboardCheck, Wallet } from "lucide-react";
import type { PurchaseOrder } from "@/types/purchase";
import { isAeronauticalPurchaseOrder } from "@/lib/purchases/purchase-order-scope";
import { useCascadeDeletePurchaseOrder } from "@/actions/mantenimiento/compras/ordenes_compras/actions";
import { useCompanyStore } from "@/stores/CompanyStore";
import { PayPurchaseOrderForm } from "@/components/forms/mantenimiento/compras/PayPurchaseOrderForm";
import { CompleteOrderForm } from "@/components/forms/mantenimiento/compras/CompleteOrderForm";
import { ConfirmDeleteDialog } from "@/components/dialogs/shared/ConfirmDeleteDialog";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  po: PurchaseOrder;

  openApprove: boolean;
  setOpenApprove: (open: boolean) => void;

  openCascadeDelete?: boolean;
  setOpenCascadeDelete?: (open: boolean) => void;
  onSuccessCascadeDelete?: () => void;
};

const PurchaseOrderDropdownDialogs = ({
  po,
  openApprove,
  setOpenApprove,
  openCascadeDelete,
  setOpenCascadeDelete,
  onSuccessCascadeDelete,
}: Props) => {
  const { selectedCompany } = useCompanyStore();
  const { cascadeDeletePurchaseOrder } = useCascadeDeletePurchaseOrder();

  const isPaying = po.status === "PENDING";
  const isCompleting = po.status === "PAID";
  const isAeronautical = isAeronauticalPurchaseOrder(po);
  const hasRealInventoryImpact =
    po.status === "PAID" || po.status === "COMPLETED";

  // Cierra solo si resuelve: un fallo (ya avisado por toast) deja el diálogo
  // abierto para reintentar.
  const handleCascadeDelete = async () => {
    if (!selectedCompany) return;

    await cascadeDeletePurchaseOrder.mutateAsync({
      id: po.id,
      company: selectedCompany.slug,
    });

    onSuccessCascadeDelete?.();
  };

  return (
    <>
      {openCascadeDelete !== undefined && setOpenCascadeDelete && (
        <ConfirmDeleteDialog
          open={openCascadeDelete}
          onOpenChange={setOpenCascadeDelete}
          title="Eliminar orden de compra en cascada"
          entityName={`la orden de compra ${po.order_number}`}
          confirmLabel="Eliminar en cascada"
          warning={
            <>
              Esta acción es <b>irreversible</b>.{" "}
              {hasRealInventoryImpact
                ? "Esta orden ya fue pagada: se eliminarán los artículos generados y se revertirá el stock correspondiente."
                : "Se eliminarán sus artículos asociados."}
            </>
          }
          isPending={cascadeDeletePurchaseOrder.isPending}
          onConfirm={handleCascadeDelete}
        />
      )}

      {isPaying && (
        <Dialog open={openApprove} onOpenChange={setOpenApprove}>
          <FormDialogContent
            className="sm:max-w-5xl"
            icon={Wallet}
            title="Pagar orden de compra"
            description={
              <>
                Ingrese los datos de pago, costos e impuestos para la orden de
                compra{" "}
                <span className="font-medium text-foreground">
                  {po.order_number}
                </span>
                .
              </>
            }
          >
            <PayPurchaseOrderForm
              po={po}
              isAeronautical={isAeronautical}
              onClose={() => setOpenApprove(false)}
            />
          </FormDialogContent>
        </Dialog>
      )}

      {isCompleting && (
        <Dialog open={openApprove} onOpenChange={setOpenApprove}>
          <FormDialogContent
            className="sm:max-w-5xl"
            icon={ClipboardCheck}
            title="Completar orden de compra"
            description={
              <>
                Revise y confirme la información de la orden de compra{" "}
                <span className="font-medium text-foreground">
                  {po.order_number}
                </span>
                .
              </>
            }
          >
            <CompleteOrderForm
              po={po}
              isAeronautical={isAeronautical}
              onClose={() => setOpenApprove(false)}
            />
          </FormDialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PurchaseOrderDropdownDialogs;
