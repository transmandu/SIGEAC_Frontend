"use client"

import { ContentLayout } from '@/components/layout/ContentLayout'
import { useGetMaintenanceAircraftByAcronym } from '@/hooks/planificacion/useGetMaitenanceAircraftByAcronym';
import { useParams } from 'next/navigation';
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MaintenanceAircraftPart } from '@/types';
import LoadingPage from '@/components/misc/LoadingPage';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const MaintenanceAircraftPage = () => {
  const { acronym } = useParams<{ acronym: string }>();
  const { data, isLoading } = useGetMaintenanceAircraftByAcronym(acronym);
  const [expandedParts, setExpandedParts] = React.useState<Record<string, boolean>>({});

  if (isLoading) {
    return <LoadingPage />
  }

  if (!data) {
    return <ContentLayout title="Aeronave">No se encontraron datos.</ContentLayout>;
  }

  const togglePartExpansion = (partId: string) => {
    setExpandedParts(prev => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

  // Función recursiva para renderizar partes y subpartes
  const renderPart = (part: MaintenanceAircraftPart, level = 0, isSubpart = false) => {
    const hasSubparts = part.sub_parts && part.sub_parts.length > 0;
    const isExpanded = expandedParts[part.part_number] ?? false;

    return (
      <div key={part.part_number} className={`${isSubpart ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}>
        <Card className={`mb-3 ${isSubpart ? 'bg-gray-50' : ''}`}>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {hasSubparts && (
                  <button
                    onClick={() => togglePartExpansion(part.part_number)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                )}
                <div>
                  <CardTitle className="text-lg">{part.part_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span>N°: {part.part_number}</span>
                    <Badge variant={part.condition_type === 'NEW' ? 'default' : 'secondary'}>
                      {part.condition_type === 'NEW' ? 'Nueva' : 'Reacondicionada'}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Horas</p>
                  <p className="font-medium">{part.part_hours || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Ciclos</p>
                  <p className="font-medium">{part.part_cycles || '-'}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          {hasSubparts && isExpanded && (
            <CardContent className="pt-0 pb-4">
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Subpartes</h4>
                <Separator className="mb-3" />
                {part.sub_parts?.map(subpart => renderPart(subpart, level + 1, true))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  };

  return (
    <ContentLayout title={`Aeronave - ${data.acronym}`}>
      <div className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fabricante</p>
                <p className="font-medium">{data.manufacturer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de Serie</p>
                <p className="font-medium">{data.serial}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Horas de Vuelo</p>
                <p className="font-medium">{data.flight_hours}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ciclos de Vuelo</p>
                <p className="font-medium">{data.flight_cycles}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Fabricación</p>
                <p className="font-medium">{data.fabricant_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ubicación</p>
                <p className="font-medium">{data.location.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partes de la Aeronave */}
        <Card>
          <CardHeader>
            <CardTitle>Partes de la Aeronave</CardTitle>
            <CardDescription>Detalles de las partes instaladas en esta aeronave.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.aircraft_parts.map((part: MaintenanceAircraftPart) => (
                renderPart(part)
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comentarios */}
        <Card>
          <CardHeader>
            <CardTitle>Comentarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{data.comments || "No hay comentarios."}</p>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}

export default MaintenanceAircraftPage;
