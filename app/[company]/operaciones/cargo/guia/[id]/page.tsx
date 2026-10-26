"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetCargoShipmentById } from "@/hooks/operaciones/cargo/useGetCargoShipmentById";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, ArrowLeft } from "lucide-react";
import { useTourContext } from "@/components/tour/TourProvider";
import { cargoGuiaDetalleSteps } from "@/components/tour/steps/cargo/guia-detalle";
import { PageHeader } from "@/components/layout/PageHeader";
import { CargoShipmentDetail } from "@/components/cards/operaciones/cargo/CargoShipmentDetail";

export default function CargoDetailsPage() {
  const params = useParams();
  const company = params.company as string;
  const id = params.id as string;
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "cargo-guia-detalle",
      "Detalle de Guía",
      cargoGuiaDetalleSteps,
    );
    return () => unregisterTour("cargo-guia-detalle");
  }, [registerTour, unregisterTour]);

  const {
    data: shipment,
    isLoading,
    isError,
  } = useGetCargoShipmentById(company, id);

  if (isLoading) {
    return (
      <ContentLayout title="Detalles de carga">
        <PageHeader className="mb-6" />

        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin size-12 text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !shipment) {
    return (
      <ContentLayout title="Error">
        <PageHeader className="mb-6" />

        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-xl text-red-500 font-semibold">
            No se pudo encontrar el registro de carga especificado.
          </p>
          <Button asChild variant="outline">
            <Link href={`/${company}/operaciones/cargo`}>
              Volver al listado
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Detalles de la Carga">
      <PageHeader className="mb-6" currentLabel={shipment?.guide_number} />

      <div className="flex flex-col gap-6 p-1 max-w-6xl mx-auto w-full pb-10">
        {/* Cabecera de Acciones Rápidas */}
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-9 w-9"
              data-tour="cargo-detalle-btn-volver"
            >
              <Link
                href={
                  shipment.aircraft
                    ? `/${company}/operaciones/cargo/${shipment.aircraft.id}?month=${shipment.month}&year=${shipment.year}`
                    : `/${company}/operaciones/cargo/externa/${encodeURIComponent(shipment.external_aircraft || "")}?month=${shipment.month}&year=${shipment.year}`
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1
                className="text-2xl font-bold flex items-center gap-2"
                data-tour="cargo-detalle-title"
              >
                <FileText className="h-6 w-6 text-primary" />
                Guía N°{" "}
                <span className="text-primary">{shipment.guide_number}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Cuerpo compartido: tarjetas de información + manifiesto */}
        <CargoShipmentDetail shipment={shipment} />
      </div>
    </ContentLayout>
  );
}
