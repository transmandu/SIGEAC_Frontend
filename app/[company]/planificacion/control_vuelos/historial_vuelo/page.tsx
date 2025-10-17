'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyStore } from '@/stores/CompanyStore';
import { 
  Loader2, 
  History, 
  X, 
  Download, 
  Filter, 
  Calendar,
  Plane,
  FileSpreadsheet,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useGetFlightHistory } from '@/hooks/aerolinea/vuelos/useGetFlightHistory';
import { useGetAircraftAcronyms } from '@/hooks/aerolinea/aeronaves/useGetAircraftAcronyms';
import { useGetAverageCyclesAndHours } from '@/hooks/aerolinea/vuelos/useGetAverageCyclesAndHours';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth } from "date-fns";

/**
 * Página mejorada de Historial de Vuelos con UI/UX profesional
 */
const HistorialVueloPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [selectedAcronym, setSelectedAcronym] = useState<string>('');
  const [selectedView, setSelectedView] = useState<'table' | 'compact'>('table');

  // ============================================
  // DATA FETCHING
  // ============================================
  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircraftAcronyms(selectedCompany?.slug);
  
  const { data: flightHistoryData, isLoading } = useGetFlightHistory(
    selectedCompany?.slug,
    selectedAcronym || undefined
  );

  // Obtener promedio del mes actual
  const currentDate = new Date();
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);

  const dateRange = {
    first_date: format(firstDay, 'yyyy-MM-dd'),
    second_date: format(lastDay, 'yyyy-MM-dd')
  };

  const { data: averageData, isLoading: isLoadingAverage } = useGetAverageCyclesAndHours(
    selectedCompany?.slug,
    selectedAcronym || undefined,
    selectedAcronym ? dateRange : undefined
  );

  // ============================================
  // HANDLERS
  // ============================================
  const handleExport = () => {
    // Implementar exportación a Excel/CSV
    console.log('Exportando datos...');
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const flightHistoryRecords = flightHistoryData?.data || [];
  const totalRecords = flightHistoryData?.total || 0;

  // Calcular estadísticas (convertir strings a números)
  const totalFlightHours = flightHistoryRecords.reduce((sum, record) => {
    const hours = typeof record.flight_hours === 'string' ? parseFloat(record.flight_hours) : Number(record.flight_hours);
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);
  
  const totalFlightCycles = flightHistoryRecords.reduce((sum, record) => {
    const cycles = typeof record.flight_cycles === 'string' ? parseFloat(record.flight_cycles) : Number(record.flight_cycles);
    return sum + (isNaN(cycles) ? 0 : cycles);
  }, 0);
  
  const uniqueFlights = new Set(flightHistoryRecords.map(r => r.flight_number)).size;

  // ============================================
  // RENDER
  // ============================================
  return (
    <ContentLayout title='Historial de Vuelo'>
      <div className='flex flex-col gap-y-6 w-full max-w-[calc(100vw-280px)]'>
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/dashboard`}>
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${selectedCompany?.slug}/planificacion/control_vuelos/vuelos`}>
                Control de Vuelos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Historial de Vuelo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header con estadísticas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <History className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className='text-4xl font-bold'>Historial de Vuelo</h1>
                <p className='text-sm text-muted-foreground'>
                  Registro detallado del historial de vuelos y estado de componentes
                </p>
              </div>
            </div>
            
            {/* Acciones rápidas */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          {!isLoading && flightHistoryRecords.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Total Registros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRecords}</div>
                    <p className="text-xs text-muted-foreground">
                      Registros en el sistema
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      Vuelos Únicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{uniqueFlights}</div>
                    <p className="text-xs text-muted-foreground">
                      Diferentes vuelos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horas Totales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalFlightHours.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Horas de vuelo acumuladas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Ciclos Totales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalFlightCycles}</div>
                    <p className="text-xs text-muted-foreground">
                      Ciclos de vuelo acumulados
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Promedios del mes actual */}
              {selectedAcronym && averageData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Clock className="h-4 w-4" />
                        Promedio de Horas (Mes)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {averageData.average_flight_hours.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Promedio por vuelo este mes
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <TrendingUp className="h-4 w-4" />
                        Promedio de Ciclos (Mes)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {averageData.average_flight_cycles.toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Promedio por vuelo este mes
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Plane className="h-4 w-4" />
                        Total de Vuelos (Mes)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {averageData.total_flights}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vuelos realizados este mes
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Búsqueda y filtros */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar por Aeronave
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selector de Aeronave */}
            <div className="flex gap-2 w-full items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Selecciona una aeronave para ver su historial</label>
                <Select value={selectedAcronym} onValueChange={setSelectedAcronym}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona una aeronave..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingAircrafts ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando aeronaves...
                        </div>
                      </SelectItem>
                    ) : aircrafts && aircrafts.length > 0 ? (
                      <>
                        {aircrafts.map((aircraft) => (
                          <SelectItem key={aircraft.id} value={aircraft.acronym}>
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4" />
                              {aircraft.acronym}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No hay aeronaves disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedAcronym && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAcronym('')}
                  className="h-11"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>

            {selectedAcronym && (
              <div className="flex items-center gap-2 text-sm mt-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Plane className="h-3 w-3" />
                  Aeronave: {selectedAcronym}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {totalRecords} resultado(s)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Datos */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Registros de Historial</CardTitle>
              <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
                <TabsList>
                  <TabsTrigger value="table">Tabla Completa</TabsTrigger>
                  <TabsTrigger value="compact">Vista Compacta</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex w-full h-full justify-center items-center min-h-[400px]'>
                <div className="text-center space-y-4">
                  <Loader2 className='h-16 w-16 animate-spin mx-auto text-primary' />
                  <p className="text-sm text-muted-foreground">Cargando historial de vuelos...</p>
                </div>
              </div>
            ) : flightHistoryRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  <History className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No hay registros</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {selectedAcronym 
                      ? "No se encontraron registros de historial de vuelo para esta aeronave."
                      : "Selecciona una aeronave para ver su historial de vuelo."
                    }
                  </p>
                </div>
              </div>
            ) : selectedView === 'table' ? (
              <DataTable 
                columns={columns} 
                data={flightHistoryRecords}
                totalRecords={totalRecords}
                currentPage={1}
                onPageChange={() => {}}
              />
            ) : (
              <div className="space-y-3">
                {flightHistoryRecords.map((record, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Fecha y Vuelo */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Fecha / Vuelo</p>
                        <p className="font-semibold">
                          {new Date(record.flight?.flight_date || record.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {record.flight_number}
                        </Badge>
                      </div>

                      {/* Componente */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Componente</p>
                        {record.aircraft_part ? (
                          <>
                            <p className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                              {record.aircraft_part.part_number}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {record.aircraft_part.part_name}
                            </p>
                            {record.aircraft_part.serial && (
                              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                                S/N: {record.aircraft_part.serial}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">ID: {record.aircraft_part_id}</p>
                        )}
                      </div>

                      {/* Vuelo Horas/Ciclos */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Vuelo</p>
                        <div className="flex gap-2">
                          <Badge variant="default" className="text-xs">
                            {typeof record.flight_hours === 'string' 
                              ? parseFloat(record.flight_hours).toFixed(2) 
                              : record.flight_hours.toFixed(2)} H
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            {typeof record.flight_cycles === 'string' 
                              ? Math.round(parseFloat(record.flight_cycles)) 
                              : Math.round(record.flight_cycles)} C
                          </Badge>
                        </div>
                      </div>

                      {/* TSN/CSN/TSO/CSO */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Acumulados</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div>
                            <span className="text-amber-700 dark:text-amber-300 font-semibold">TSN:</span>
                            <span className="ml-1">
                              {typeof record.time_since_new === 'string' 
                                ? parseFloat(record.time_since_new).toFixed(2) 
                                : record.time_since_new.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-amber-700 dark:text-amber-300 font-semibold">CSN:</span>
                            <span className="ml-1">
                              {typeof record.cycles_since_new === 'string' 
                                ? Math.round(parseFloat(record.cycles_since_new)) 
                                : Math.round(record.cycles_since_new)}
                            </span>
                          </div>
                          <div>
                            <span className="text-purple-700 dark:text-purple-300 font-semibold">TSO:</span>
                            <span className="ml-1">
                              {typeof record.time_since_overhaul === 'string' 
                                ? parseFloat(record.time_since_overhaul).toFixed(2) 
                                : record.time_since_overhaul.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-purple-700 dark:text-purple-300 font-semibold">CSO:</span>
                            <span className="ml-1">
                              {typeof record.cycles_since_overhaul === 'string' 
                                ? Math.round(parseFloat(record.cycles_since_overhaul)) 
                                : Math.round(record.cycles_since_overhaul)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  )
}

export default HistorialVueloPage;
