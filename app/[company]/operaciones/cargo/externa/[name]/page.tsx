"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useSearchParams } from "next/navigation";
import { useGetCargoShipmentsByExternalAircraft } from "@/hooks/operaciones/cargo/useGetCargoShipmentsByExternalAircraft";
import { getColumns } from "../../columns";
import { DataTable } from "../../data-table";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plane, Plus, Download } from "lucide-react";
import { MonthYearPicker } from "@/components/selects/MonthYearPicker";
import { useExportCargoByAircraft } from "@/hooks/operaciones/cargo/useExportCargoByAircraft";
import { LoadingDataTable } from "@/components/tables/LoadingDataTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ExternalAircraftCargoPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const company = params.company as string;
  const name = decodeURIComponent(params.name as string);

  const initialMonth =
    Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const initialYear =
    Number(searchParams.get("year")) || new Date().getFullYear();

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  const { data, isLoading, isError } = useGetCargoShipmentsByExternalAircraft(
    company,
    name,
    month,
    year,
  );

  const { user } = useAuth();
  const userRoles = user?.roles?.map((r) => r.name) || [];
  const canWrite = userRoles.some((r) =>
    ["OPERADOR_CARGA", "SUPERUSER"].includes(r),
  );

  const { exportToExcel, isExporting } = useExportCargoByAircraft(company);

  const columns = getColumns(isCurrentMonth, company, canWrite);

  return (
    <ContentLayout title="Registros de Carga">
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
              <BreadcrumbPage>{name} (Externa)</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <Plane className="h-7 w-7 text-amber-500" />
            <h1 className="text-4xl font-bold">
              <span className="text-amber-600 dark:text-amber-400">{name}</span>
              <span className="text-muted-foreground text-2xl ml-2 font-normal">
                — Aeronave Externa
              </span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Guías de carga registradas para esta aeronave externa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center bg-muted/30 p-3 rounded-lg border mt-4 mb-2 gap-4">
          <div className="flex items-center gap-3">
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
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Filtrar por:
            </span>
            <MonthYearPicker
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => exportToExcel(name, month, year, name, true)}
              disabled={isExporting || isLoading || !data?.length}
            >
              <Download className="size-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar Excel"}
            </Button>

            {canWrite && isCurrentMonth && (
              <Button asChild>
                <Link
                  href={`/${company}/operaciones/cargo/externa/${encodeURIComponent(name)}/nuevo`}
                >
                  <Plus className="size-4 mr-2" />
                  Nuevo Registro
                </Link>
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingDataTable />
        ) : isError ? (
          <p className="text-muted-foreground text-sm italic text-center py-10">
            Ha ocurrido un error al cargar los registros...
          </p>
        ) : (
          data && <DataTable columns={columns} data={data} />
        )}
      </div>
    </ContentLayout>
  );
};

export default ExternalAircraftCargoPage;
