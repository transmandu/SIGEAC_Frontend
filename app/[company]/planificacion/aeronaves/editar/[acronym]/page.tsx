"use client";

import { useGetMaintenanceAircraftByAcronym } from "@/hooks/mantenimiento/planificacion/useGetMaitenanceAircraftByAcronym";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ArrowLeft, CheckCircle, Loader2, Plane, Settings } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AircraftInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftInfoForm";
import { AircraftPartsInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { useUpdateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";

interface AircraftPart {
    id?: number; // ID para actualizaciones
    category?: "ENGINE" | "APU" | "PROPELLER"; // Solo frontend
    part_name: string;
    part_number: string;
    serial: string;
    brand: string;
    time_since_new?: number;  // Time Since New
    time_since_overhaul?: number;  // Time Since Overhaul
    cycles_since_new?: number;  // Cycles Since New
    cycles_since_overhaul?: number;  // Cycles Since Overhaul
    condition_type: "NEW" | "OVERHAULED";
    is_father: boolean;
    sub_parts?: AircraftPart[];
}

// Tipo que coincide con lo que espera el API (sin category y con valores por defecto)
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
    part_type: "engine" | "apu" | "propeller"; // Campo requerido por el backend
    sub_parts?: AircraftPartAPI[];
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

export default function EditAircraftPage({ params }: { params: { acronym: string, company: string } }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [aircraftData, setAircraftData] = useState<AircraftInfoType>();
    const [partsData, setPartsData] = useState<PartsData>({ parts: [] });
    const { updateMaintenanceAircraft } = useUpdateMaintenanceAircraft();
    const { selectedCompany } = useCompanyStore();
    const router = useRouter();
    
    // Obtener datos de la aeronave
    const { data: aircraft, isLoading, isError } = useGetMaintenanceAircraftByAcronym(
        selectedCompany?.slug, 
        params.acronym
    );

    // Obtener lista de clientes para buscar el cliente de la aeronave
    const { data: clients } = useGetClients(selectedCompany?.slug);

    // Función para transformar partes del API al formato del formulario
    const transformExistingPartsToFormFormat = useCallback((apiParts: any[]): AircraftPart[] => {
        return apiParts.map(part => {
            // Mapear part_type a category
            const category = part.part_type === "apu" ? "APU" as const :
                           part.part_type === "propeller" ? "PROPELLER" as const :
                           "ENGINE" as const; // Default: ENGINE
            
            return {
                ...(part.id && { id: part.id }),
                part_name: part.part_name,
                part_number: part.part_number,
                serial: part.serial,
                brand: part.brand,
                time_since_new: Math.round(Number(part.time_since_new || part.part_hours || 0) * 100) / 100,
                time_since_overhaul: Math.round(Number(part.time_since_overhaul || 0) * 100) / 100,
                cycles_since_new: Math.round(Number(part.cycles_since_new || part.part_cycles || 0)),
                cycles_since_overhaul: Math.round(Number(part.cycles_since_overhaul || 0)),
                condition_type: part.condition_type,
                is_father: part.is_father,
                category,
                sub_parts: part.sub_parts ? transformExistingPartsToFormFormat(part.sub_parts) : []
            } as AircraftPart;
        });
    }, []); // Sin dependencias porque la función es pura

    // Inicializar datos con la información existente de la aeronave
    useEffect(() => {
        if (!aircraft) return;

        // Buscar cliente por ID
        const clientName = (aircraft as any).client_id && clients ? 
            clients.find(client => client.id.toString() === (aircraft as any).client_id.toString())?.name || "" :
            aircraft.client?.name || "";

        // Inicializar datos de la aeronave
        setAircraftData({
            manufacturer_id: aircraft.manufacturer?.id?.toString() || "",
            client_name: clientName,
            authorizing: (aircraft.client?.authorizing || "PROPIETARIO") as "PROPIETARIO" | "EXPLOTADOR",
            serial: aircraft.serial || "",
            model: (aircraft as any).model || "",
            acronym: aircraft.acronym || "",
            flight_hours: aircraft.flight_hours ? Number(aircraft.flight_hours).toFixed(2) : "0.00",
            flight_cycles: aircraft.flight_cycles ? Math.round(Number(aircraft.flight_cycles)).toString() : "0",
            fabricant_date: aircraft.fabricant_date ? new Date(aircraft.fabricant_date) : new Date(),
            location_id: aircraft.location?.id?.toString() || "",
            comments: aircraft.comments || "",
        });

        // Inicializar datos de las partes
        if (aircraft.aircraft_parts?.length > 0) {
            setPartsData({ parts: transformExistingPartsToFormFormat(aircraft.aircraft_parts) });
        }
    }, [aircraft, clients, transformExistingPartsToFormFormat]);

    // Función para transformar las partes del formulario al formato API
    const transformPart = (part: AircraftPart, originalPart?: any): any => {
        const { category, ...rest } = part;
        
        // Mapear categoría a part_type
        const part_type = category === "APU" ? "apu" : 
                         category === "PROPELLER" ? "propeller" : 
                         "engine"; // Default: engine
        
        return {
            ...(originalPart?.id && { id: originalPart.id }), // Preservar ID para actualizaciones
            ...rest,
            time_since_new: Math.round((rest.time_since_new ?? 0) * 100) / 100,
            time_since_overhaul: Math.round((rest.time_since_overhaul ?? 0) * 100) / 100,
            cycles_since_new: Math.round(rest.cycles_since_new ?? 0),
            cycles_since_overhaul: Math.round(rest.cycles_since_overhaul ?? 0),
            part_type,
            sub_parts: part.sub_parts?.map((subPart, index) => {
                const originalSubPart = originalPart?.sub_parts?.[index];
                return transformPart(subPart, originalSubPart);
            })
        };
    };

    const handleSubmit = async () => {
        if (!aircraftData || !partsData || !aircraft) return;

        try {
            const transformedParts = partsData.parts.map((part, index) => 
                transformPart(part, aircraft.aircraft_parts?.[index])
            );

            await updateMaintenanceAircraft.mutateAsync({
                acronym: aircraft.acronym,
                data: {
                    aircraft: {
                        manufacturer_id: aircraftData.manufacturer_id,
                        client_id: aircraft.client?.id?.toString() || "",
                        serial: aircraftData.serial,
                        model: aircraftData.model,
                        acronym: aircraftData.acronym,
                        flight_hours: Number(aircraftData.flight_hours),
                        flight_cycles: Number(aircraftData.flight_cycles),
                        fabricant_date: aircraftData.fabricant_date,
                        comments: aircraftData.comments,
                        location_id: aircraftData.location_id,
                    },
                    parts: transformedParts,
                },
                company: selectedCompany!.slug,
            });
            
            router.push(`/${selectedCompany?.slug}/planificacion/aeronaves`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNext = () => setCurrentStep((prev) => prev + 1);
    const handleBack = () => setCurrentStep((prev) => prev - 1);
    const handleCancel = () => {
        router.push(`/${selectedCompany?.slug}/planificacion/aeronaves`);
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    if (isError || !aircraft) {
        return (
            <ContentLayout title="Error">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <h2 className="text-2xl font-bold text-destructive">Aeronave no encontrada</h2>
                    <p className="text-muted-foreground">No se pudo cargar la información de la aeronave {params.acronym}</p>
                    <Button onClick={handleCancel} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Aeronaves
                    </Button>image.png
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title={`Editar Aeronave: ${aircraft.acronym}`}>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Editar Aeronave: {aircraft.acronym}</h1>
                        <p className="text-muted-foreground">Modifica la información y partes de la aeronave</p>
                    </div>
                    <Button variant="outline" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                </div>

                {/* Stepper visual con Tabs */}
                <Tabs value={String(currentStep)} className="w-full" defaultValue="1">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="1" className={currentStep === 1 ? "font-bold" : ""}>
                            1. Información
                        </TabsTrigger>
                        <TabsTrigger value="2" className={currentStep === 2 ? "font-bold" : ""}>
                            2. Partes
                        </TabsTrigger>
                        <TabsTrigger value="3" className={currentStep === 3 ? "font-bold" : ""}>
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
                                    <h3 className="text-2xl font-bold text-primary">Resumen de Cambios</h3>
                                    <p className="text-muted-foreground">Revise los datos antes de confirmar la actualización</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Información de la Aeronave */}
                                    <Card className="overflow-hidden">
                                        <CardHeader className="bg-primary/5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Plane className="h-5 w-5 text-primary" />
                                                <CardTitle className="text-lg font-semibold">Información de la Aeronave</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="text-sm text-muted-foreground">Fabricante</div>
                                                <div className="text-sm font-medium">{aircraftData?.manufacturer_id}</div>
                                                
                                                <div className="text-sm text-muted-foreground">Cliente</div>
                                                <div className="text-sm font-medium">{aircraftData?.client_name}</div>
                                                
                                                <div className="text-sm text-muted-foreground">Serial</div>
                                                <div className="text-sm font-medium">{aircraftData?.serial}</div>
                                                
                                                <div className="text-sm text-muted-foreground">Acrónimo</div>
                                                <div className="text-sm font-medium">{aircraftData?.acronym}</div>
                                                
                                                <div className="text-sm text-muted-foreground">Horas de Vuelo</div>
                                                <div className="text-sm font-medium">{aircraftData?.flight_hours}</div>
                                                
                                                <div className="text-sm text-muted-foreground">Ciclos de Vuelo</div>
                                                <div className="text-sm font-medium">{aircraftData?.flight_cycles}</div>
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
                                                <div className="space-y-3">
                                                    {partsData.parts.map((part, index) => (
                                                        <div key={index} className="border rounded-lg p-3">
                                                            <div className="font-medium text-sm">{part.part_name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                PN: {part.part_number} | Serial: {part.serial}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Condición: {part.condition_type}
                                                            </div>
                                                        </div>
                                                    ))}
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
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={handleCancel}>
                                            Cancelar
                                        </Button>
                                        <Button
                                            disabled={updateMaintenanceAircraft.isPending}
                                            type="button"
                                            onClick={handleSubmit}
                                            className="min-w-[180px]"
                                        >
                                            {updateMaintenanceAircraft.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Actualizando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Confirmar Actualización
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </ContentLayout>
    );
}
