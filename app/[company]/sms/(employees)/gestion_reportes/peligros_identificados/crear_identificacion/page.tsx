'use client'

import { useSearchParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateDangerIdentificationForm from "@/components/forms/aerolinea/sms/CreateIdentificationForm";

export default function CreateDangerIdentificationPage() {
  const searchParams = useSearchParams();
  const reporteId = searchParams.get("reporteId");

  if (!reporteId) {
    throw new Error("Falta el id del reporte en los parámetros de búsqueda");
  }

  return (
    <ContentLayout title="Crear Identificación de Peligro">
      
        
          <CreateDangerIdentificationForm
            id={Number(reporteId)}
            reportType="RVP"
          />
      
    </ContentLayout>
  );
}
