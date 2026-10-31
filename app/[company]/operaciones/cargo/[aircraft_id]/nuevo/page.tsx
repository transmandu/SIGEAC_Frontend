"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, PackagePlus, ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateCargoShipmentForm from "@/components/forms/operaciones/cargo/CreateCargoShipmentForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useTourContext } from "@/components/tour/TourProvider";
import { cargoGuiaCrearSteps } from "@/components/tour/steps/cargo/guia-crear";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export default function NewCargoShipmentPage() {
  const params = useParams();
  const company = params.company as string;
  const aircraft_id = params.aircraft_id as string;
  const { user } = useAuth();
  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour(
      "cargo-guia-crear",
      "Nuevo Registro de Carga",
      cargoGuiaCrearSteps,
    );
    return () => unregisterTour("cargo-guia-crear");
  }, [registerTour, unregisterTour]);

  if (!canWrite) {
    return (
      <ContentLayout title="Registrar Carga">
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <ShieldX className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">No autorizado</p>
          <p className="text-sm text-muted-foreground">
            No tienes permisos para registrar guías de carga.
          </p>
          <Button asChild variant="outline">
            <Link href={`/${company}/operaciones/cargo/${aircraft_id}`}>
              Volver
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Registrar Carga">
      <PageHeader className="mb-6" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-9 w-9"
            data-tour="cargo-crear-btn-volver"
          >
            <Link href={`/${company}/operaciones/cargo/${aircraft_id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2"
              data-tour="cargo-crear-title"
            >
              <PackagePlus className="text-muted-foreground mr-1 size-7" />
              Nuevo Registro De Carga
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete el formulario para aperturar un nuevo control de carga
              (manifiesto).
            </p>
          </div>
        </div>

        <Card className="border-none shadow-none md:border md:shadow-xs md:bg-card text-center">
          <CardHeader className="hidden md:flex px-6 pt-6 pb-2">
            <CardTitle>Formulario de Registro</CardTitle>
            <CardDescription>
              Ingrese los datos de cabecera y el listado de productos a
              transportar.
            </CardDescription>
          </CardHeader>
          <CardContent className="md:px-6 md:pb-6 p-0">
            <CreateCargoShipmentForm />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
