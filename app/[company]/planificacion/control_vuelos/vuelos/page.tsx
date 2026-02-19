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
import { AlertTriangle, Plane } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { AircraftStatsBanner } from "./_components/AircraftStatsBanner";
import { useGetAverageCyclesAndHours } from "@/hooks/aerolinea/vuelos/useGetAverageCyclesAndHours";

const FlightControlPage = () => {
  const { selectedCompany } = useCompanyStore();
  const companySlug = selectedCompany?.slug ?? "";

  const {
    data: flights,
    isLoading,
    isError,
  } = useGetFlightControl(companySlug);
  const { data: aircrafts, isLoading: isAircraftsLoading } =
    useGetMaintenanceAircrafts(companySlug);

  const [activeAircraftId, setActiveAircraftId] = useState<string>("");

  const activeAircraftAcronym = useMemo(() => {
    const selected = aircrafts?.find((a) => String(a.id) === activeAircraftId);
    return selected?.acronym ?? "";
  }, [aircrafts, activeAircraftId]);

  useEffect(() => {
    if (!activeAircraftId && aircrafts?.length) {
      setActiveAircraftId(String(aircrafts[0].id));
    }
  }, [aircrafts, activeAircraftId]);
  const {
    data: averageStats,
    isLoading: isLoadingAverageStats,
    isError: isErrorAverageStats,
  } = useGetAverageCyclesAndHours(selectedCompany?.slug, activeAircraftAcronym);

  const columns = useMemo(() => getColumns(companySlug), [companySlug]);

  const activeFlights = useMemo(() => {
    if (!flights?.length || !activeAircraftId) return [];
    const id = Number(activeAircraftId);
    return flights.filter((f) => f.aircraft?.id === id);
  }, [flights, activeAircraftId]);

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

  if (isLoading || isAircraftsLoading) return <LoadingPage />;

  return (
    <ContentLayout title="Control de vuelos">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight text-center">
            Control de Horas de Vuelo
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Registro por aeronave con horas y ciclos por operación.
          </p>
        </header>

        <CreateFlightControlDialog defaultAircraftId={activeAircraftId} />

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Ha ocurrido un problema al cargar los datos.
            </AlertDescription>
          </Alert>
        )}

        {!!aircrafts?.length && flights && (
          <Card className="">
            <div className="flex">
              <AircraftStatsBanner
                title="Totales"
                cycles={stats.totalCycles}
                hours={stats.totalCycles}
                flights={stats.count}
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
                  const data = flights.filter(
                    (f) => f.aircraft?.id === aircraft.id,
                  );

                  return (
                    <TabsContent
                      key={aircraft.id}
                      value={String(aircraft.id)}
                      className="mt-4"
                    >
                      {data.length ? (
                        <DataTable columns={columns} data={data} />
                      ) : (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
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
