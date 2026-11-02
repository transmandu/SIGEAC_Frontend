"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaxFlightForm } from "@/components/forms/operaciones/counter/PaxFlightForm";
import { usePaxFlight } from "@/actions/counter/actions";
import { Loader2 } from "lucide-react";

const UpdatePaxFlightPage = () => {
  const router = useRouter();
  const params = useParams();
  const company = params.company as string;
  const id = Number(params.id);

  const { data: flight, isLoading, isError } = usePaxFlight(company, id);

  useEffect(() => {
    if (flight && flight.status !== "BORRADOR") {
      router.replace(`/${company}/operaciones/counter/${id}`);
    }
  }, [flight, company, id, router]);

  if (flight && flight.status !== "BORRADOR") {
    return null;
  }

  return (
    <ContentLayout title={`Editar Manifiesto ${flight?.flight_code || ""}`}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
        <PageHeader className="mb-2" />

        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Manifiesto {flight?.flight_code}
          </h1>
          <p className="text-muted-foreground text-sm">
            Modifique los datos operativos o los pasajeros registrados en este vuelo.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : isError || !flight ? (
          <p className="text-muted-foreground text-center py-12">
            No se encontró el manifiesto de vuelo.
          </p>
        ) : (
          <PaxFlightForm company={company} initialData={flight} isEditing />
        )}
      </div>
    </ContentLayout>
  );
};

export default UpdatePaxFlightPage;
