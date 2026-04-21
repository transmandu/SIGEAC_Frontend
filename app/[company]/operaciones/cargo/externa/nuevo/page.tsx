"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";

export default function CreateExternalCargoPage() {
  return (
    <ContentLayout title="Nuevo Registro">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold">Registro para Aeronave Externa</h1>
          <p className="text-sm text-muted-foreground italic">
            Complete el formulario para registrar carga en esta aeronave
            externa.
          </p>
        </div>
        <div className="">
          <CreateCargoShipmentForm isExternalMode={true} />
        </div>
      </div>
    </ContentLayout>
  );
}
