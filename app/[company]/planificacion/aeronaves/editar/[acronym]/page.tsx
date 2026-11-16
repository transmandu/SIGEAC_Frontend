"use client";

import {
  EditReasonFields,
  EditReasonValue,
  editReasonErrorFrom,
} from "@/components/forms/mantenimiento/planificacion/EditReasonFields";
import { useGetMaintenanceAircraftByAcronym } from "@/hooks/mantenimiento/planificacion/useGetMaitenanceAircraftByAcronym";
import { ContentLayout } from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Plane,
  Settings,
  ChevronDown,
} from "lucide-react";
import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AircraftInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftInfoForm";
import { AircraftPartsInfoForm } from "@/components/forms/mantenimiento/aeronaves/AircraftPartsForm";
import { useUpdateMaintenanceAircraft } from "@/actions/mantenimiento/planificacion/aeronaves/actions";
import LoadingPage from "@/components/misc/LoadingPage";
import { useGetClients } from "@/hooks/mantenimiento/clientes/useGetClients";
import { useGetManufacturers } from "@/hooks/general/fabricantes/useGetManufacturers";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatNumber } from "@/lib/formatNumber";
import { formatDate } from "@/lib/utils";
import { parseCalendarDate, toCalendarPayload } from "@/lib/date";
import { useOnChange } from "@/hooks/useOnChange";
import { locationLabel } from "@/lib/locations";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { useCreateClient } from "@/actions/mantenimiento/clientes/actions";
import { partLabel } from "@/app/[company]/planificacion/aeronaves/_components/partLabel";

