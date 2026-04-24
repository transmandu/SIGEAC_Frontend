"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { PackagePlus } from "lucide-react";

export default function CreateGenericCargoPage() {
  return (
    <ContentLayout title="Nuevo Registro">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <PackagePlus className="text-muted-foreground mr-1 size-7" />
            Nuevo Registro De Carga
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete el formulario para aperturar un nuevo control de carga
            (manifiesto).
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold">Formulario de Registro</h1>
          <p className="text-sm text-muted-foreground italic">
            Complete el formulario para registrar carga. Seleccione la aeronave
            de la empresa de la lista.
          </p>
        </div>
        <div className="bg-background rounded-xl">
          <CreateCargoShipmentForm />
        </div>
      </div>
    </ContentLayout>
  );
}
