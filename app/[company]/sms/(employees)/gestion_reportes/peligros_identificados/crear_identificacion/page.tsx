"use client";

import { useSearchParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { crearIdentificacionSteps } from "@/components/tour/steps/sms/reportes/crear-identificacion";

export default function CreateDangerIdentificationPage() {
  const searchParams = useSearchParams();
  const reporteId = searchParams.get("reporteId");
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "sms-crear-identificacion",
      "Crear Identificación de Peligro",
      crearIdentificacionSteps,
    );
    return () => unregisterTour("sms-crear-identificacion");
  }, [registerTour, unregisterTour]);

  if (!reporteId) {
    throw new Error("Falta el id del reporte en los parámetros de búsqueda");
  }

  return (
    <ContentLayout title="Crear Identificación de Peligro">
      <CreateDangerIdentificationForm id={Number(reporteId)} reportType="RVP" />
    </ContentLayout>
  );
}
