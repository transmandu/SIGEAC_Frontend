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
import { Plus, Handshake } from "lucide-react";
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

      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <div
          className="relative px-6 pt-8 pb-5 bg-gradient-to-br from-blue-500/5 via-background to-background"
          data-tour="proveedores-dialog-header"
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Handshake className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Nuevo proveedor
                </DialogTitle>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  Gestión de compras
                </p>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Registra un nuevo proveedor o beneficiario para la gestión de
                  compras del sistema.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6">
          <CreateVendorForm onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
