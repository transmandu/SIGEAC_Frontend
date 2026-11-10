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
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
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
            <div className="min-w-0">
              <h1
                className="flex flex-wrap items-center gap-2 break-words text-xl font-bold sm:text-2xl"
                data-tour="cargo-detalle-title"
              >
                <FileText className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
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
