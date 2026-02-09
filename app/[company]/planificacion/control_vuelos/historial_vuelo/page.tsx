"use client";

import { Loader2, History } from "lucide-react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetAircraftAcronyms } from "@/hooks/aerolinea/aeronaves/useGetAircraftAcronyms";
import { useGetFlightsByDateRange } from "@/hooks/aerolinea/vuelos/useGetFlightsByDateRange";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { FlightControl } from "@/types";
import PeriodFilter from "./_components/PeriodFilter";
import AircraftFilter from "./_components/AircraftFilter";
import { useFlightFilters } from "@/hooks/general/planificacion/useFlightFilters";
import Link from "next/link";

const HistorialVueloPage = () => {
  const { selectedCompany } = useCompanyStore();

  // Usar hook personalizado para toda la lógica de filtros
  const filterState = useFlightFilters();

  // Datos de aeronaves
  const { data: aircrafts, isLoading: loadingAircrafts } =
    useGetAircraftAcronyms(selectedCompany?.slug);

  // Query de vuelos usando los filtros
  const { data: flights = [], isLoading } = useGetFlightsByDateRange(
    selectedCompany?.slug,
    filterState.selectedAcronym || undefined,
    filterState.dateRange ?? null,
  );

  return (
    <ContentLayout title="Historial de Vuelo">
      <div className="flex flex-col gap-6 w-full">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${selectedCompany?.slug}/planificacion/control_vuelos/vuelos`}
                >
                  Regresar
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Historial de Vuelo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <History className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Historial de Vuelo</h1>
            <p className="text-sm text-muted-foreground">
              Registro de vuelos por aeronave y período
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {/* Filtro de Aeronave */}
          <Card className="w-full">
            <CardHeader>
              <AircraftFilter
                selectedAcronym={filterState.selectedAcronym}
                onAcronymChange={filterState.setSelectedAcronym}
                aircrafts={aircrafts || []}
                loading={loadingAircrafts}
              />
            </CardHeader>
          </Card>

          {/* Filtro de Período */}
          <Card className="w-full">
            <CardHeader>
              <PeriodFilter
                periodType={filterState.periodType}
                onPeriodTypeChange={filterState.setPeriodType}
                selectedMonth={filterState.selectedMonth}
                onMonthChange={filterState.setSelectedMonth}
                selectedYear={filterState.selectedYear}
                onYearChange={filterState.setSelectedYear}
                customFrom={filterState.customFrom}
                onCustomFromChange={filterState.setCustomFrom}
                customTo={filterState.customTo}
                onCustomToChange={filterState.setCustomTo}
              />
            </CardHeader>
          </Card>
        </div>

        {/* Tabla de resultados */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Registros de Vuelo</h2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No hay vuelos para el período seleccionado
              </div>
            ) : (
              <DataTable<FlightControl, []>
                columns={columns}
                data={flights}
                totalRecords={flights.length}
                currentPage={1}
                onPageChange={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default HistorialVueloPage;
