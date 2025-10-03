'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { AircraftInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftInfoForm";
import { AircraftPartsInfoForm, PART_CATEGORIES } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { useCreateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface AircraftPart {
  category?: "ENGINE" | "APU" | "POWER_PLANT" | "PROPELLER"; // Solo frontend
  part_name: string;
  part_number: string;
  serial: string;
  brand: string;
  time_since_new?: number;
  time_since_overhaul?: number;
  cycles_since_new?: number;
  cycles_since_overhaul?: number;
  condition_type: "NEW" | "OVERHAULED";
  is_father: boolean;
  sub_parts?: AircraftPart[];
}

// Tipo que coincide con lo que espera el API
interface AircraftPartAPI {
  part_name: string;
  part_number: string;
  serial: string;
  brand: string;
  time_since_new: number;
  time_since_overhaul: number;
  cycles_since_new: number;
  cycles_since_overhaul: number;
  condition_type: "NEW" | "OVERHAULED";
  is_father: boolean;
  sub_parts?: AircraftPartAPI[];
}

interface AircraftInfoType {
  manufacturer_id: string;
  client_id: string;
  serial: string;
  acronym: string;
  flight_hours: string;
  flight_cycles: string;
  fabricant_date: Date;
  location_id: string;
  comments?: string | undefined;
}

// Tipo para el estado de las partes
interface PartsData {
  parts: AircraftPart[];
}

export function CreateMaintenanceAircraftDialog() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Paso actual
  const [aircraftData, setAircraftData] = useState<AircraftInfoType>(); // Datos de la aeronave
  const [partsData, setPartsData] = useState<PartsData>({ parts: [] }); // Datos de las partes (motores, hélices, etc.)
  const { createMaintenanceAircraft } = useCreateMaintenanceAircraft()
  const { selectedCompany } = useCompanyStore()

  // Función para transformar las partes asegurando que tengan todos los campos requeridos
  // y eliminando el campo 'category' que es solo para el frontend
  const transformPart = (part: AircraftPart): AircraftPartAPI => {
    // Omitimos 'category' al desestructurar
    const { category, ...partWithoutCategory } = part;
    
    const transformed: AircraftPartAPI = {
      part_name: partWithoutCategory.part_name,
      part_number: partWithoutCategory.part_number,
      serial: partWithoutCategory.serial,
      brand: partWithoutCategory.brand,
      time_since_new: partWithoutCategory.time_since_new ?? 0,
      time_since_overhaul: partWithoutCategory.time_since_overhaul ?? 0,
      cycles_since_new: partWithoutCategory.cycles_since_new ?? 0,
      cycles_since_overhaul: partWithoutCategory.cycles_since_overhaul ?? 0,
      condition_type: partWithoutCategory.condition_type,
      is_father: partWithoutCategory.is_father,
    };
    
    // Transformar subpartes recursivamente
    if (part.sub_parts && part.sub_parts.length > 0) {
      transformed.sub_parts = part.sub_parts.map(transformPart);
    }
    
    return transformed;
  };

  // Función para manejar el envío final del formulario
  const handleSubmit = async () => {
    if (aircraftData && partsData) {
      try {
        const transformedParts = partsData.parts.map(transformPart);
        
        await createMaintenanceAircraft.mutateAsync({
          data: {
            aircraft: {
              ...aircraftData,
              flight_hours: Number(aircraftData.flight_hours),
              flight_cycles: Number(aircraftData.flight_cycles),
            },
            parts: transformedParts,
          },
          company: selectedCompany!.slug
        });
        setOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Función para retroceder al paso anterior
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center justify-center gap-2 h-8 border-dashed">
          Registrar Aeronave
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registro de Aeronave</DialogTitle>
          <DialogDescription>
            Complete la información de la aeronave en {currentStep} pasos.
          </DialogDescription>
        </DialogHeader>

        {/* Renderizar el paso actual */}
        {currentStep === 1 && (
          <AircraftInfoForm
            initialData={aircraftData}
            onNext={(data) => {
              setAircraftData(data); // Guardar datos de la aeronave
              handleNext(); // Avanzar al siguiente paso
            }}
          />
        )}

        {currentStep === 2 && (
          <AircraftPartsInfoForm
            initialData={partsData} // Pasar el objeto con la clave "parts"
            onNext={(data) => {
              setPartsData(data); // Guardar datos de las partes
              handleNext(); // Avanzar al siguiente paso
            }}
            onBack={handleBack} // Retroceder al paso anterior
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resumen</h3>

            {/* Resumen de la aeronave */}
            <div>
              <h4 className="font-medium mb-2">Información de la Aeronave</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Fabricante:</span> {aircraftData?.manufacturer_id}</p>
                <p><span className="font-medium">Serial:</span> {aircraftData?.serial}</p>
                <p><span className="font-medium">Acrónimo:</span> {aircraftData?.acronym}</p>
                <p><span className="font-medium">Horas de Vuelo:</span> {aircraftData?.flight_hours}</p>
                <p><span className="font-medium">Fecha de Fabricación:</span> {aircraftData?.fabricant_date?.toLocaleDateString()}</p>
                <p><span className="font-medium">Ubicación:</span> {aircraftData?.location_id}</p>
              </div>
            </div>

            {/* Resumen de las partes - Agrupadas por categoría */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                Partes Registradas ({partsData.parts.length})
              </h4>
              
              <div className="space-y-4">
                {/* Agrupar partes por categoría */}
                {Object.entries(PART_CATEGORIES).map(([categoryKey, categoryLabel]) => {
                  const categoryParts = partsData.parts.filter(p => p.category === categoryKey);
                  
                  if (categoryParts.length === 0) return null;

                  return (
                    <div key={categoryKey} className="border rounded-lg overflow-hidden">
                      {/* Header de la categoría */}
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b">
                        <h5 className="font-semibold text-sm flex items-center justify-between">
                          <span>{categoryLabel}</span>
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                            {categoryParts.length} {categoryParts.length === 1 ? 'parte' : 'partes'}
                          </span>
                        </h5>
                      </div>

                      {/* Lista de partes en esta categoría */}
                      <div className="p-3 space-y-2">
                        {categoryParts.map((part, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                {part.part_name}
                              </p>
                              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {part.part_number}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                              <p><span className="font-medium">Serial:</span> {part.serial}</p>
                              <p><span className="font-medium">Marca:</span> {part.brand}</p>
                              <p><span className="font-medium">Condición:</span> {part.condition_type === 'NEW' ? 'Nueva' : 'Overhauled'}</p>
                              <p><span className="font-medium">TSN:</span> {part.time_since_new ?? 0}h</p>
                              <p><span className="font-medium">TSO:</span> {part.time_since_overhaul ?? 0}h</p>
                              <p><span className="font-medium">CSN:</span> {part.cycles_since_new ?? 0}</p>
                              <p><span className="font-medium">CSO:</span> {part.cycles_since_overhaul ?? 0}</p>
                            </div>

                            {/* Mostrar subpartes si existen */}
                            {part.sub_parts && part.sub_parts.length > 0 && (
                              <div className="mt-2 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                  Subpartes ({part.sub_parts.length})
                                </p>
                                {part.sub_parts.map((subpart, subIdx) => (
                                  <div key={subIdx} className="text-xs text-slate-500 dark:text-slate-500 mb-1">
                                    • {subpart.part_name} ({subpart.part_number})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Mostrar categorías sin partes */}
                {Object.entries(PART_CATEGORIES).map(([categoryKey, categoryLabel]) => {
                  const categoryParts = partsData.parts.filter(p => p.category === categoryKey);
                  
                  if (categoryParts.length > 0) return null;

                  return (
                    <div key={categoryKey} className="border border-dashed rounded-lg p-4 bg-slate-50 dark:bg-slate-900/30">
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="font-medium">{categoryLabel}:</span>
                        <span className="italic">No aplica</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between items-center gap-x-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Anterior
              </Button>
              <Button disabled={createMaintenanceAircraft.isPending} type="button" onClick={handleSubmit}>
                Confirmar y Enviar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
