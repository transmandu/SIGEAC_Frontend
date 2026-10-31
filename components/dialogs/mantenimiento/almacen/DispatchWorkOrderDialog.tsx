"use client";

import { useSetDispatchWorkOrder } from "@/actions/mantenimiento/almacen/solicitudes/salida/action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResettingState } from "@/hooks/useResettingState";
import { useCompanyStore } from "@/stores/CompanyStore";
import { Loader2 } from "lucide-react";
import { type FormEvent } from "react";

const WORK_ORDER_FORMAT = /^\d{6}-[A-Z0-9]+-\d{2}$/;

interface DispatchWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: number | string;
  requestNumber: string;
}

const DispatchWorkOrderDialog = ({
  open,
  onOpenChange,
  dispatchId,
  requestNumber,
}: DispatchWorkOrderDialogProps) => {
  const { selectedCompany } = useCompanyStore();
  const setWorkOrder = useSetDispatchWorkOrder();
  const [value, setValue] = useResettingState("", [open, dispatchId]);

  const normalized = value.trim();
  const isValid = WORK_ORDER_FORMAT.test(normalized);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCompany?.slug || !isValid || setWorkOrder.isPending) return;
    setWorkOrder.mutate(
      {
        id: dispatchId,
        company: selectedCompany.slug,
        work_order: normalized,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Orden de trabajo</DialogTitle>
          <DialogDescription>
            Solicitud {requestNumber}. Solo se completa la orden de trabajo; no
            cambia artículos ni cantidades.
          </DialogDescription>
        </DialogHeader>

        <form
          id="dispatch-work-order-form"
          onSubmit={handleSubmit}
          className="space-y-2"
        >
          <Label htmlFor="dispatch-work-order">Ord. de Trabajo</Label>
          <Input
            id="dispatch-work-order"
            className="h-10"
            placeholder="Ej: 220426-B1-01"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            autoFocus
          />
          {normalized && !isValid && (
            <p className="text-sm text-destructive">
              Formato DDMMAA-XX-NN en mayúsculas (ej: 220426-B1-01).
            </p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="dispatch-work-order-form"
            disabled={!isValid || setWorkOrder.isPending}
          >
            {setWorkOrder.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DispatchWorkOrderDialog;
