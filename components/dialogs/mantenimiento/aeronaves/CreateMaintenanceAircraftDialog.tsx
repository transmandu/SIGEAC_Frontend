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
import { useCreateMaintenanceAircraft, AircraftPartAPI } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import { useCreateClient } from "@/actions/general/clientes/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface AircraftPart {
  category?: "ENGINE" | "APU" | "PROPELLER"; // Solo frontend
  part_name: string;
  part_number: string;
  serial: string;
  manufacturer_id: string;
  time_since_new?: number;
  time_since_overhaul?: number;
  cycles_since_new?: number;
  cycles_since_overhaul?: number;
  condition_type: "NEW" | "OVERHAULED";
  is_father: boolean;
  removed_date?: string | null;
  sub_parts?: AircraftPart[];
}

interface AircraftInfoType {
  manufacturer_id: string;
  client_name: string;
  serial: string;
  model?: string;
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
  const { createClient } = useCreateClient();
  const { selectedCompany } = useCompanyStore()

  // Función para transformar las partes asegurando que tengan todos los campos requeridos
  // y eliminando el campo 'category' que es solo para el frontend
  const transformPart = (part: AircraftPart): AircraftPartAPI => {
    // Omitimos 'category' al desestructurar
    const { category, ...rest } = part;
    
    // Mapear categoría a part_type (en minúsculas para el backend)
    const part_type = category === "APU" ? "apu" : 
                     category === "PROPELLER" ? "propeller" : 
                     "engine"; // Default: engine
    
    const transformed = {
      part_name: rest.part_name,
      part_number: rest.part_number,
      serial: rest.serial,
      manufacturer_id: rest.manufacturer_id,
      time_since_new: rest.time_since_new !== null && rest.time_since_new !== undefined ? rest.time_since_new : null,
      time_since_overhaul: rest.time_since_overhaul !== null && rest.time_since_overhaul !== undefined ? rest.time_since_overhaul : null,
      cycles_since_new: rest.cycles_since_new !== null && rest.cycles_since_new !== undefined ? rest.cycles_since_new : null,
      cycles_since_overhaul: rest.cycles_since_overhaul !== null && rest.cycles_since_overhaul !== undefined ? rest.cycles_since_overhaul : null,
      condition_type: rest.condition_type,
      is_father: rest.is_father,
      part_type,
      ata_chapter: (rest as any).ata_chapter ?? null,
      position: (rest as any).position ?? null,
      part_order: (rest as any).part_order ?? null,
    } as AircraftPartAPI;
    
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
        // First, create the client with minimal data
        const clientResponse = await createClient.mutateAsync({
          company: selectedCompany!.slug,
          data: {
            name: aircraftData.client_name,
            dni: "00000000", // Default DNI
            dni_type: "V", // Default DNI type
            authorizing: "PROPIETARIO" as const, // Default authorizing
          }
        });

        // Extract client ID from response
        const clientId = clientResponse.client?.id || clientResponse.id;

        const transformedParts = partsData.parts.map(transformPart);
        
        // Create aircraft with the new client ID
        await createMaintenanceAircraft.mutateAsync({
          data: {
            aircraft: {
              manufacturer_id: aircraftData.manufacturer_id,
              client_id: clientId.toString(),
              serial: aircraftData.serial,
              model: aircraftData.model,
              acronym: aircraftData.acronym,
              flight_hours: Number(aircraftData.flight_hours),
              flight_cycles: Number(aircraftData.flight_cycles),
              fabricant_date: aircraftData.fabricant_date,
              comments: aircraftData.comments,
              location_id: aircraftData.location_id,
              type: "MAINTENANCE", // Tipo de aeronave: mantenimiento
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
                  <p><span className="font-medium">Matrícula:</span> {aircraftData?.model}</p>
                  <p><span className="font-medium">Horas de Vuelo:</span> {aircraftData?.flight_hours}</p>
                  <p><span className="font-medium">Fecha de Fabricación:</span> {aircraftData?.fabricant_date?.toLocaleDateString()}</p>
                  <p><span className="font-medium">Ubicación:</span> {aircraftData?.location_id}</p>
                </div>
              </div>

              {/* Resumen de las partes: mostrar todas (registradas y removidas) */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  Resumen de Partes ({partsData.parts.length})
                </h4>

                <div className="space-y-4">
                  {partsData.parts.length === 0 && (
                    <div className="border border-dashed rounded-lg p-4 bg-slate-50 dark:bg-slate-900/30">
                      <p className="text-sm text-slate-500 dark:text-slate-400">No hay partes registradas</p>
                    </div>
                  )}

                  {partsData.parts.map((part, idx) => (
                    <div key={idx} className={`bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-700 ${part.removed_date ? 'opacity-70' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className={`font-medium text-sm ${part.removed_date ? 'line-through text-muted-foreground' : ''}`}>
                          {part.part_name || `Parte ${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{part.part_number}</span>
                          {part.removed_date && <span className="text-xs text-destructive font-bold">Removido</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <p><span className="font-medium">Serial:</span> {part.serial}</p>
                        <p><span className="font-medium">Fabricante:</span> {part.manufacturer_id}</p>
                        <p><span className="font-medium">TSN:</span> {part.time_since_new ?? 'No especificado'}</p>
                        <p><span className="font-medium">TSO:</span> {part.time_since_overhaul ?? 'No especificado'}</p>
                        <p><span className="font-medium">CSN:</span> {part.cycles_since_new ?? 'No especificado'}</p>
                        <p><span className="font-medium">CSO:</span> {part.cycles_since_overhaul ?? 'No especificado'}</p>
                      </div>

                      {part.sub_parts && part.sub_parts.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subpartes ({part.sub_parts.length})</p>
                          {part.sub_parts.map((subpart, subIdx) => (
                            <div key={subIdx} className={`text-xs text-slate-500 dark:text-slate-500 mb-1 ${subpart.removed_date ? 'line-through text-muted-foreground' : ''}`}>
                              • {subpart.part_name} ({subpart.part_number}) {subpart.removed_date ? '- Removido' : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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
