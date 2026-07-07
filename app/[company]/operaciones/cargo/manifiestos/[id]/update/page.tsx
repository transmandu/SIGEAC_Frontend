"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ArrowLeft, Loader2 } from "lucide-react";
import { MonthYearPicker } from "@/components/selects/MonthYearPicker";

import UpdateCargoManifestForm from "@/components/forms/operaciones/cargo/UpdateCargoManifestForm";

import { useGetCargoManifestById } from "@/hooks/operaciones/cargo/useGetCargoManifestById";
import { useTourContext } from "@/components/tour/TourProvider";
import { cargoManifiestoEditarSteps } from "@/components/tour/steps/cargo/manifiesto-editar";
import { useEffect } from "react";

const EditarManifiestoPage = () => {
  const params = useParams();
  const router = useRouter();

  const company = params.company as string;
  const id = params.id as string;

  const {
    data: manifest,
    isLoading,
    isError,
  } = useGetCargoManifestById(company, id);
  const { registerTour, unregisterTour } = useTourContext();

  useEffect(() => {
    registerTour("cargo-manifiesto-editar", "Editar Manifiesto", cargoManifiestoEditarSteps);
    return () => unregisterTour("cargo-manifiesto-editar");
  }, [registerTour, unregisterTour]);

  const handleSuccess = () => {
    if (!manifest) return;
    router.push(
      `/${company}/operaciones/cargo/manifiestos?month=${manifest.month}&year=${manifest.year}`,
    );
  };

  if (isLoading) {
    return (
      <ContentLayout title="Editar Manifiesto">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ContentLayout>
    );
  }

  if (isError || !manifest) {
    return (
      <ContentLayout title="Editar Manifiesto">
        <div className="text-center py-12">
          <p className="text-destructive font-medium">
            No se pudo cargar el manifiesto.
          </p>

          <Button asChild variant="outline" className="mt-4">
            <Link href={`/${company}/operaciones/cargo/manifiestos`}>
              Volver
            </Link>
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Editar Manifiesto ${manifest.manifest_number}`}>
      <div className="flex flex-col gap-4">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${company}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>Operaciones</BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink href={`/${company}/operaciones/cargo`}>
                Carga
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${company}/operaciones/cargo/manifiestos?month=${manifest.month}&year=${manifest.year}`}
              >
                Manifiestos
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/${company}/operaciones/cargo/manifiestos/${manifest.id}`}
              >
                {manifest.manifest_number}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Editar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="outline" size="icon" className="h-9 w-9" data-tour="cargo-manifiestos-editar-btn-volver">
            <Link
              href={`/${company}/operaciones/cargo/manifiestos?month=${manifest.month}&year=${manifest.year}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <h1 className="text-3xl font-bold" data-tour="cargo-manifiestos-editar-header">
            Editar Manifiesto - {manifest.manifest_number}
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex justify-center bg-muted/30 p-2 rounded-lg border mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Período:
            </span>
            <MonthYearPicker
              month={manifest.month}
              year={manifest.year}
              onMonthChange={() => {}}
              onYearChange={() => {}}
              disabled
            />
          </div>
        </div>

        {/* Form */}
        <UpdateCargoManifestForm
          manifest={manifest}
          company={company}
          onSuccess={handleSuccess}
        />
      </div>
    </ContentLayout>
  );
};

export default EditarManifiestoPage;
