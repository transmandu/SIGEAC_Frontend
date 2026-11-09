"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PassengersTable } from "./PassengersTable";
import {
  useCreatePaxFlight,
  useUpdatePaxFlight,
  useNextFlightCode,
  useAvailableCargoManifests,
} from "@/actions/counter/actions";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetExternalAircraftSuggestions } from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { useGetExternalPilots } from "@/hooks/operaciones/cargo/useGetExternalPilots";
import {
  AvailableCargoManifestSummary,
  FlightType,
  PaxFlight,
  PaxPassenger,
} from "@/types";
import {
  Loader2,
  Plane,
  Package,
  Layers,
  Calendar,
  UserCheck,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { PdfEndpointPreviewDialog } from "@/components/dialogs/shared/PdfEndpointPreviewDialog";

interface PaxFlightFormProps {
  company: string;
  initialData?: PaxFlight;
  isEditing?: boolean;
}

export const PaxFlightForm = ({
  company,
  initialData,
  isEditing = false,
}: PaxFlightFormProps) => {
  const router = useRouter();

  // Form State
  const [flightDate, setFlightDate] = useState<string>(() => {
    if (initialData?.flight_date_raw) return initialData.flight_date_raw;
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  const parsedDate = new Date(flightDate + "T12:00:00Z");
  const month = parsedDate.getMonth() + 1;
  const year = parsedDate.getFullYear();

  const [route, setRoute] = useState<string>(initialData?.route || "PZO-CAJ");
  const [flightType, setFlightType] = useState<FlightType>(
    initialData?.flight_type || "PAX",
  );

  // Aeronave
  const [aircraftType, setAircraftType] = useState<"internal" | "external">(
    initialData?.external_aircraft ? "external" : "internal",
  );
  const [aircraftId, setAircraftId] = useState<number | null>(
    initialData?.aircraft_id || null,
  );
  const [externalAircraft, setExternalAircraft] = useState<string>(
    initialData?.external_aircraft || "",
  );

  // Tripulación
  const [captainType, setCaptainType] = useState<"internal" | "external">(
    initialData?.external_captain_id ? "external" : "internal",
  );
  const [captainId, setCaptainId] = useState<number | null>(
    initialData?.captain_id || null,
  );
  const [externalCaptainId, setExternalCaptainId] = useState<number | null>(
    initialData?.external_captain_id || null,
  );

  const [firstOfficerType, setFirstOfficerType] = useState<
    "internal" | "external"
  >(initialData?.external_first_officer_id ? "external" : "internal");
  const [firstOfficerId, setFirstOfficerId] = useState<number | null>(
    initialData?.first_officer_id || null,
  );
  const [externalFirstOfficerId, setExternalFirstOfficerId] = useState<
    number | null
  >(initialData?.external_first_officer_id || null);

  // Manifiesto de Carga Asociado
  const [cargoManifestId, setCargoManifestId] = useState<number | null>(
    initialData?.cargo_manifest_id || null,
  );

  // Pasajeros
  const [passengers, setPassengers] = useState<Omit<PaxPassenger, "id">[]>(
    () => {
      if (initialData?.passengers && initialData.passengers.length > 0) {
        return initialData.passengers.map((p) => ({
          seat_number: p.seat_number,
          full_name: p.full_name,
          nationality: p.nationality,
          id_number: p.id_number,
          lodge_type: p.lodge_type,
          agency: p.agency || "",
          luggage_weight:
            p.luggage_weight != null ? String(p.luggage_weight) : "",
          body_weight: p.body_weight != null ? Number(p.body_weight) : null,
          payment_method: p.payment_method || null,
          amount_paid: p.amount_paid != null ? Number(p.amount_paid) : null,
          return_flight:
            p.return_flight != null ? Boolean(p.return_flight) : false,
        }));
      }
      return [];
    },
  );

  const [importedNotice, setImportedNotice] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isEditing && !initialData && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("sigeac_prefill_pax_flight");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.flightType) {
            setFlightType(parsed.flightType);
          }
          if (
            Array.isArray(parsed.passengers) &&
            parsed.passengers.length > 0
          ) {
            setPassengers(parsed.passengers);
          }
          if (parsed.source) {
            setImportedNotice(parsed.source);
          }
          sessionStorage.removeItem("sigeac_prefill_pax_flight");
        } catch {
          // ignore parsing error
        }
      }
    }
  }, [isEditing, initialData]);

  // Queries externas
  const { data: aircrafts } = useGetAircrafts(company);
  const { data: externalAircrafts } =
    useGetExternalAircraftSuggestions(company);
  const { data: pilots } = useGetPilots(company);
  const { data: externalPilots } = useGetExternalPilots(company);
  const { data: nextCode } = useNextFlightCode(company, month, year);
  const { data: availableManifests } = useAvailableCargoManifests(
    company,
    month,
    year,
    aircraftId,
    initialData?.id,
  );

  // Peso total del vuelo (pasajeros × 100 kg + carga del manifiesto)
  const PAX_WEIGHT_KG = 100;
  const MAX_PAX_SEATS = 19;

  const selectedCargoManifest = useMemo(() => {
    if (!cargoManifestId || !availableManifests) return null;
    return (
      (
        availableManifests as (AvailableCargoManifestSummary & {
          items?: any[];
        })[]
      ).find((m) => m.id === cargoManifestId) || null
    );
  }, [cargoManifestId, availableManifests]);

  const manifestDetails = useMemo(() => {
    if (!cargoManifestId) return null;
    if (selectedCargoManifest) {
      return {
        number: selectedCargoManifest.manifest_number,
        aircraft: selectedCargoManifest.aircraft_label || "No asignada",
        totalWeight: Number(selectedCargoManifest.total_weight ?? 0),
        itemsCount:
          selectedCargoManifest.items_count ??
          selectedCargoManifest.items?.length ??
          0,
        breakdown: selectedCargoManifest.client_breakdown || {},
      };
    }
    if (initialData?.cargo_manifest_id === cargoManifestId) {
      const breakdown = initialData.cargo_breakdown || {};
      const total = Object.values(breakdown).reduce((a, b) => a + Number(b), 0);
      return {
        number:
          initialData.cargo_manifest_number ||
          `#${initialData.cargo_manifest_id}`,
        aircraft:
          initialData.aircraft_label ||
          initialData.external_aircraft ||
          "No asignada",
        totalWeight: total,
        itemsCount: undefined,
        breakdown,
      };
    }
    return null;
  }, [cargoManifestId, selectedCargoManifest, initialData]);

  const passengerWeight = passengers.length * PAX_WEIGHT_KG;
  const cargoWeight = (() => {
    if (!cargoManifestId) return 0;
    if (selectedCargoManifest) {
      return Number(selectedCargoManifest.total_weight ?? 0);
    }
    if (initialData?.cargo_manifest_id === cargoManifestId) {
      const breakdown = initialData?.cargo_breakdown ?? {};
      return Object.values(breakdown).reduce((a, b) => a + Number(b), 0);
    }
    return 0;
  })();
  const totalWeight = Math.round((passengerWeight + cargoWeight) * 100) / 100;

  // Si el vuelo es exclusivamente de pasajeros (PAX sin carga), la aeronave admite hasta 19 pasajeros (1900 kg).
  // Si lleva carga (Híbrido o Solo Carga), el peso máximo de la aeronave es 1800 kg.
  const isPurePax = flightType === "PAX" && cargoWeight === 0;
  const maxWeightKg = isPurePax ? 1900 : 1800;

  const availableWeight = Math.round((maxWeightKg - totalWeight) * 100) / 100;
  const excessWeight = Math.round((totalWeight - maxWeightKg) * 100) / 100;
  const exceedsSeats =
    passengers.length > MAX_PAX_SEATS && flightType !== "CARGO_ONLY";
  const exceedsWeight = totalWeight > maxWeightKg;
  const isOverweight = exceedsSeats || exceedsWeight;

  // Mutations
  const createMutation = useCreatePaxFlight(company);
  const updateMutation = useUpdatePaxFlight(company, initialData?.id || 0);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!route.trim()) {
      toast.error("Por favor ingrese la ruta del vuelo.");
      return;
    }

    if (aircraftType === "internal" && !aircraftId) {
      toast.error("Debe seleccionar una aeronave registrada.");
      return;
    }

    if (aircraftType === "external" && !externalAircraft.trim()) {
      toast.error("Debe ingresar la matrícula de la aeronave externa.");
      return;
    }

    if (captainType === "internal" && !captainId) {
      toast.error("Debe seleccionar un capitán registrado.");
      return;
    }

    if (captainType === "external" && !externalCaptainId) {
      toast.error("Debe seleccionar un capitán externo.");
      return;
    }

    if (
      (flightType === "CARGO_ONLY" || flightType === "HYBRID") &&
      !cargoManifestId
    ) {
      toast.error(
        "Para vuelos Solo Carga o Híbridos debe vincular un Manifiesto de Carga.",
      );
      return;
    }

    if (flightType === "PAX" && passengers.length === 0) {
      toast.error(
        "Para vuelos de pasajeros (PAX) debe ingresar al menos un pasajero.",
      );
      return;
    }

    // Comprobar campos obligatorios en pasajeros
    for (const p of passengers) {
      if (!p.full_name.trim() || !p.id_number.trim()) {
        toast.error(
          `El pasajero en el asiento #${p.seat_number} tiene nombre o cédula vacía.`,
        );
        return;
      }
    }

    if (exceedsSeats) {
      toast.error(
        `La aeronave solo tiene capacidad para ${MAX_PAX_SEATS} pasajeros.`,
      );
      return;
    }

    if (exceedsWeight) {
      toast.error(
        `El peso total (${totalWeight} kg) supera la capacidad máxima de la aeronave (${maxWeightKg} kg).`,
      );
      return;
    }

    const payload = {
      flight_date: flightDate,
      route: route.trim().toUpperCase(),
      aircraft_id: aircraftType === "internal" ? aircraftId : null,
      external_aircraft:
        aircraftType === "external"
          ? externalAircraft.trim().toUpperCase()
          : null,
      captain_id: captainType === "internal" ? captainId : null,
      external_captain_id:
        captainType === "external" ? externalCaptainId : null,
      first_officer_id: firstOfficerType === "internal" ? firstOfficerId : null,
      external_first_officer_id:
        firstOfficerType === "external" ? externalFirstOfficerId : null,
      flight_type: flightType,
      cargo_manifest_id: flightType !== "PAX" ? cargoManifestId : null,
      passengers: flightType === "CARGO_ONLY" ? [] : passengers,
    };

    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push(`/${company}/operaciones/counter`);
    } catch {
      // Notificado en las acciones
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 w-full max-w-full"
    >
      {importedNotice && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 flex items-center justify-between dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold">📋 Datos importados:</span>
            <span>{importedNotice}</span>
          </div>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200"
          >
            Pre-cargado
          </Badge>
        </div>
      )}

      {/* Cabecera del Vuelo */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl">
                Datos Principales del Vuelo
              </CardTitle>
              <CardDescription>
                Información técnica y operativa de la aeronave y tripulación.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-sm font-mono py-1 px-3 self-start sm:self-auto"
            >
              Código: {initialData?.flight_code || nextCode || "TMD-XXXX"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="flight_date" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Fecha del
              Vuelo *
            </Label>
            <Input
              id="flight_date"
              type="date"
              value={flightDate}
              onChange={(e) => setFlightDate(e.target.value)}
              required
            />
          </div>

          {/* Ruta */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="route">Ruta del Vuelo *</Label>
            <Input
              id="route"
              value={route}
              placeholder="Ej. PZO-CAJ"
              onChange={(e) => setRoute(e.target.value.toUpperCase())}
              required
            />
          </div>

          {/* Tipo de Vuelo */}
          <div className="flex flex-col gap-2">
            <Label>Modalidad del Vuelo *</Label>
            <Select
              value={flightType}
              onValueChange={(val) => setFlightType(val as FlightType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAX">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-sky-500" />
                    <span>Solo Pasajeros (PAX)</span>
                  </div>
                </SelectItem>
                <SelectItem value="CARGO_ONLY">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span>Solo Carga</span>
                  </div>
                </SelectItem>
                <SelectItem value="HYBRID">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-500" />
                    <span>Híbrido (Pasajeros + Carga)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aeronave */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label>Aeronave *</Label>
              <button
                type="button"
                onClick={() =>
                  setAircraftType(
                    aircraftType === "internal" ? "external" : "internal",
                  )
                }
                className="text-xs text-primary hover:underline"
              >
                {aircraftType === "internal"
                  ? "Cambiar a Externa"
                  : "Cambiar a Flota"}
              </button>
            </div>
            {aircraftType === "internal" ? (
              <Select
                value={aircraftId ? String(aircraftId) : ""}
                onValueChange={(val) => setAircraftId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione aeronave" />
                </SelectTrigger>
                <SelectContent>
                  {aircrafts?.map((a: any) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.acronym} {a.model ? `- ${a.model}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Matrícula externa (Ej. YV-3450)"
                value={externalAircraft}
                onChange={(e) =>
                  setExternalAircraft(e.target.value.toUpperCase())
                }
                list="external-aircraft-list"
              />
            )}
            <datalist id="external-aircraft-list">
              {externalAircrafts?.map((ea: any, idx: number) => (
                <option key={idx} value={ea.acronym || ea} />
              ))}
            </datalist>
          </div>

          {/* Capitán */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Capitán (CAP) *
              </Label>
              <button
                type="button"
                onClick={() =>
                  setCaptainType(
                    captainType === "internal" ? "external" : "internal",
                  )
                }
                className="text-xs text-primary hover:underline"
              >
                {captainType === "internal"
                  ? "Piloto Externo"
                  : "Piloto Interno"}
              </button>
            </div>
            {captainType === "internal" ? (
              <Select
                value={captainId ? String(captainId) : ""}
                onValueChange={(val) => setCaptainId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione capitán" />
                </SelectTrigger>
                <SelectContent>
                  {pilots?.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.employee
                        ? `${p.employee.first_name} ${p.employee.last_name} (${p.employee_dni})`
                        : p.employee_dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={externalCaptainId ? String(externalCaptainId) : ""}
                onValueChange={(val) => setExternalCaptainId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione capitán externo" />
                </SelectTrigger>
                <SelectContent>
                  {externalPilots?.map((ep: any) => (
                    <SelectItem key={ep.id} value={String(ep.id)}>
                      {ep.first_name} {ep.last_name} ({ep.dni})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Primer Oficial */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Primer Oficial (F/O)
              </Label>
              <button
                type="button"
                onClick={() =>
                  setFirstOfficerType(
                    firstOfficerType === "internal" ? "external" : "internal",
                  )
                }
                className="text-xs text-primary hover:underline"
              >
                {firstOfficerType === "internal"
                  ? "Piloto Externo"
                  : "Piloto Interno"}
              </button>
            </div>
            {firstOfficerType === "internal" ? (
              <Select
                value={firstOfficerId ? String(firstOfficerId) : "none"}
                onValueChange={(val) =>
                  setFirstOfficerId(val === "none" ? null : Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin primer oficial</SelectItem>
                  {pilots?.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.employee
                        ? `${p.employee.first_name} ${p.employee.last_name} (${p.employee_dni})`
                        : p.employee_dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={
                  externalFirstOfficerId
                    ? String(externalFirstOfficerId)
                    : "none"
                }
                onValueChange={(val) =>
                  setExternalFirstOfficerId(val === "none" ? null : Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin primer oficial</SelectItem>
                  {externalPilots?.map((ep: any) => (
                    <SelectItem key={ep.id} value={String(ep.id)}>
                      {ep.first_name} {ep.last_name} ({ep.dni})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bloque de Manifiesto de Carga (para Solo Carga e Híbrido) */}
      {(flightType === "CARGO_ONLY" || flightType === "HYBRID") && (
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Package className="h-5 w-5" /> Vinculación de Carga
            </CardTitle>
            <CardDescription>
              Seleccione el manifiesto de carga emitido para este vuelo. La
              lista y pesos por cliente se calcularán automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="w-full max-w-md flex flex-col gap-2">
              <Label htmlFor="cargo_manifest">Manifiesto de Carga *</Label>
              <Select
                value={cargoManifestId ? String(cargoManifestId) : ""}
                onValueChange={(val) => setCargoManifestId(Number(val))}
              >
                <SelectTrigger id="cargo_manifest">
                  <SelectValue placeholder="Seleccione un manifiesto de carga" />
                </SelectTrigger>
                <SelectContent>
                  {initialData?.cargo_manifest_id && (
                    <SelectItem value={String(initialData.cargo_manifest_id)}>
                      {initialData.cargo_manifest_number ||
                        `Manifiesto #${initialData.cargo_manifest_id}`}{" "}
                      (Actual)
                    </SelectItem>
                  )}
                  {availableManifests && availableManifests.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>Disponibles para este mes</SelectLabel>
                      {availableManifests.map((m: any) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.manifest_number} — Total: {m.total_weight} kg (
                          {m.items?.length || 0} ítems)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : (
                    <SelectItem value="none" disabled>
                      No hay otros manifiestos de carga disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Vista previa y cotejo del Manifiesto de Carga seleccionado contra hoja física */}
            {manifestDetails && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3 mt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                    <span className="font-semibold text-sm text-foreground">
                      Cotejo de Manifiesto Físico: N° {manifestDetails.number}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-background border-amber-300 dark:border-amber-700 font-mono"
                  >
                    Aeronave: {manifestDetails.aircraft}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">
                      Peso Total Carga:
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {manifestDetails.totalWeight} KG
                    </span>
                  </div>
                  {manifestDetails.itemsCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground block">
                        Bultos / Ítems:
                      </span>
                      <span className="font-medium text-foreground">
                        {manifestDetails.itemsCount} ítems
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground block">
                      Clientes Registrados:
                    </span>
                    <span className="font-medium text-foreground">
                      {Object.keys(manifestDetails.breakdown).length} cliente(s)
                    </span>
                  </div>
                </div>

                {Object.keys(manifestDetails.breakdown).length > 0 && (
                  <div className="pt-2 border-t border-amber-200/70 dark:border-amber-900/50">
                    <span className="text-xs font-semibold block mb-1.5 text-muted-foreground uppercase tracking-wider">
                      Desglose de clientes y pesos (verificar contra la hoja
                      física):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {Object.entries(manifestDetails.breakdown).map(
                        ([client, weight]) => (
                          <div
                            key={client}
                            className="flex justify-between items-center bg-background/80 rounded px-2.5 py-1.5 border border-border/60"
                          >
                            <span
                              className="font-medium truncate max-w-37.5"
                              title={client}
                            >
                              {client}:
                            </span>
                            <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                              {weight} KG
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bloque de Pasajeros (para PAX e HÍBRIDO) */}
      {flightType !== "CARGO_ONLY" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-500" /> Manifiesto de Pasajeros
            </CardTitle>
            <CardDescription>
              Complete la información de cada pasajero. El número de asiento se
              asigna secuencialmente de 1 a 19.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Indicador de capacidad de peso */}
            <div
              className={`rounded-md border p-3 flex flex-wrap items-center justify-between text-sm gap-2 ${
                isOverweight
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : availableWeight < 200
                    ? "bg-yellow-500/10 border-yellow-300 text-yellow-700 dark:text-yellow-400"
                    : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span>
                  <span className="font-semibold">{passengers.length}</span> pax
                  × 100 kg ={" "}
                  <span className="font-semibold">{passengerWeight} kg</span>
                </span>
                {cargoWeight > 0 && (
                  <span>
                    + carga:{" "}
                    <span className="font-semibold">{cargoWeight} kg</span>
                  </span>
                )}
                <span className="font-bold border-l pl-4">
                  Total: {totalWeight} / {maxWeightKg} kg
                </span>
              </div>
              <span
                className={`font-semibold ${
                  isOverweight ? "text-destructive font-bold" : ""
                }`}
              >
                {isOverweight
                  ? exceedsSeats
                    ? `⚠ Asientos excedidos: máx ${MAX_PAX_SEATS} pax`
                    : `⚠ Exceso: ${excessWeight} kg`
                  : `Disponible: ${availableWeight} kg`}
              </span>
            </div>

            <PassengersTable
              passengers={passengers}
              onChange={setPassengers}
              company={company}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 text-amber-500/50" />
            <p className="font-semibold text-foreground">
              Vuelo configurado como SOLO CARGA
            </p>
            <p className="text-xs">
              El manifiesto impreso mostrará la leyenda central en rojo y el
              desglose de los clientes de carga.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Sobrepeso o Asientos Excedidos */}
      {isOverweight && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3.5 text-sm text-destructive font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">⚠</span>
            <span>
              {exceedsSeats
                ? `Capacidad de asientos excedida: La aeronave tiene capacidad máxima de ${MAX_PAX_SEATS} pasajeros (actualmente tiene ${passengers.length}).`
                : `Capacidad excedida: El peso total (${totalWeight} kg) supera el límite máximo de ${maxWeightKg} kg por ${excessWeight} kg. Ajuste los pasajeros o el manifiesto de carga.`}
            </span>
          </div>
          <Badge
            variant="destructive"
            className="uppercase text-[11px] tracking-wide"
          >
            Guardado bloqueado
          </Badge>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-4 border-t">
        {isEditing && initialData?.id && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full sm:w-auto text-sky-600 border-sky-200 hover:bg-sky-50 dark:border-sky-900 dark:hover:bg-sky-950/40"
            title="Previsualizar el diseño actual del PDF sin salir"
          >
            <Eye className="h-4 w-4 mr-2" /> Previsualizar PDF
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push(`/${company}/operaciones/counter`)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={isSubmitting || isOverweight}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? "Guardar Cambios" : "Emitir Manifiesto"}
        </Button>
      </div>

      {isEditing && initialData?.id && (
        <PdfEndpointPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          endpoint={`/${company}/pax-flights/${initialData.id}/pdf`}
          fileName={`MANIFIESTO_PAX_${initialData.flight_code}`}
          title={`Vista Previa — Manifiesto ${initialData.flight_code}`}
          description="Previsualización en tiempo real del documento PDF."
        />
      )}
    </form>
  );
};
