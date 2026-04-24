"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetCargoShipmentById } from "@/hooks/operaciones/cargo/useGetCargoShipmentById";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { Loader2 } from "lucide-react";

export default function UpdateCargoShipmentPage() {
  const params = useParams();
  const company = params.company as string;
  const id = params.id as string;

  const {
    data: cargoShipment,
    isLoading,
    isError,
  } = useGetCargoShipmentById(company, id);

  return (
    <ContentLayout title="Editar Carga">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center">
          Modificar Carga {cargoShipment?.guide_number}
        </h1>
        <p className="text-sm text-center text-muted-foreground italic mb-6">
          Ajuste los detalles de la mercancía envíada.
        </p>

        {isLoading && (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-primary size-10" />
          </div>
        )}

        {isError && (
          <p className="text-center text-red-500 font-bold mt-10">
            Error al cargar la guía
          </p>
        )}

        {cargoShipment && (
          <div className="nax-w-4xl mx-auto w-full">
            <CreateCargoShipmentForm initialData={cargoShipment} />
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
