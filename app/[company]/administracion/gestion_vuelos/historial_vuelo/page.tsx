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
  Plane
} from 'lucide-react';
import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useGetFlightHistory } from '@/hooks/aerolinea/vuelos/useGetFlightHistory';
import { useGetAircraftAcronyms } from '@/hooks/aerolinea/aeronaves/useGetAircraftAcronyms';
import { useGetAverageCyclesAndHours } from '@/hooks/aerolinea/vuelos/useGetAverageCyclesAndHours';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

/**
 * Página mejorada de Historial de Vuelos con UI/UX profesional
 */
const HistorialVueloPage = () => {
  const { selectedCompany } = useCompanyStore();
  const [selectedAcronym, setSelectedAcronym] = useState<string>('');
  const [selectedView, setSelectedView] = useState<'table' | 'compact'>('table');
  
  // Estados para el selector de períodos
  const [periodType, setPeriodType] = useState<'current_month' | 'month' | 'year' | 'custom'>('current_month');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), 'yyyy'));
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  // ============================================
  // DATA FETCHING
  // ============================================
  const { data: aircrafts, isLoading: isLoadingAircrafts } = useGetAircraftAcronyms(selectedCompany?.slug);
  
  const { data: flightHistoryData, isLoading } = useGetFlightHistory(
    selectedCompany?.slug,
    selectedAcronym || undefined
  );

  // Calcular el rango de fechas según el tipo de período seleccionado
  const getDateRange = () => {
    switch (periodType) {
      case 'current_month': {
        const now = new Date();
        return {
          first_date: format(startOfMonth(now), 'yyyy-MM-dd'),
          second_date: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      }
      case 'month': {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          first_date: format(startOfMonth(date), 'yyyy-MM-dd'),
          second_date: format(endOfMonth(date), 'yyyy-MM-dd')
        };
      }
      case 'year': {
        const date = new Date(parseInt(selectedYear), 0, 1);
        return {
          first_date: format(startOfYear(date), 'yyyy-MM-dd'),
          second_date: format(endOfYear(date), 'yyyy-MM-dd')
        };
      }
      case 'custom': {
        if (customDateFrom && customDateTo) {
          return {
            first_date: format(customDateFrom, 'yyyy-MM-dd'),
            second_date: format(customDateTo, 'yyyy-MM-dd')
          };
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const dateRange = getDateRange();

  const { data: averageData, isLoading: isLoadingAverage } = useGetAverageCyclesAndHours(
    selectedCompany?.slug,
    selectedAcronym || undefined,
    selectedAcronym && dateRange ? dateRange : undefined
  );

  // ============================================
  // HANDLERS
  // ============================================
  const handleExport = () => {
    // Implementar exportación a Excel/CSV
    console.log('Exportando datos...');
  };

  // Obtener etiqueta del período seleccionado
  const getPeriodLabel = () => {
    switch (periodType) {
      case 'current_month':
        return 'Mes Actual';
      case 'month': {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return format(date, 'MMMM yyyy', { locale: es });
      }
      case 'year':
        return `Año ${selectedYear}`;
      case 'custom':
        if (customDateFrom && customDateTo) {
          return 'Período Personalizado';
        }
        return 'Período';
      default:
        return 'Período';
    }
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const flightHistoryRecords = flightHistoryData?.data || [];
  const totalRecords = flightHistoryData?.total || 0;

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
              <BreadcrumbLink href={`/${selectedCompany?.slug}/administracion/gestion_vuelos/vuelos`}>
                Gestión de Vuelos
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

        {/* Selector de Período para Promedios */}
        {selectedAcronym && (
          <Card className="w-full border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Período de Consulta para Promedios
              </CardTitle>
              <CardDescription>
                Selecciona el período para calcular los promedios de horas y ciclos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de tipo de período */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Período</label>
                <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_month">Mes Actual</SelectItem>
                    <SelectItem value="month">Mes Específico</SelectItem>
                    <SelectItem value="year">Año Completo</SelectItem>
                    <SelectItem value="custom">Rango Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de mes específico */}
              {periodType === 'month' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecciona el Mes</label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}

              {/* Selector de año */}
              {periodType === 'year' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecciona el Año</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Selector de rango personalizado */}
              {periodType === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha Desde</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-11"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateFrom ? format(customDateFrom, 'PPP', { locale: es }) : 'Selecciona fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDateFrom}
                          onSelect={setCustomDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha Hasta</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-11"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDateTo ? format(customDateTo, 'PPP', { locale: es }) : 'Selecciona fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDateTo}
                          onSelect={setCustomDateTo}
                          initialFocus
                          disabled={(date) => customDateFrom ? date < customDateFrom : false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Mostrar rango seleccionado */}
              {dateRange && (
                <div className="p-3 bg-background rounded-lg border">
                  <p className="text-sm font-medium mb-1">Rango Seleccionado:</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(dateRange.first_date), 'dd/MM/yyyy')} - {format(new Date(dateRange.second_date), 'dd/MM/yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tarjetas de Promedios */}
        {!isLoading && flightHistoryRecords.length > 0 && selectedAcronym && averageData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Clock className="h-4 w-4" />
                  Promedio de Horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {averageData.average_flight_hours.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio por vuelo - {getPeriodLabel()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <TrendingUp className="h-4 w-4" />
                  Promedio de Ciclos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {averageData.average_flight_cycles.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Promedio por vuelo - {getPeriodLabel()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Plane className="h-4 w-4" />
                  Total de Vuelos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {averageData.total_flights}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vuelos realizados - {getPeriodLabel()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

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
            ) : (
              <DataTable 
                columns={columns} 
                data={flightHistoryRecords}
                totalRecords={totalRecords}
                currentPage={1}
                onPageChange={() => {}}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  )
}

export default HistorialVueloPage;
