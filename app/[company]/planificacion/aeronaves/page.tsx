'use client';

import { ContentLayout } from '@/components/layout/ContentLayout';
import LoadingPage from '@/components/misc/LoadingPage';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanyStore } from '@/stores/CompanyStore';
import { MaintenanceAircraft } from '@/types';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PlanificationAircraftTab } from './_components/PlanificationAircraftTab';
import { useGetMaintenanceAircrafts } from '@/hooks/mantenimiento/planificacion/useGetMaintenanceAircrafts';

const normalize = (v?: string | null) => (v ?? '').toLowerCase();

const AircraftsPage = () => {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts, isLoading, isError } = useGetMaintenanceAircrafts(selectedCompany?.slug);

  // Valor del Tab seleccionado (controlado)
  const [tabValue, setTabValue] = useState<string>('');

  // Query del buscador
  const [query, setQuery] = useState<string>('');

  // Cuando llegan los datos iniciales, setear el primer tab
  useEffect(() => {
    if (aircrafts?.length && !tabValue) {
      setTabValue(aircrafts[0].acronym);
    }
  }, [aircrafts, tabValue]);

  // Filtrado flexible por múltiples campos si existen
  const filteredAircrafts = useMemo<MaintenanceAircraft[]>(() => {
    if (!aircrafts) return [];
    const q = normalize(query);
    if (!q) return aircrafts;
    return aircrafts.filter((a: MaintenanceAircraft) => {
      const hayCoincidencia =
        normalize(a.acronym).includes(q) ||
        normalize(a.manufacturer.name).includes(q) ||
        normalize(a.serial).includes(q);
      return hayCoincidencia;
    });
  }, [aircrafts, query]);

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
      <div className="flex flex-col text-center justify-center gap-2">
        <h1 className="font-bold text-5xl">Gestión de Aeronaves</h1>
        <p className="text-muted-foreground italic text-sm">
          Aquí puede llevar un registro de todas las aeronaves registradas en el sistema. <br />
          Puede crear o editar las aeronaves de ser necesarios.
        </p>
      </div>

      {/* Barra de acciones: Buscador + Registrar */}
      <div className="mt-6 mb-2 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aeronave por acrónimo, matrícula, modelo…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Link
          href={`/${selectedCompany?.slug}/planificacion/aeronaves/ingreso_aeronave`}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent gap-2"
        >
          <PlusCircle className="size-4" />
          Registrar
        </Link>
      </div>

      {aircrafts &&
        aircrafts.length > 0 &&
        (filteredAircrafts.length > 0 ? (
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList className="flex flex-wrap justify-center w-full">
              {filteredAircrafts.map((aircraft) => (
                <TabsTrigger key={aircraft.id} value={aircraft.acronym}>
                  {aircraft.acronym}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredAircrafts.map((aircraft) => (
              <TabsContent key={aircraft.id} value={aircraft.acronym}>
                <PlanificationAircraftTab aircraft={aircraft} />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center text-muted-foreground italic py-10">
            No se encontraron aeronaves para “{query}”.
          </div>
        ))}

      {isError && (
        <p className="text-muted-foreground italic text-center">Ha ocurrido un error al cargar los datos...</p>
      )}
    </ContentLayout>
  );
};

export default AircraftsPage;
