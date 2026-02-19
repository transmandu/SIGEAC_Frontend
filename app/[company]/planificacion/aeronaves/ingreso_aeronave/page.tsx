"use client";

import {
  useCreateMaintenanceAircraft,
  AircraftPartAPI,
} from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import { useCreateClient } from "@/actions/general/clientes/actions";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { useGetManufacturers } from "@/hooks/general/condiciones/useGetConditions";
import { AircraftPartsInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { AircraftInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftInfoForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Plane,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { InfoItem } from "./_components/InfoItem";
import { PartSummaryCard } from "./_components/PartSummaryCard";

interface AircraftPart {
  category?: "ENGINE" | "APU" | "PROPELLER"; // Solo frontend
  part_name: string;
  part_number: string;
  serial: string;
  manufacturer_id: string;
  time_since_new?: number; // Time Since New
  time_since_overhaul?: number; // Time Since Overhaul
  cycles_since_new?: number; // Cycles Since New
  cycles_since_overhaul?: number; // Cycles Since Overhaul
  condition_id: string;
  is_father: boolean;
  sub_parts?: AircraftPart[];
}

interface AircraftInfoType {
  manufacturer_id: string;
  client_name: string;
  authorizing: "PROPIETARIO" | "EXPLOTADOR";
  serial: string;
  model?: string;
  acronym: string;
  flight_hours: string;
  flight_cycles: string;
  fabricant_date: Date;
  location_id: string;
  comments?: string | undefined;
}

interface PartsData {
  parts: AircraftPart[];
}

export default function NewAircraftPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [aircraftData, setAircraftData] = useState<AircraftInfoType>();
  const [partsData, setPartsData] = useState<PartsData>({ parts: [] });
  const { createMaintenanceAircraft } = useCreateMaintenanceAircraft();
  const { selectedCompany } = useCompanyStore();
  const { createClient } = useCreateClient();
  const { data: clients } = useGetClients(selectedCompany?.slug);
  const { data: manufacturers } = useGetManufacturers(selectedCompany?.slug);
  const router = useRouter();

  // Función para transformar las partes del frontend al formato API
  const transformPart = (part: AircraftPart): AircraftPartAPI => {
    const { category, ...rest } = part;

    // Mapear categoría a part_type (en minúsculas para el backend)
    const part_type =
      category === "APU"
        ? "apu"
        : category === "PROPELLER"
          ? "propeller"
          : "engine"; // Default: engine

    return {
      ...rest,
      time_since_new: Math.round((rest.time_since_new ?? 0) * 100) / 100,
      time_since_overhaul:
        Math.round((rest.time_since_overhaul ?? 0) * 100) / 100,
      cycles_since_new: Math.round(rest.cycles_since_new ?? 0),
      cycles_since_overhaul: Math.round(rest.cycles_since_overhaul ?? 0),
      part_type,
      sub_parts: part.sub_parts?.map(transformPart),
    };
  };

  const handleSubmit = async () => {
    if (!aircraftData || !partsData) return;

    try {
      // Buscar cliente existente por nombre
      const existingClient = clients?.find(
        (client) => client.name === aircraftData.client_name,
      );
      let clientId = "";

      if (existingClient) {
        // Cliente existe - usar ID existente
        clientId = existingClient.id.toString();
      } else {
        // Cliente no existe - crear nuevo
        const clientResponse = await createClient.mutateAsync({
          company: selectedCompany!.slug,
          data: {
            name: aircraftData.client_name,
            phone: "0000000000",
            email: "default@example.com",
            address: "N/A",
            dni: "00000000",
            dni_type: "V",
            authorizing: aircraftData.authorizing,
          },
        });
        clientId = (clientResponse.client?.id || clientResponse.id).toString();
      }

      // 2. Transformar partes
      const transformedParts = partsData.parts.map(transformPart);

      // 3. Crear aeronave (transacción atómica)
      await createMaintenanceAircraft.mutateAsync({
        data: {
          aircraft: {
            manufacturer_id: aircraftData.manufacturer_id,
            client_id: clientId,
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
        company: selectedCompany!.slug,
      });
      router.push(`/${selectedCompany?.slug}/planificacion/aeronaves`);
    } catch (error) {
      console.error("Error creating aircraft:", error);
      // TODO: Implementar rollback si es necesario
    }
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  return (
    <ContentLayout title="Registro de Aeronave">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Registro de Aeronave</h1>

        {/* Stepper visual con Tabs */}
        <Tabs value={String(currentStep)} className="w-full" defaultValue="1">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger
              value="1"
              className={currentStep === 1 ? "font-bold" : ""}
            >
              1. Información
            </TabsTrigger>
            <TabsTrigger
              value="2"
              className={currentStep === 2 ? "font-bold" : ""}
            >
              2. Partes
            </TabsTrigger>
            <TabsTrigger
              value="3"
              className={currentStep === 3 ? "font-bold" : ""}
            >
              3. Resumen
            </TabsTrigger>
          </TabsList>
          {currentStep === 1 && (
            <TabsContent value="1" className="mt-6">
              <AircraftInfoForm
                initialData={aircraftData}
                onNext={(data) => {
                  setAircraftData(data);
                  handleNext();
                }}
              />
            </TabsContent>
          )}

          {currentStep === 2 && (
            <TabsContent value="2" className="mt-6">
              <AircraftPartsInfoForm
                initialData={partsData}
                onNext={(data) => {
                  setPartsData(data);
                  handleNext();
                }}
                onBack={handleBack}
              />
            </TabsContent>
          )}

          {currentStep === 3 && (
            <TabsContent value="3" className="mt-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">
                    Resumen de Información
                  </h3>
                  <p className="text-muted-foreground">
                    Revise los datos antes de confirmar el registro
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información de la Aeronave */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5 py-3">
                      <div className="flex items-center gap-2">
                        <Plane className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">
                          Información de la Aeronave
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <InfoItem
                          label="Fabricante"
                          value={
                            manufacturers?.find(
                              (m) =>
                                m.id.toString() ===
                                aircraftData?.manufacturer_id,
                            )?.name || aircraftData?.manufacturer_id
                          }
                        />
                        <InfoItem label="Serial" value={aircraftData?.serial} />
                        <InfoItem
                          label="Matrícula"
                          value={aircraftData?.model}
                        />
                        <InfoItem
                          label="Horas de Vuelo"
                          value={aircraftData?.flight_hours}
                        />
                        <InfoItem
                          label="Fecha de Fabricación"
                          value={aircraftData?.fabricant_date
                            ?.getFullYear()
                            .toString()}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de las Partes */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-primary/5 py-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">
                          Partes Registradas ({partsData.parts.length})
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {/* Plantas de Poder */}
                          {partsData.parts.filter(
                            (p) => p.category === "ENGINE",
                          ).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                                Plantas de Poder (
                                {
                                  partsData.parts.filter(
                                    (p) => p.category === "ENGINE",
                                  ).length
                                }
                                )
                              </h4>
                              <div className="space-y-2 pl-2">
                                {partsData.parts
                                  .filter((p) => p.category === "ENGINE")
                                  .map((part, index) => (
                                    <PartSummaryCard
                                      key={index}
                                      part={part}
                                      index={index}
                                      level={0}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* APU */}
                          {partsData.parts.filter((p) => p.category === "APU")
                            .length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-green-600 dark:text-green-400">
                                APU (
                                {
                                  partsData.parts.filter(
                                    (p) => p.category === "APU",
                                  ).length
                                }
                                )
                              </h4>
                              <div className="space-y-2 pl-2">
                                {partsData.parts
                                  .filter((p) => p.category === "APU")
                                  .map((part, index) => (
                                    <PartSummaryCard
                                      key={index}
                                      part={part}
                                      index={index}
                                      level={0}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Hélices */}
                          {partsData.parts.filter(
                            (p) => p.category === "PROPELLER",
                          ).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm text-orange-600 dark:text-orange-400">
                                Hélices (
                                {
                                  partsData.parts.filter(
                                    (p) => p.category === "PROPELLER",
                                  ).length
                                }
                                )
                              </h4>
                              <div className="space-y-2 pl-2">
                                {partsData.parts
                                  .filter((p) => p.category === "PROPELLER")
                                  .map((part, index) => (
                                    <PartSummaryCard
                                      key={index}
                                      part={part}
                                      index={index}
                                      level={0}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between items-center gap-x-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    disabled={
                      createMaintenanceAircraft.isPending ||
                      createClient.isPending
                    }
                    type="button"
                    onClick={handleSubmit}
                    className="min-w-[180px]"
                  >
                    {createMaintenanceAircraft.isPending ||
                    createClient.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar y Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ContentLayout>
  );
}
