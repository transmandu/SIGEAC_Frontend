"use client"

import { useEffect, useMemo, useState } from "react"
import { ContentLayout } from "@/components/layout/ContentLayout"
import LoadingPage from "@/components/misc/LoadingPage"
import { useGetFlightControl } from "@/hooks/mantenimiento/planificacion/useGetFlightsControl"
import { useCompanyStore } from "@/stores/CompanyStore"
import { useGetMaintenanceAircrafts } from "@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plane, Clock, Repeat2, AlertTriangle } from "lucide-react"
import { DataTable } from "./data-table"
import { getColumns } from "./columns"
import { CreateFlightControlDialog } from "@/components/dialogs/aerolinea/administracion/CreateFlightControl"

const FlightControlPage = () => {
  const { selectedCompany } = useCompanyStore()
  const companySlug = selectedCompany?.slug ?? ""

  const { data: flights, isLoading, isError } = useGetFlightControl(companySlug)
  const { data: aircrafts, isLoading: isAircraftsLoading } = useGetMaintenanceAircrafts(companySlug)

  const [activeAircraftId, setActiveAircraftId] = useState<string>("")

  useEffect(() => {
    if (!activeAircraftId && aircrafts?.length) {
      setActiveAircraftId(String(aircrafts[0].id))
    }
  }, [aircrafts, activeAircraftId])

  const columns = useMemo(() => getColumns(companySlug), [companySlug])

  const activeFlights = useMemo(() => {
    if (!flights?.length || !activeAircraftId) return []
    const id = Number(activeAircraftId)
    return flights.filter((f) => f.aircraft?.id === id)
  }, [flights, activeAircraftId])

  const stats = useMemo(() => {
    const totalHours = activeFlights.reduce((acc, f) => acc + Number(f.flight_hours ?? 0), 0)
    const totalCycles = activeFlights.reduce((acc, f) => acc + Number(f.flight_cycles ?? 0), 0)
    return {
      count: activeFlights.length,
      totalHours,
      totalCycles,
    }
  }, [activeFlights])

  if (isLoading || isAircraftsLoading) return <LoadingPage />

  console.log('THIS IS ACTIVE AIRCRAFT ID', activeAircraftId);
  
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
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    <Plane className="h-3.5 w-3.5" />
                    {stats.count} vuelos
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {stats.totalHours.toFixed(1)} h
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Repeat2 className="h-3.5 w-3.5" />
                    {stats.totalCycles} ciclos
                  </Badge>
                </div>
              </div>
            </CardHeader>

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
}

export default FlightControlPage