interface AircraftPart {
  id?: number; // ID para actualizaciones
  type: string;
  part_number: string;
  serial: string;
  manufacturer_id: string;
  ata_chapter?: string | null;
  position?: string | null;
  part_order?: number | null;
  time_since_new?: number | null; // Time Since New
  time_since_overhaul?: number | null; // Time Since Overhaul
  cycles_since_new?: number | null; // Cycles Since New
  cycles_since_overhaul?: number | null; // Cycles Since Overhaul
  condition_type: "NEW" | "OVERHAULED";
  is_father: boolean;
  removed_date?: string | null;
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

const fmtNumber = (n: unknown) =>
  formatNumber(n, { maxDecimals: 3, fallback: "0" });

// 0 es un valor válido; solo null/undefined/"" significan "no aplica".
const fmtCounter = (n: unknown) =>
  n === null || n === undefined || n === ""
    ? "No aplica"
    : formatNumber(n, { maxDecimals: 3, fallback: "No aplica" });

/** Contador de una parte tal como llega (hasta 3 decimales); null si la parte no lo lleva. */
const toCounter = (value: unknown): number | null =>
  value === null || value === undefined || value === ""
    ? null
    : Math.round(Number(value) * 1000) / 1000;

function PartsSummaryTree({
  parts,
  level = 0,
}: {
  parts: AircraftPart[];
  level?: number;
}) {
  return (
    <div className={`space-y-2 ${level > 0 ? "pl-4 border-l" : ""}`}>
      {parts.map((part, index) => (
        <Collapsible key={`${part.id ?? part.part_number}-${index}`}>
          <div className="border rounded-lg">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 transition-transform [[data-state=closed]>&]:-rotate-90" />
                  <div className="flex flex-col">
                    <span
                      className={`font-medium text-sm ${part.removed_date ? "line-through text-muted-foreground" : ""}`}
                    >
                      {part.type ? partLabel(part) : `Parte ${index + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {part.removed_date
                        ? `Removida el ${formatDate(part.removed_date)}`
                        : level === 0
                          ? "Parte principal"
                          : "Subparte"}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {part.part_number || "Sin PN"}
                </span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-3 pt-0 space-y-2 border-t">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">PN:</span>{" "}
                  {part.part_number || "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Condición:</span>{" "}
                  {part.condition_type === "OVERHAULED"
                    ? "Reacondicionada"
                    : "Nueva"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Serial:</span>{" "}
                    {part.serial || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">ATA:</span>{" "}
                    {part.ata_chapter || "N/A"}
                  </div>
                  {level === 0 && (
                    <>
                      <div>
                        <span className="font-medium">Posición:</span>{" "}
                        {part.position || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Orden:</span>{" "}
                        {part.part_order ?? "N/A"}
                      </div>
                    </>
                  )}
                  <div>
                    <span className="font-medium">TSN:</span>{" "}
                    {fmtCounter(part.time_since_new)}
                  </div>
                  <div>
                    <span className="font-medium">TSO:</span>{" "}
                    {fmtCounter(part.time_since_overhaul)}
                  </div>
                  <div>
                    <span className="font-medium">CSN:</span>{" "}
                    {fmtCounter(part.cycles_since_new)}
                  </div>
                  <div>
                    <span className="font-medium">CSO:</span>{" "}
                    {fmtCounter(part.cycles_since_overhaul)}
                  </div>
                </div>

                {part.sub_parts && part.sub_parts.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Subpartes ({part.sub_parts.length})
                    </div>
                    <PartsSummaryTree
                      parts={part.sub_parts}
                      level={level + 1}
                    />
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

/**
 * Partes del API -> formato del formulario. Recursiva (las subpartes) y pura:
 * no lee nada del componente, así que vive fuera de él. Dentro, como un
 * `useCallback` que se llamaba a sí mismo, no podía referirse a su propio nombre
 * mientras se declaraba.
 */
function transformExistingPartsToFormFormat(apiParts: any[]): AircraftPart[] {
  return apiParts.map((part) => {
    return {
      ...(part.id && { id: part.id }),
      part_number: part.part_number,
      serial: part.serial || "",
      manufacturer_id: part.manufacturer_id?.toString() || "",
      type: part.type ? String(part.type).trim().toUpperCase() : "",
      ata_chapter: part.ata_chapter || part.ata_number || part.ata || "",
      position: part.position ?? null,
      part_order: part.part_order ?? null,
      time_since_new: toCounter(part.time_since_new),
      time_since_overhaul: toCounter(part.time_since_overhaul),
      cycles_since_new: toCounter(part.cycles_since_new),
      cycles_since_overhaul: toCounter(part.cycles_since_overhaul),
      condition_type:
        part.condition_type === "OVERHAULED" ? "OVERHAULED" : "NEW",
      is_father:
        typeof part.is_father === "boolean"
          ? part.is_father
          : Boolean(part.sub_parts?.length),
      removed_date: part.removed_date || null,
      sub_parts: part.sub_parts
        ? transformExistingPartsToFormFormat(part.sub_parts)
        : [],
    } as AircraftPart;
  });
}

export default function EditAircraftPage({
  params,
}: {
  params: Promise<{ acronym: string; company: string }>;
}) {
  const { acronym } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [aircraftData, setAircraftData] = useState<AircraftInfoType>();
  const [partsData, setPartsData] = useState<PartsData>({ parts: [] });
  const [isInitialized, setIsInitialized] = useState(false);
  const { updateMaintenanceAircraft } = useUpdateMaintenanceAircraft();
  const { createClient } = useCreateClient();
  const [reason, setReason] = useState<EditReasonValue>({});
  const [reasonError, setReasonError] = useState<string>();
  const { selectedCompany } = useCompanyStore();
  const router = useRouter();

  // Obtener datos de la aeronave
  const {
    data: aircraft,
    isLoading,
    isError,
  } = useGetMaintenanceAircraftByAcronym(selectedCompany?.slug, acronym);

  // Obtener lista de clientes para buscar el cliente de la aeronave
  const { data: clients } = useGetClients(selectedCompany?.slug);

  // Obtener lista de fabricantes para mostrar el nombre en el resumen
  const { data: manufacturers } = useGetManufacturers(selectedCompany?.slug);
  const { data: locations } = useGetLocationsByCompany(selectedCompany?.slug);

  const transformAssignmentsToFormFormat = useCallback(
    (assignments: AircraftAssignment[] = []): AircraftPart[] => {
      const uniqueRootParts = assignments
        .filter(
          (assignment) =>
            assignment.removed_date === null ||
            assignment.removed_date === undefined,
        )
        .map((assignment) => {
          const src = assignment.aircraft_part as any;
          const assignmentData = assignment as any;
          return {
            ...(src || {}),
            ata_chapter:
              assignmentData.ata_chapter ??
              src?.ata_chapter ??
              assignmentData.ata_number ??
              src?.ata_number ??
              src?.ata ??
              null,
            position: assignmentData.position ?? src?.position ?? null,
            part_order: assignmentData.part_order ?? src?.part_order ?? null,
            time_since_new: src?.time_since_new ?? null,
            time_since_overhaul: src?.time_since_overhaul ?? null,
            cycles_since_new: src?.cycles_since_new ?? null,
            cycles_since_overhaul: src?.cycles_since_overhaul ?? null,
          };
        })
        .filter((part): part is any => Boolean(part) && !part.parent_part_id)
        .filter(
          (part, index, array) =>
            array.findIndex((candidate) => candidate.id === part.id) === index,
        );

      return transformExistingPartsToFormFormat(uniqueRootParts);
    },
    [],
  );

  // Inicializar datos con la información existente de la aeronave
  useOnChange(
    [aircraft, clients, isInitialized, transformAssignmentsToFormFormat],
    () => {
      if (!aircraft || isInitialized) return;
      if ((aircraft as any).client_id && !clients) return;

      // Buscar cliente por ID
      const clientName =
        (aircraft as any).client_id && clients
          ? clients.find(
              (client) =>
                client.id.toString() === (aircraft as any).client_id.toString(),
            )?.name || ""
          : aircraft.client?.name || "";

      // Inicializar datos de la aeronave
      setAircraftData({
        manufacturer_id: aircraft.manufacturer?.id?.toString() || "",
        client_name: clientName,
        authorizing: (aircraft.client?.authorizing || "PROPIETARIO") as
          "PROPIETARIO" | "EXPLOTADOR",
        serial: aircraft.serial || "",
        model: (aircraft as any).model || "",
        acronym: aircraft.acronym || "",
        flight_hours: aircraft.flight_hours
          ? Number(aircraft.flight_hours).toFixed(3)
          : "0.000",
        // Sin redondear: un valor no entero debe verse (y corregirse) en el
        // formulario, no cambiar en silencio al guardar.
        flight_cycles: aircraft.flight_cycles
          ? String(Number(aircraft.flight_cycles))
          : "0",
        fabricant_date:
          parseCalendarDate(aircraft.fabricant_date) ?? new Date(),
        location_id: aircraft.location?.id?.toString() || "",
        comments: aircraft.comments || "",
      });

      // Las partes vienen en las asignaciones vigentes (`aircraft_assignments`).
      setPartsData({
        parts: transformAssignmentsToFormFormat(
          (aircraft as any).aircraft_assignments ?? [],
        ),
      });
      setIsInitialized(true);
    },
  );

  // Función para transformar las partes del formulario al formato API
  // El formulario ya trae el `id` de cada parte existente; las nuevas no lo traen.
  const transformPart = (part: AircraftPart): any => ({
    ...part,
    time_since_new: toCounter(part.time_since_new),
    time_since_overhaul: toCounter(part.time_since_overhaul),
    cycles_since_new: toCounter(part.cycles_since_new),
    cycles_since_overhaul: toCounter(part.cycles_since_overhaul),
    ata_chapter: part.ata_chapter ?? null,
    position: part.position ?? null,
    part_order: part.part_order ?? null,
    sub_parts: part.sub_parts?.map(transformPart),
  });

  const handleSubmit = async () => {
    if (!aircraftData || !partsData || !aircraft) return;

    try {
      const transformedParts = partsData.parts.map(transformPart);

      // El cliente se puede cambiar en el paso 1: se resuelve por nombre (o se
      // crea), igual que al registrar. Antes se enviaba siempre el original.
      const clientName = aircraftData.client_name.trim();
      let clientId = aircraft.client?.id?.toString() || "";
      if (
        clientName.toUpperCase() !== (aircraft.client?.name ?? "").toUpperCase()
      ) {
        const existingClient = clients?.find(
          (client) =>
            client.name.trim().toUpperCase() === clientName.toUpperCase(),
        );
        if (existingClient) {
          clientId = existingClient.id.toString();
        } else {
          const created = await createClient.mutateAsync({
            company: selectedCompany!.slug,
            data: { name: clientName, authorizing: aircraftData.authorizing },
          });
          clientId = (created.client?.id || created.id).toString();
        }
      }

      await updateMaintenanceAircraft.mutateAsync({
        acronym: aircraft.acronym,
        data: {
          aircraft: {
            manufacturer_id: aircraftData.manufacturer_id,
            client_id: clientId,
            serial: aircraftData.serial,
            model: aircraftData.model,
            acronym: aircraftData.acronym,
            flight_hours: Number(aircraftData.flight_hours),
            flight_cycles: Number(aircraftData.flight_cycles),
            fabricant_date: toCalendarPayload(aircraftData.fabricant_date)!,
            comments: aircraftData.comments,
            location_id: aircraftData.location_id,
          },
          parts: transformedParts,
          ...reason,
        },
        company: selectedCompany!.slug,
      });

      router.push(`/${selectedCompany?.slug}/planificacion/aeronaves`);
    } catch (error) {
      setReasonError(editReasonErrorFrom(error));
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
        <PageHeader className="mb-6" />

        <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
          <h2 className="text-2xl font-bold text-destructive">
            Aeronave no encontrada
          </h2>
          <p className="text-muted-foreground">
            No se pudo cargar la información de la aeronave {acronym}
          </p>
          <Button onClick={handleCancel} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Aeronaves
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Editar Aeronave: ${aircraft.acronym}`}>
      <PageHeader className="mb-6" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Editar Aeronave: {aircraft.acronym}
            </h1>
            <p className="text-muted-foreground">
              Modifica la información y partes de la aeronave
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

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
                  <h3 className="text-2xl font-bold text-primary">
                    Resumen de Cambios
                  </h3>
                  <p className="text-muted-foreground">
                    Revise los datos antes de confirmar la actualización
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
                        <div className="text-sm text-muted-foreground">
                          Fabricante
                        </div>
                        <div className="text-sm font-medium">
                          {manufacturers?.find(
                            (m) =>
                              m.id.toString() === aircraftData?.manufacturer_id,
                          )?.name || aircraftData?.manufacturer_id}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Cliente
                        </div>
                        <div className="text-sm font-medium">
                          {aircraftData?.client_name}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Ubicación
                        </div>
                        <div className="text-sm font-medium">
                          {locationLabel(
                            locations?.find(
                              (l) =>
                                l.id.toString() === aircraftData?.location_id,
                            ),
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Serial
                        </div>
                        <div className="text-sm font-medium">
                          {aircraftData?.serial}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Matrícula
                        </div>
                        <div className="text-sm font-medium">
                          {aircraftData?.acronym}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Fecha de Fabricación
                        </div>
                        <div className="text-sm font-medium">
                          {aircraftData?.fabricant_date?.getFullYear()}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Horas de Vuelo
                        </div>
                        <div className="text-sm font-medium">
                          {fmtNumber(aircraftData?.flight_hours)}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Ciclos de Vuelo
                        </div>
                        <div className="text-sm font-medium">
                          {fmtNumber(aircraftData?.flight_cycles)}
                        </div>
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
                      <ScrollArea className="h-75">
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

                {/* El backend lo exige solo si cambió un dato ya cargado (horas, ciclos, matrícula, TSN de una parte...). */}
                <EditReasonFields
                  value={reason}
                  onChange={(value) => {
                    setReason(value);
                    setReasonError(undefined);
                  }}
                  error={reasonError}
                />

                <div className="flex justify-between items-center gap-x-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                    <Button
                      disabled={
                        updateMaintenanceAircraft.isPending ||
                        createClient.isPending
                      }
                      type="button"
                      onClick={handleSubmit}
                      className="min-w-45"
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
