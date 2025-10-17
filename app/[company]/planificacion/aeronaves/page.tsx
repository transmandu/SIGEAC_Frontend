'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useCompanyStore } from '@/stores/CompanyStore';
import { MaintenanceAircraft } from '@/types';
import { PlusCircle, Search, Building2, Filter } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PlanificationAircraftTab } from './_components/PlanificationAircraftTab';
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts';
import { useGetClients } from '@/hooks/general/clientes/useGetClients';

const normalize = (v?: string | null) => (v ?? '').toLowerCase();

const AircraftsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts, isLoading, isError } = useGetMaintenanceAircrafts(selectedCompany?.slug);
  const { data: clients } = useGetClients(selectedCompany?.slug);

  // Valor del Tab seleccionado (controlado)
  const [tabValue, setTabValue] = useState<string>('');

  // Query del buscador
  const [query, setQuery] = useState<string>('');
  
  // Filtro de operador/cliente
  const [selectedOperator, setSelectedOperator] = useState<string>('all');

  // Cuando llegan los datos iniciales, setear el primer tab
  useEffect(() => {
    if (aircrafts?.length && !tabValue) {
      setTabValue(aircrafts[0].acronym);
    }
  }, [aircrafts, tabValue]);

  // Filtrado flexible por múltiples campos + operador
  const filteredAircrafts = useMemo<MaintenanceAircraft[]>(() => {
    if (!aircrafts) return [];
    
    let filtered = aircrafts;
    
    // Filtrar por operador si no es "all"
    if (selectedOperator !== 'all') {
      filtered = filtered.filter((a: MaintenanceAircraft) => 
        a.client?.id?.toString() === selectedOperator
      );
    }
    
    // Filtrar por búsqueda de texto
    const q = normalize(query);
    if (q) {
      filtered = filtered.filter((a: MaintenanceAircraft) => {
      const hayCoincidencia =
        normalize(a.acronym).includes(q) ||
          normalize(a.model).includes(q) ||
        normalize(a.manufacturer.name).includes(q) ||
          normalize(a.serial).includes(q) ||
          normalize(a.client?.name).includes(q);
      return hayCoincidencia;
    });
    }
    
    return filtered;
  }, [aircrafts, query, selectedOperator]);
  
  // Agrupar aeronaves por operador
  const aircraftsByOperator = useMemo(() => {
    const groups: Record<string, MaintenanceAircraft[]> = {};
    
    filteredAircrafts.forEach((aircraft) => {
      const operatorId = aircraft.client?.id?.toString() || 'sin-operador';
      const operatorName = aircraft.client?.name || 'Sin Operador';
      const key = `${operatorId}|${operatorName}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(aircraft);
    });
    
    return groups;
  }, [filteredAircrafts]);

  // Si el tab seleccionado no existe en el filtrado, moverlo al primer resultado
  useEffect(() => {
    if (!filteredAircrafts.length) return;
    const stillVisible = filteredAircrafts.some((a) => a.acronym === tabValue);
    if (!stillVisible) {
      setTabValue(filteredAircrafts[0].acronym);
    }
  }, [filteredAircrafts, tabValue]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ContentLayout title="Aeronaves">
      {/* Header */}
      <div className="flex flex-col text-center justify-center gap-2 mb-8">
        <h1 className="font-bold text-5xl">Gestión de Aeronaves</h1>
        <p className="text-muted-foreground italic text-sm">
          Aquí puede llevar un registro de todas las aeronaves registradas en el sistema. <br />
          Puede crear o editar las aeronaves de ser necesarios.
        </p>
      </div>

      {/* Barra de acciones mejorada */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Filtro de Operador - Mejorado */}
          <div className="relative w-full lg:w-72">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
            <Select value={selectedOperator} onValueChange={setSelectedOperator}>
              <SelectTrigger className="pl-9 h-11 border-2 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur">
                <SelectValue placeholder="Todos los operadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2 py-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Todos los operadores</span>
                  </div>
                </SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center gap-2 py-1">
                      <Building2 className="h-4 w-4" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buscador - Mejorado */}
          <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
              placeholder="Buscar por matrícula, serial, fabricante..."
              className="pl-9 h-11 border-2 hover:border-primary/50 focus:border-primary transition-colors bg-background/50 backdrop-blur"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

          {/* Botón Registrar - Mejorado */}
        <Link
          href={`/${selectedCompany?.slug}/planificacion/aeronaves/ingreso_aeronave`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 h-11 text-sm font-semibold transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg gap-2"
        >
            <PlusCircle className="size-5" />
            Registrar Aeronave
        </Link>
      </div>

        {/* Indicador de filtros activos - Mejorado */}
        {(selectedOperator !== 'all' || query) && (
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm font-medium text-muted-foreground">Filtros activos:</span>
            {selectedOperator !== 'all' && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Building2 className="h-3.5 w-3.5" />
                {clients?.find(c => c.id.toString() === selectedOperator)?.name}
              </Badge>
            )}
            {query && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Search className="h-3.5 w-3.5" />
                {query}
              </Badge>
            )}
            <button
              onClick={() => {
                setSelectedOperator('all');
                setQuery('');
              }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {aircrafts && aircrafts.length > 0 ? (
        filteredAircrafts.length > 0 ? (
          <div className="space-y-6">
            {/* Mostrar agrupación por operador cuando no hay filtro de operador específico */}
            {selectedOperator === 'all' ? (
              <Accordion type="single" collapsible className="w-full space-y-3">
                {Object.entries(aircraftsByOperator).map(([key, groupAircrafts]) => {
                  const [operatorId, operatorName] = key.split('|');
                  const isOpen = tabValue && groupAircrafts.some(a => a.acronym === tabValue);
                  
                  return (
                    <AccordionItem 
                      key={key} 
                      value={key}
                      className="border-2 border-border/50 rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-primary/5 hover:no-underline group transition-colors">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-lg group-hover:text-primary transition-colors">{operatorName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {groupAircrafts.length} {groupAircrafts.length === 1 ? 'aeronave registrada' : 'aeronaves registradas'}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2 px-3 py-1 text-sm font-semibold">
                            {groupAircrafts.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 pt-2 bg-muted/30">
                        <div className="rounded-lg bg-background p-4 border border-border/50">
                          <Tabs 
                            value={tabValue} 
                            onValueChange={setTabValue}
                            className="w-full"
                          >
                            <TabsList className="flex flex-wrap justify-start w-full gap-2 bg-muted/50 p-2 rounded-lg">
                              {groupAircrafts.map((aircraft) => (
                                <TabsTrigger 
                                  key={aircraft.id} 
                                  value={aircraft.acronym}
                                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-md font-medium transition-all hover:scale-105"
                                >
                                  {aircraft.acronym}
                                </TabsTrigger>
                              ))}
                            </TabsList>

                            {groupAircrafts.map((aircraft) => (
                              <TabsContent key={aircraft.id} value={aircraft.acronym} className="mt-4">
                                <PlanificationAircraftTab aircraft={aircraft} />
                              </TabsContent>
                            ))}
                          </Tabs>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              /* Vista simple cuando hay un operador seleccionado */
              <div className="rounded-xl border-2 border-border/50 bg-card overflow-hidden shadow-sm">
                <div className="bg-primary/5 px-6 py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {clients?.find(c => c.id.toString() === selectedOperator)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {filteredAircrafts.length} {filteredAircrafts.length === 1 ? 'aeronave' : 'aeronaves'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
          <Tabs value={tabValue} onValueChange={setTabValue}>
                    <TabsList className="flex flex-wrap justify-center w-full gap-2 bg-muted/50 p-2 rounded-lg">
              {filteredAircrafts.map((aircraft) => (
                        <TabsTrigger 
                          key={aircraft.id} 
                          value={aircraft.acronym}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-md font-medium transition-all hover:scale-105"
                        >
                  {aircraft.acronym}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredAircrafts.map((aircraft) => (
                      <TabsContent key={aircraft.id} value={aircraft.acronym} className="mt-4">
                <PlanificationAircraftTab aircraft={aircraft} />
              </TabsContent>
            ))}
          </Tabs>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-6 rounded-2xl bg-muted/30 mb-4">
              <Search className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron aeronaves</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {query ? (
                <>No hay resultados para <span className="font-semibold">{query}</span></>
              ) : (
                'Intenta ajustar los filtros de búsqueda'
              )}
            </p>
            {(selectedOperator !== 'all' || query) && (
              <button
                onClick={() => {
                  setSelectedOperator('all');
                  setQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )
      ) : (
        aircrafts && aircrafts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
              <PlusCircle className="h-20 w-20 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No hay aeronaves registradas</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Comienza registrando la primera aeronave de tu flota para llevar un control detallado
            </p>
            <Link
              href={`/${selectedCompany?.slug}/planificacion/aeronaves/ingreso_aeronave`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-8 py-3 text-base font-semibold transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl gap-2"
            >
              <PlusCircle className="size-5" />
              Registrar Primera Aeronave
            </Link>
          </div>
        )
      )}

      {isError && (
        <p className="text-muted-foreground italic text-center">Ha ocurrido un error al cargar los datos...</p>
      )}
    </ContentLayout>
  );
};

export default AircraftsPage;
