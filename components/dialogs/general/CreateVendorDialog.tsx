"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { useState, useEffect } from "react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import CreateVendorForm from "@/components/forms/general/CreateVendorForm";
import { useTourContext } from "@/components/tour/TourProvider";
import { proveedoresCrearSteps } from "@/components/tour/steps/ajustes/proveedores/proveedores-crear";

interface CreateVendorDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateVendorDialog({
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: CreateVendorDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const onOpenChange = onOpenChangeProp ?? setInternalOpen;

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "proveedores-crear",
        "Proveedores - Crear",
        proveedoresCrearSteps,
      );
    }
    return () => unregisterTour("proveedores-crear");
  }, [open, registerTour, unregisterTour]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear proveedor
        </ActionTriggerButton>
      </DialogTrigger>

      <FormDialogContent
        icon={Building2}
        title="Nuevo proveedor"
        description="Registre un proveedor o beneficiario para la gestión de compras."
        tourId="proveedores-dialog-header"
        className="sm:max-w-2xl"
      >
        <CreateVendorForm onClose={() => onOpenChange(false)} />
      </FormDialogContent>
    </Dialog>
  );
}
