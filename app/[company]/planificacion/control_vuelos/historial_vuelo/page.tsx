"use client";

import { Loader2, History } from "lucide-react";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useCompanyStore } from "@/stores/CompanyStore";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useGetFlightsByDateRange } from "@/hooks/aerolinea/vuelos/useGetFlightsByDateRange";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AircraftAcronym, FlightControl } from "@/types";
import PeriodFilter from "./_components/PeriodFilter";
import AircraftFilter from "./_components/AircraftFilter";
import { useFlightFilters } from "@/hooks/general/planificacion/useFlightFilters";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

const HistorialVueloPage = () => {
  const { selectedCompany } = useCompanyStore();

  // Usar hook personalizado para toda la lógica de filtros
  const filterState = useFlightFilters();

  // Las mismas aeronaves que el control de vuelos: el listado de siglas INAC
  // dejaba fuera a las que no están registradas ante el INAC.
  const { data: maintenanceAircrafts, isLoading: loadingAircrafts } =
    useGetMaintenanceAircrafts(selectedCompany?.slug);
  const aircrafts = useMemo<AircraftAcronym[]>(
    () =>
      (maintenanceAircrafts ?? []).map((a) => ({
        id: a.id,
        acronym: a.acronym,
        model: a.model ?? null,
      })),
    [maintenanceAircrafts],
  );

  // Un rango personalizado incompleto o invertido no consulta: sin rango el
  // backend devuelve todo el histórico, que no es lo que se pidió.
  const rangeError =
    filterState.periodType === "custom" &&
    (filterState.hasCustomDateError ||
      filterState.customFrom > filterState.customTo)
      ? filterState.hasCustomDateError
        ? "Indique ambas fechas del rango."
        : "La fecha inicial no puede ser posterior a la final."
      : undefined;

  // Query de vuelos usando los filtros
  const { data: flights = [], isLoading } = useGetFlightsByDateRange(
    selectedCompany?.slug,
    filterState.selectedAcronym || undefined,
    filterState.dateRange ?? null,
    !rangeError,
  );

  return (
    <ContentLayout title="Historial de Vuelo">
      <div className="flex flex-col gap-6 w-full">
        {/* Breadcrumb */}
        <PageHeader />

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
                aircrafts={aircrafts}
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
            {!filterState.selectedAcronym ? (
              <div className="text-center py-20 text-muted-foreground">
                Seleccione una aeronave para ver su historial de vuelos
              </div>
            ) : rangeError ? (
              <div className="text-center py-20 text-muted-foreground">
                {rangeError}
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No hay vuelos para el período seleccionado
              </div>
            ) : (
              <DataTable<FlightControl> columns={columns} data={flights} />
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default HistorialVueloPage;
