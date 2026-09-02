"use client";

import { Wrench } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SectionTitle } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ServiceForm } from "@/components/forms/mantenimiento/catalogo/ServiceForm";
import {
  useCreateCatalogService,
  useUpdateCatalogService,
  ServiceFormData,
} from "@/actions/mantenimiento/catalogo/servicios/actions";
import { CatalogService } from "@/types/maintenanceCatalog";
import { useCompanyStore } from "@/stores/CompanyStore";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: CatalogService;
}

export function ServiceDialog({ open, onOpenChange, service }: ServiceDialogProps) {
  const { selectedCompany } = useCompanyStore();
  const { createCatalogService } = useCreateCatalogService();
  const { updateCatalogService } = useUpdateCatalogService();

  const isPending = createCatalogService.isPending || updateCatalogService.isPending;

  const handleSubmit = async (data: ServiceFormData) => {
    if (!selectedCompany?.slug) return;

    // El diálogo se cierra solo si la mutación pasó: ante un 422/409 el toast
    // de error ya avisa y lo escrito debe seguir en pantalla para corregirlo.
    try {
      if (service) {
        await updateCatalogService.mutateAsync({ id: service.id, data, company: selectedCompany.slug });
      } else {
        await createCatalogService.mutateAsync({ data, company: selectedCompany.slug });
      }
      onOpenChange(false);
    } catch {
      // El hook de la mutación ya notificó el fallo.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle asChild>
            <SectionTitle
              icon={Wrench}
              title={service ? "Editar Servicio/Certificado" : "Nuevo Servicio/Certificado"}
              hint="Las tareas y sus requisitos se agregan después, desde la acción de tareas."
            />
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-1 py-1">
          <ServiceForm
            flat
            // El formulario guarda su estado internamente: sin remontarlo, un
            // alta cancelada reaparece escrita en la siguiente apertura.
            key={`${service?.id ?? "new"}-${String(open)}`}
            service={service}
            isPending={isPending}
            onSubmit={handleSubmit}
            submitLabel={service ? "Guardar Cambios" : "Crear Servicio/Certificado"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
