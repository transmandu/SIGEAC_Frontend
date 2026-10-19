"use client";

import { useState, useEffect } from "react";
import { ActionTriggerButton } from "@/components/misc/ActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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

      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader data-tour="proveedores-dialog-header">
          <DialogTitle>Nuevo proveedor</DialogTitle>
          <DialogDescription>
            Registre un proveedor o beneficiario para la gestión de compras.
          </DialogDescription>
        </DialogHeader>
        <CreateVendorForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
