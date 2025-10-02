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
import { AircraftPartsInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { useCreateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import { useCompanyStore } from "@/stores/CompanyStore";

interface AircraftPart {
  part_name: string;
  part_number: string;
  serial: string;
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
  time_since_new: number;
  time_since_overhaul: number;
  cycles_since_new: number;
  cycles_since_overhaul: number;
  condition_type: "NEW" | "OVERHAULED";
  is_father: boolean;
  sub_parts?: {
    part_name: string;
    part_number: string;
    serial: string;
    time_since_new?: number;
    time_since_overhaul?: number;
    cycles_since_new?: number;
    cycles_since_overhaul?: number;
    condition_type: "NEW" | "OVERHAULED";
    is_father: boolean;
  }[];
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
  const transformPart = (part: AircraftPart): AircraftPartAPI => {
    const transformed: AircraftPartAPI = {
      part_name: part.part_name,
      part_number: part.part_number,
      serial: part.serial,
      time_since_new: part.time_since_new ?? 0,
      time_since_overhaul: part.time_since_overhaul ?? 0,
      cycles_since_new: part.cycles_since_new ?? 0,
      cycles_since_overhaul: part.cycles_since_overhaul ?? 0,
      condition_type: part.condition_type,
      is_father: part.is_father,
    };
    
    if (part.sub_parts && part.sub_parts.length > 0) {
      transformed.sub_parts = part.sub_parts.map(sp => ({
        part_name: sp.part_name,
        part_number: sp.part_number,
        serial: sp.serial,
        time_since_new: sp.time_since_new ?? 0,
        time_since_overhaul: sp.time_since_overhaul ?? 0,
        cycles_since_new: sp.cycles_since_new ?? 0,
        cycles_since_overhaul: sp.cycles_since_overhaul ?? 0,
        condition_type: sp.condition_type,
        is_father: sp.is_father,
      }));
    }
    
    return transformed;
  };

  // Función para manejar el envío final del formulario
  const handleSubmit = async () => {
    if (aircraftData && partsData) {
      try {
        const transformedParts: AircraftPartAPI[] = partsData.parts.map(transformPart);
        
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

            {/* Resumen de las partes */}
            <div>
              <h4 className="font-medium mb-2">Información de las Partes</h4>
              <div className="space-y-2">
                {partsData.parts.map((part, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">Parte {index + 1}</p>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Nombre:</span> {part.part_name}</p>
                      <p><span className="font-medium">Número de Parte:</span> {part.part_number}</p>
                      <p><span className="font-medium">Serial:</span> {part.serial}</p>
                      <p><span className="font-medium">TSN:</span> {part.time_since_new ?? 0}</p>
                      <p><span className="font-medium">TSO:</span> {part.time_since_overhaul ?? 0}</p>
                      <p><span className="font-medium">CSN:</span> {part.cycles_since_new ?? 0}</p>
                      <p><span className="font-medium">CSO:</span> {part.cycles_since_overhaul ?? 0}</p>
                      <p><span className="font-medium">Condición:</span> {part.condition_type}</p>
                    </div>
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
