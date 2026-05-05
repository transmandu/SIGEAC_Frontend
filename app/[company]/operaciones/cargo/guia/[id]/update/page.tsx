"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetCargoShipmentById } from "@/hooks/operaciones/cargo/useGetCargoShipmentById";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link
              href={
                cargoShipment?.aircraft
                  ? `/${company}/operaciones/cargo/${cargoShipment.aircraft.id}`
                  : `/${company}/operaciones/cargo/externa/${encodeURIComponent(cargoShipment?.external_aircraft || "")}`
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-center">
            Modificar Carga {cargoShipment?.guide_number}
          </h1>
        </div>

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
