"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { useParams } from "next/navigation";

export default function CreateExternalCargoPage() {
  const params = useParams();
  const name = decodeURIComponent(params.name as string);

  return (
    <ContentLayout title="Nuevo Registro">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-bold">Registro para {name} </h1>
          <p className="text-sm text-muted-foreground italic">
            Complete el formulario para registrar carga en esta aeronave
            externa.
          </p>
        </div>
        <div className="bg-background rounded-xl p-4 md:px-8 border shadow-sm">
          <CreateCargoShipmentForm />
        </div>
      </div>
    </ContentLayout>
  );
}
