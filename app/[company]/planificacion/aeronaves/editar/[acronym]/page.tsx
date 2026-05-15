"use client";

import { useGetMaintenanceAircraftByAcronym } from "@/hooks/mantenimiento/planificacion/useGetMaitenanceAircraftByAcronym";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCompanyStore } from "@/stores/CompanyStore";
import { ArrowLeft, CheckCircle, Loader2, Plane, Settings, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AircraftInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftInfoForm";
import { AircraftPartsInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { useUpdateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { useGetManufacturers } from "@/hooks/general/condiciones/useGetConditions";
import { parseISO } from "date-fns";

interface AircraftPart {
    id?: number; // ID para actualizaciones
    part_name: string;
    part_number: string;
    serial: string;
    manufacturer_id: string;
    time_since_new?: number;  // Time Since New
    time_since_overhaul?: number;  // Time Since Overhaul
    cycles_since_new?: number;  // Cycles Since New
    cycles_since_overhaul?: number;  // Cycles Since Overhaul
    condition_type: "NEW" | "OVERHAULED";
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

interface AircraftAssignment {
    removed_date?: string | null;
    aircraft_part?: any;
}

// Función para parsear fecha ISO sin problemas de timezone
const parseISODate = (dateString: string | Date | null | undefined): Date => {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;

    try {
        return parseISO(dateString);
    } catch {
        return new Date();
    }
};

function PartsSummaryTree({ parts, level = 0 }: { parts: AircraftPart[], level?: number }) {
    return (
        <div className={`space-y-2 ${level > 0 ? "pl-4 border-l" : ""}`}>
            {parts.map((part, index) => (
                <Collapsible key={`${part.id ?? part.part_number ?? part.part_name}-${index}`}>
                    <div className="border rounded-lg">
                        <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left">
                                <div className="flex items-center gap-2">
                                    <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:rotate-[-90deg]" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{part.part_name || `Parte ${index + 1}`}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {level === 0 ? "Parte principal" : "Subparte"}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{part.part_number || "Sin PN"}</span>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="p-3 pt-0 space-y-2 border-t">
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">PN:</span> {part.part_number || "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Condición:</span> {part.condition_type === "OVERHAULED" ? "Reacondicionada" : "Nueva"}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div><span className="font-medium">TSN:</span> {part.time_since_new ?? 0}</div>
                                    <div><span className="font-medium">TSO:</span> {part.time_since_overhaul ?? 0}</div>
                                    <div><span className="font-medium">CSN:</span> {part.cycles_since_new ?? 0}</div>
                                    <div><span className="font-medium">CSO:</span> {part.cycles_since_overhaul ?? 0}</div>
                                </div>

                                {part.sub_parts && part.sub_parts.length > 0 && (
                                    <div className="pt-2">
                                        <div className="text-xs font-medium text-muted-foreground mb-2">
                                            Subpartes ({part.sub_parts.length})
                                        </div>
                                        <PartsSummaryTree parts={part.sub_parts} level={level + 1} />
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            ))}
        </div>
    );
}

export default function EditAircraftPage({ params }: { params: { acronym: string, company: string } }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [aircraftData, setAircraftData] = useState<AircraftInfoType>();
    const [partsData, setPartsData] = useState<PartsData>({ parts: [] });
    const [isInitialized, setIsInitialized] = useState(false);
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

    // Obtener lista de fabricantes para mostrar el nombre en el resumen
    const { data: manufacturers } = useGetManufacturers(selectedCompany?.slug);

    // Función para transformar partes del API al formato del formulario
    const transformExistingPartsToFormFormat = useCallback((apiParts: any[]): AircraftPart[] => {
        return apiParts.map(part => {
            return {
                ...(part.id && { id: part.id }),
                part_name: part.part_name,
                part_number: part.part_number,
                serial: part.serial || "",
                manufacturer_id: part.manufacturer_id?.toString() || "",
                type: part.type ? String(part.type).charAt(0).toUpperCase() + String(part.type).slice(1).toLowerCase() : "",
                ata_chapter: part.ata_chapter || part.ata_number || part.ata || "",
                position: part.position ?? (part as any).position ?? null,
                part_order: part.part_order ?? null,
                time_since_new: Math.round(Number(part.time_since_new || part.part_hours || 0) * 100) / 100,
                time_since_overhaul: Math.round(Number(part.time_since_overhaul || 0) * 100) / 100,
                cycles_since_new: Math.round(Number(part.cycles_since_new || part.part_cycles || 0)),
                cycles_since_overhaul: Math.round(Number(part.cycles_since_overhaul || 0)),
                condition_type: part.condition_type === "OVERHAULED" ? "OVERHAULED" : "NEW",
                is_father: typeof part.is_father === "boolean" ? part.is_father : Boolean(part.sub_parts?.length),
                removed_date: part.removed_date || null,
                sub_parts: part.sub_parts ? transformExistingPartsToFormFormat(part.sub_parts) : []
            } as AircraftPart;
        });
    }, []); // Sin dependencias porque la función es pura

    const transformAssignmentsToFormFormat = useCallback((assignments: AircraftAssignment[] = []): AircraftPart[] => {
        const uniqueRootParts = assignments
            .filter((assignment) => assignment.removed_date === null || assignment.removed_date === undefined)
            .map((assignment) => {
                const src = assignment.aircraft_part as any;
                const assignmentData = assignment as any;
                return {
                    ...(src || {}),
                    ata_chapter: assignmentData.ata_chapter ?? src?.ata_chapter ?? assignmentData.ata_number ?? src?.ata_number ?? src?.ata ?? null,
                    position: assignmentData.position ?? src?.position ?? null,
                    part_order: assignmentData.part_order ?? src?.part_order ?? null,
                    time_since_new: assignmentData.time_since_new ?? src?.time_since_new ?? src?.part_hours ?? null,
                    time_since_overhaul: assignmentData.time_since_overhaul ?? src?.time_since_overhaul ?? null,
                    cycles_since_new: assignmentData.cycles_since_new ?? src?.cycles_since_new ?? src?.part_cycles ?? null,
                    cycles_since_overhaul: assignmentData.cycles_since_overhaul ?? src?.cycles_since_overhaul ?? null,
                };
            })
            .filter((part): part is any => Boolean(part) && !part.parent_part_id)
            .filter((part, index, array) => array.findIndex((candidate) => candidate.id === part.id) === index);

        return transformExistingPartsToFormFormat(uniqueRootParts);
    }, [transformExistingPartsToFormFormat]);

    // Inicializar datos con la información existente de la aeronave
    useEffect(() => {
        if (!aircraft || isInitialized) return;
        if ((aircraft as any).client_id && !clients) return;

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
            fabricant_date: parseISODate(aircraft.fabricant_date),
            location_id: aircraft.location?.id?.toString() || "",
            comments: aircraft.comments || "",
        });

        // Inicializar datos de las partes
        if (aircraft.aircraft_parts?.length > 0) {
            setPartsData({ parts: transformExistingPartsToFormFormat(aircraft.aircraft_parts) });
            setIsInitialized(true);
            return;
        }

        if ((aircraft as any).aircraft_assignments?.length > 0) {
            setPartsData({ parts: transformAssignmentsToFormFormat((aircraft as any).aircraft_assignments) });
            setIsInitialized(true);
            return;
        }

        setPartsData({ parts: [] });
        setIsInitialized(true);
    }, [aircraft, clients, isInitialized, transformAssignmentsToFormFormat, transformExistingPartsToFormFormat]);

    // Función para transformar las partes del formulario al formato API
    const transformPart = (part: AircraftPart, originalPart?: any): any => {
        const { ...rest } = part;

        return {
            ...(originalPart?.id && { id: originalPart.id }), // Preservar ID para actualizaciones
            ...rest,
            part_type: originalPart?.part_type || "engine",
            time_since_new: rest.time_since_new !== null && rest.time_since_new !== undefined ? Math.round((rest.time_since_new as number) * 100) / 100 : null,
            time_since_overhaul: rest.time_since_overhaul !== null && rest.time_since_overhaul !== undefined ? Math.round((rest.time_since_overhaul as number) * 100) / 100 : null,
            cycles_since_new: rest.cycles_since_new !== null && rest.cycles_since_new !== undefined ? Math.round(rest.cycles_since_new as number) : null,
            cycles_since_overhaul: rest.cycles_since_overhaul !== null && rest.cycles_since_overhaul !== undefined ? Math.round(rest.cycles_since_overhaul as number) : null,
            ata_chapter: (rest as any).ata_chapter ?? originalPart?.ata_chapter ?? null,
            position: (rest as any).position ?? originalPart?.position ?? null,
            part_order: (rest as any).part_order ?? originalPart?.part_order ?? null,
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
                        type: "MAINTENANCE",
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
                                onBack={(data) => {
                                    setPartsData(data);
                                    handleBack();
                                }}
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
                                                <div className="text-sm font-medium">
                                                    {manufacturers?.find(m => m.id.toString() === aircraftData?.manufacturer_id)?.name || aircraftData?.manufacturer_id}
                                                </div>

                                                <div className="text-sm text-muted-foreground">Cliente</div>
                                                <div className="text-sm font-medium">{aircraftData?.client_name}</div>

                                                <div className="text-sm text-muted-foreground">Serial</div>
                                                <div className="text-sm font-medium">{aircraftData?.serial}</div>

                                                <div className="text-sm text-muted-foreground">Matrícula</div>
                                                <div className="text-sm font-medium">{aircraftData?.acronym}</div>

                                                <div className="text-sm text-muted-foreground">Fecha de Fabricación</div>
                                                <div className="text-sm font-medium">{aircraftData?.fabricant_date?.getFullYear()}</div>

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
                                                {partsData.parts.length > 0 ? (
                                                    <PartsSummaryTree parts={partsData.parts} />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                                        No hay partes registradas
                                                    </div>
                                                )}
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
