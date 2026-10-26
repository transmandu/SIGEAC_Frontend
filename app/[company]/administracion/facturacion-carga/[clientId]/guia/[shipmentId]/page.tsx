"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useGetCargoShipmentById } from "@/hooks/operaciones/cargo/useGetCargoShipmentById";
import { CargoShipmentDetail } from "@/components/cards/operaciones/cargo/CargoShipmentDetail";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

export default function AdminCargoGuideDetailPage() {
  const params = useParams();
  const company = params.company as string;
  const clientId = params.clientId as string;
  const shipmentId = params.shipmentId as string;

  const {
    data: shipment,
    isLoading,
    isError,
  } = useGetCargoShipmentById(company, shipmentId);

  if (isLoading) {
    return (
      <ContentLayout title="Detalle de la Guía">
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
            <Link
              href={`/${company}/administracion/facturacion-carga/${clientId}`}
            >
              Volver a facturación
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Detalle de Guía">
      <PageHeader className="mb-6" currentLabel={shipment?.guide_number} />
      <div className="flex flex-col gap-6 p-1 max-w-6xl mx-auto w-full pb-10">
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-9 w-9">
              <Link
                href={`/${company}/administracion/facturacion-carga/${clientId}`}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Guía Nº{" "}
                <span className="text-primary">{shipment.guide_number}</span>
              </h1>
            </div>
          </div>
        </div>

        <CargoShipmentDetail shipment={shipment} />
      </div>
    </ContentLayout>
  );
}
