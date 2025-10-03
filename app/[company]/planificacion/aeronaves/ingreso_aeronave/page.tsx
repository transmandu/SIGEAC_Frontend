"use client";

import { useCreateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import { AircraftPartsInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyStore } from "@/stores/CompanyStore";
import { TabsContent } from "@radix-ui/react-tabs";
import {
    ArrowLeft,
    CheckCircle,
    Loader2,
    Plane,
    Settings
} from "lucide-react";
import { useState } from "react";
import { InfoItem } from "./_components/InfoItem";
import { PartSummaryCard } from "./_components/PartSummaryCard";
import { useRouter } from "next/navigation";
import { AircraftInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftInfoForm";

interface AircraftPart {
    category?: "ENGINE" | "APU" | "POWER_PLANT" | "PROPELLER"; // Solo frontend
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
    sub_parts?: AircraftPartAPI[];
}

interface AircraftInfoType {
    manufacturer_id: string;
    client_id: string;
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
    const router = useRouter()

    // Función para transformar las partes y eliminar el campo 'category' (solo frontend)
    const transformPart = (part: AircraftPart): AircraftPartAPI => {
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
        
        if (part.sub_parts && part.sub_parts.length > 0) {
            transformed.sub_parts = part.sub_parts.map(transformPart);
        }
        
        return transformed;
    };

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
                    company: selectedCompany!.slug,
                });
                
                // redirección opcional
                router.push(`/${selectedCompany?.slug}/planificacion/aeronaves`);
            } catch (error) {
                console.error(error);
            }
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
                        <TabsContent value="1"
                        >
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
                        <TabsContent value="2">
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
                        <TabsContent value="3">
                            <div className="space-y-6 mt-4">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-primary">Resumen de Información</h3>
                                    <p className="text-muted-foreground">Revise los datos antes de confirmar el registro</p>
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
                                                <InfoItem label="Fabricante" value={aircraftData?.manufacturer_id} />
                                                <InfoItem label="Serial" value={aircraftData?.serial} />
                                                <InfoItem label="Acrónimo" value={aircraftData?.acronym} />
                                                <InfoItem label="Horas de Vuelo" value={aircraftData?.flight_hours} />
                                                <InfoItem
                                                    label="Fecha de Fabricación"
                                                    value={aircraftData?.fabricant_date?.toLocaleDateString()}
                                                />
                                                <InfoItem label="Ubicación" value={aircraftData?.location_id} />
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
                                                        <PartSummaryCard
                                                            key={index}
                                                            part={part}
                                                            index={index}
                                                            level={0}
                                                        />
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
                                    <Button
                                        disabled={createMaintenanceAircraft.isPending}
                                        type="button"
                                        onClick={handleSubmit}
                                        className="min-w-[180px]"
                                    >
                                        {createMaintenanceAircraft.isPending ? (
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
