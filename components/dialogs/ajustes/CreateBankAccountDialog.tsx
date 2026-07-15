"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import CreateBankAccountForm from "@/components/forms/ajustes/CreateBankAccountForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTourContext } from "@/components/tour/TourProvider";
import { cuentasCrearSteps } from "@/components/tour/steps/ajustes/banca/cuentas-crear";

export function CreateBankAccountDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    if (open) {
      registerTour("cuentas-crear", "Cuentas - Crear", cuentasCrearSteps);
    }

    return () => unregisterTour("cuentas-crear");
  }, [registerTour, unregisterTour, open]);

  // La gestión de cuentas (incluida su habilitación por compañía) es
  // exclusiva de ADMINISTRAC (el backend también lo exige).IÓN
  const ALLOWED_ROLES = [
    "SUPERUSER",
    "JEFE_ADMINISTRACION",
    "ANALISTA_ADMINISTRACION",
  ];

  const hasAccess = user?.roles?.some((role) =>
    ALLOWED_ROLES.includes(role.name),
  );

  if (!hasAccess) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant={"outline"}
          className="flex items-center justify-center gap-2 h-8 border-dashed"
        >
          Nuevo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] md:max-w-[650px]">
        <DialogHeader>
          <DialogTitle data-tour="cuentas-crear-header">
            Creación de Cuenta Bancaria
          </DialogTitle>
          <DialogDescription>
            Cree una cuenta rellenando la información necesaria y habilítela
            para una o varias compañías.
          </DialogDescription>
        </DialogHeader>
        <CreateBankAccountForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
