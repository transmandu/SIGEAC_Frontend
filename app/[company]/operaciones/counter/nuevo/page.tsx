"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaxFlightForm } from "@/components/forms/operaciones/counter/PaxFlightForm";

const NewPaxFlightPage = () => {
  const params = useParams();
  const company = params.company as string;

  return (
    <ContentLayout title="Nuevo Manifiesto de Vuelo">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
        <PageHeader className="mb-2" />

        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Emisión de Manifiesto de Vuelo
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete la ficha del vuelo para generar el manifiesto oficial de pasajeros y/o carga.
          </p>
        </div>

        <PaxFlightForm company={company} />
      </div>
    </ContentLayout>
  );
};

export default NewPaxFlightPage;
