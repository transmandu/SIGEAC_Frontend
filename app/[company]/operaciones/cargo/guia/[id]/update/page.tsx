"use client";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useGetCargoShipmentById } from "@/hooks/operaciones/cargo/useGetCargoShipmentById";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { Loader2, ArrowLeft, Lock, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { parseISO } from "date-fns";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { cargoGuiaCrearSteps } from "@/components/tour/steps/cargo/guia-crear";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export default function UpdateCargoShipmentPage() {
  const params = useParams();
  const company = params.company as string;
  const id = params.id as string;

  const { user } = useAuth();
  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );

  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "cargo-guia-editar",
      "Editar Guía de Carga",
      cargoGuiaCrearSteps,
    );
    return () => unregisterTour("cargo-guia-editar");
  }, [registerTour, unregisterTour]);

  const {
    data: cargoShipment,
    isLoading,
    isError,
  } = useGetCargoShipmentById(company, id);

  const backHref = cargoShipment?.aircraft
    ? `/${company}/operaciones/cargo/${cargoShipment.aircraft.id}?month=${cargoShipment.month}&year=${cargoShipment.year}`
    : `/${company}/operaciones/cargo/externa/${encodeURIComponent(cargoShipment?.external_aircraft || "")}?month=${cargoShipment?.month}&year=${cargoShipment?.year}`;

  if (!canWrite) {
    return (
      <ContentLayout title="Editar Carga">
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <ShieldX className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">No autorizado</p>
          <p className="text-sm text-muted-foreground">
            No tienes permisos para editar guías de carga.
          </p>
          <Button asChild variant="outline">
            <Link href={`/${company}/operaciones/cargo`}>Volver</Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Editar Carga">
      <PageHeader className="mb-6" currentLabel={cargoShipment?.guide_number} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-9 w-9"
            data-tour="cargo-crear-btn-volver"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1
            className="text-3xl font-bold text-center"
            data-tour="cargo-crear-title"
          >
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

        {cargoShipment?.manifest_status === "MANIFESTED" && (
          <div className="flex flex-col items-center gap-4 mt-16 text-center">
            <Lock className="size-10 text-muted-foreground" />
            <p className="text-lg font-semibold">
              Esta guía está totalmente manifestada y no puede modificarse.
            </p>
            <p className="text-sm text-muted-foreground">
              El manifiesto refleja el envío real; para corregir datos consulte
              con operaciones.
            </p>
            <Button asChild variant="outline">
              <Link href={backHref}>Volver</Link>
            </Button>
          </div>
        )}

        {cargoShipment && cargoShipment.manifest_status !== "MANIFESTED" && (
          <div className="nax-w-4xl mx-auto w-full">
            <CreateCargoShipmentForm initialData={cargoShipment} />
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
