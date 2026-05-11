"use client";

import { ContentLayout } from "@/components/layout/ContentLayout";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useGetCargoShipmentsByAircraft } from "@/hooks/operaciones/cargo/useGetCargoShipmentsByAircraft";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { getColumns } from "../columns";
import { DataTable } from "../data-table";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Plane, Download } from "lucide-react";
import { MonthYearPicker } from "@/components/selects/MonthYearPicker";
import { LoadingDataTable } from "@/components/tables/LoadingDataTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useExportCargoByAircraft } from "@/hooks/operaciones/cargo/useExportCargoByAircraft";

const CargoByAircraftPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const company = params.company as string;
  const aircraft_id = params.aircraft_id as string;

  // Leer mes y año desde query params (venimos del Dashboard con ?month=&year=)
  const initialMonth =
    Number(searchParams.get("month")) || new Date().getMonth() + 1;
  const initialYear =
    Number(searchParams.get("year")) || new Date().getFullYear();

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  // Buscar la aeronave para mostrar su nombre en el título
  const { data: aircrafts } = useGetAircrafts(company);
  const aircraft = aircrafts?.find((a) => String(a.id) === String(aircraft_id));

  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  const { data, isLoading, isError } = useGetCargoShipmentsByAircraft(
    company,
    aircraft_id,
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
              <BreadcrumbLink href={`/${company}/operaciones/cargo?month=${month}&year=${year}`}>
                Carga
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {aircraft?.acronym || `Aeronave #${aircraft_id}`}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Cabecera con nombre de la aeronave */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center gap-3">
            <Plane className="h-7 w-7 text-primary" />
            <h1 className="text-4xl font-bold">
              {aircraft ? (
                <>
                  <span className="text-primary">{aircraft.acronym}</span>
                  <span className="text-muted-foreground text-2xl ml-2 font-normal">
                    — {aircraft.model}
                  </span>
                </>
              ) : (
                "Registros de Carga"
              )}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground text-center italic">
            Guías de carga registradas para esta aeronave.
          </p>
        </div>

        {/* Filtros y Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-muted/30 p-3 rounded-lg border mt-4 mb-2 gap-4">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
            >
              <Link href={`/${company}/operaciones/cargo?month=${month}&year=${year}`}>
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
            {canWrite && isCurrentMonth && (
              <Button asChild>
                <Link
                  href={`/${company}/operaciones/cargo/${aircraft_id}/nuevo`}
                >
                  <Plus className="size-4 mr-2" />
                  Nuevo Registro
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                exportToExcel(aircraft_id, month, year, aircraft?.acronym)
              }
              disabled={isExporting || isLoading || !data?.length}
            >
              <Download className="size-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>

        {/* Tabla de guías */}
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

export default CargoByAircraftPage;
