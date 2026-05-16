"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MonthYearPicker } from "@/components/selects/MonthYearPicker";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import CreateCargoManifestForm from "@/components/forms/operaciones/cargo/CreateCargoManifestForm";

const NuevoManifiestoPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = params.company as string;

  const [month, setMonth] = useState(
    Number(searchParams.get("month")) || new Date().getMonth() + 1,
  );
  const [year, setYear] = useState(
    Number(searchParams.get("year")) || new Date().getFullYear(),
  );

  const handleSuccess = () => {
    router.push(
      `/${company}/operaciones/cargo/manifiestos?month=${month}&year=${year}`,
    );
  };

  return (
    <ContentLayout title="Nuevo Manifiesto de Carga">
      <div className="flex flex-col gap-4">
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
                href={`/${company}/operaciones/cargo/manifiestos?month=${month}&year=${year}`}
              >
                Manifiestos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nuevo Manifiesto</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link
              href={`/${company}/operaciones/cargo/manifiestos?month=${month}&year=${year}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Nuevo Manifiesto de Carga
            </h1>
            <p className="text-muted-foreground mt-1">
              Selecciona las guías disponibles e ingresa el peso y unidades a
              despachar.
            </p>
          </div>
        </div>

        <div className="flex justify-between bg-muted/30 p-3 rounded-lg border mt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Período:
            </span>
            <MonthYearPicker
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>
        </div>

        <CreateCargoManifestForm
          company={company}
          month={month}
          year={year}
          onSuccess={handleSuccess}
        />
      </div>
    </ContentLayout>
  );
};

export default NuevoManifiestoPage;
