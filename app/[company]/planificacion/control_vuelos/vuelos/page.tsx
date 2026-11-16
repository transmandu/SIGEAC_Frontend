"use client";

import { CreateFlightControlDialog } from "@/components/dialogs/aerolinea/administracion/CreateFlightControl";
import { ContentLayout } from "@/components/layout/ContentLayout";
import LoadingPage from "@/components/misc/LoadingPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetFlightControl } from "@/hooks/mantenimiento/planificacion/useGetFlightsControl";
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AlertTriangle, Loader2, Plane } from "lucide-react";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { AircraftStatsBanner } from "./_components/AircraftStatsBanner";
import { useGetAverageCyclesAndHours } from "@/hooks/aerolinea/vuelos/useGetAverageCyclesAndHours";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImportFlightLogDialog } from "@/components/dialogs/mantenimiento/planificacion/ImportFlightLogDialog";
import { useIsSuperuser } from "@/hooks/helpers/useIsSuperuser";

const FlightControlPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";
  const isSuperuser = useIsSuperuser();

  const {
    data: aircrafts,
    isLoading: isAircraftsLoading,
    isError: isAircraftsError,
  } = useGetMaintenanceAircrafts(companySlug);

  const [selectedAircraftId, setActiveAircraftId] = useState<string>("");

  // La elegida mientras siga existiendo; si no, la primera aeronave.
  const activeAircraftId = aircrafts?.some(
    (a) => String(a.id) === selectedAircraftId,
  )
    ? selectedAircraftId
    : aircrafts?.length
      ? String(aircrafts[0].id)
      : "";

  const {
    data: flights,
    isLoading,
    isError: isFlightsError,
  } = useGetFlightControl(companySlug, activeAircraftId);
  const isError = isAircraftsError || isFlightsError;

  const activeAircraftAcronym = useMemo(() => {
    const selected = aircrafts?.find((a) => String(a.id) === activeAircraftId);
    return selected?.acronym ?? "";
  }, [aircrafts, activeAircraftId]);

  const {
    data: averageStats,
    isLoading: isLoadingAverageStats,
    isError: isErrorAverageStats,
  } = useGetAverageCyclesAndHours(selectedCompany?.slug, activeAircraftAcronym);

  const columns = useMemo(() => getColumns(), []);

  const activeFlights = useMemo(() => flights ?? [], [flights]);

  const stats = useMemo(() => {
    const totalHours = activeFlights.reduce(
      (acc, f) => acc + Number(f.flight_hours ?? 0),
      0,
    );
    const totalCycles = activeFlights.reduce(
      (acc, f) => acc + Number(f.flight_cycles ?? 0),
      0,
    );
    return {
      count: activeFlights.length,
      totalHours,
      totalCycles,
    };
  }, [activeFlights]);

  if (isAircraftsLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de Horas de Vuelo">
      <PageHeader className="mb-6" />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-center">
            Control de Horas de Vuelo
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Registro por aeronave con horas y ciclos por operación.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <CreateFlightControlDialog defaultAircraftId={activeAircraftId} />
          {isSuperuser && (
            <ImportFlightLogDialog defaultAircraftId={activeAircraftId} />
          )}
        </div>

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Ha ocurrido un problema al cargar los datos.
            </AlertDescription>
          </Alert>
        )}

        {aircrafts && !aircrafts.length && (
          <div className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
            <Plane className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">No hay aeronaves registradas</p>
            <p className="text-xs text-muted-foreground">
              Registre una aeronave en Planificación para cargar sus vuelos.
            </p>
          </div>
        )}

        {!!aircrafts?.length && (
          <Card className="">
            <div className="flex">
              <AircraftStatsBanner
                title="Totales"
                cycles={stats.totalCycles}
                hours={stats.totalHours}
                flights={stats.count}
                isLoading={isLoading}
                isVisible={true}
              />

              {(averageStats || isLoadingAverageStats) && (
                <AircraftStatsBanner
                  title="Promedio"
                  cycles={averageStats?.average_flight_cycles ?? 0}
                  hours={averageStats?.average_flight_hours ?? 0}
                  flights={averageStats?.total_flights ?? 0}
                  isLoading={isLoadingAverageStats}
                  isVisible={true}
                />
              )}
            </div>

            <CardContent className="pt-0">
              <Tabs
                value={activeAircraftId}
                onValueChange={setActiveAircraftId}
                className="w-full"
              >
                <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted/40 p-1">
                  {aircrafts.map((aircraft) => (
                    <TabsTrigger
                      key={aircraft.id}
                      value={String(aircraft.id)}
                      className="whitespace-nowrap"
                    >
                      {aircraft.acronym}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {aircrafts.map((aircraft) => {
                  const isActive = String(aircraft.id) === activeAircraftId;

                  return (
                    <TabsContent
                      key={aircraft.id}
                      value={String(aircraft.id)}
                      className="mt-4"
                    >
                      {isActive && isLoading ? (
                        <div className="flex min-h-60 items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : isActive && activeFlights.length ? (
                        <DataTable columns={columns} data={activeFlights} />
                      ) : (
                        <div className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                          <Plane className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Sin vuelos registrados
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cuando se registren vuelos para {aircraft.acronym},
                            aparecerán aquí.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
};

export default FlightControlPage;
