"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { PackagePlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { cargoGuiaCrearSteps } from "@/components/tour/steps/cargo/guia-crear";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CreateGenericCargoPage() {
  const params = useParams();
  const company = params.company as string;
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "cargo-guia-crear",
      "Nuevo Registro de Carga",
      cargoGuiaCrearSteps,
    );
    return () => unregisterTour("cargo-guia-crear");
  }, [registerTour, unregisterTour]);

  return (
    <ContentLayout title="Nuevo Registro">
      <PageHeader className="mb-6" />

      <div className="mb-8 flex items-start gap-3 sm:items-center sm:gap-4">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
        >
          <Link href={`/${company}/operaciones/cargo`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1
            className="flex items-center gap-2 break-words text-2xl font-bold tracking-tight text-primary sm:text-3xl"
            data-tour="cargo-crear-title"
          >
            <PackagePlus className="mr-1 size-6 shrink-0 text-muted-foreground sm:size-7" />
            Nuevo Registro De Carga
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete el formulario para aperturar un nuevo control de carga
            (manifiesto).
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold">Formulario de Registro</h1>
          <p className="text-sm text-muted-foreground italic">
            Complete el formulario para registrar carga. Seleccione la aeronave
            de la empresa de la lista.
          </p>
        </div>
        <div className="bg-background rounded-xl">
          <CreateCargoShipmentForm />
        </div>
      </div>
    </ContentLayout>
  );
}
