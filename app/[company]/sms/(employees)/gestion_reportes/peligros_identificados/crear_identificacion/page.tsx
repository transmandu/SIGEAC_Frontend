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
      <div className="flex justify-center mt-6">
        <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-md">
          <CreateDangerIdentificationForm
            
            id={Number(reporteId)}
            reportType="RVP"
          />
        </div>
      </div>
    </ContentLayout>
  );
}
