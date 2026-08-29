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
import { Plus, Truck } from "lucide-react";
import { CreateShippingAgencyForm } from "@/components/forms/general/CreateShippingAgencyForm";
import { useTourContext } from "@/components/tour/TourProvider";
import { agenciasEnvioCrearSteps } from "@/components/tour/steps/ajustes/agencia-envios/agencias-envio-crear";

export function CreateShippingAgencyDialog() {
  const [open, setOpen] = useState(false);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour(
        "agencias-envio-crear",
        "Agencias - Crear",
        agenciasEnvioCrearSteps,
      );
    }

    return () => unregisterTour("agencias-envio-crear");
  }, [registerTour, unregisterTour, open]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionTriggerButton>
          <Plus className="h-4 w-4 mr-2" />
          Crear agencia
        </ActionTriggerButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-3xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <div className="relative px-6 pt-8 pb-5 bg-gradient-to-br from-blue-500/5 via-background to-background">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Truck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle
                  className="text-xl font-semibold tracking-tight"
                  data-tour="agencias-envio-crear-header"
                >
                  Nueva agencia de envío
                </DialogTitle>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  Gestión logística
                </p>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Registra una nueva agencia de envío para la gestión de
                  distribución y logística del sistema.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6">
          <CreateShippingAgencyForm onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
