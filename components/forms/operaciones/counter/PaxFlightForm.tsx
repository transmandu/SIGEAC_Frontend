"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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
import { fullName } from "@/lib/person-name";
import { useCompanyTimezone } from "@/hooks/general/useCompanyTimezone";
import { instantToCalendarDay } from "@/lib/date";
import { isCaptain, isFirstOfficer } from "@/lib/pilot-rank";
import { serverFieldErrors } from "@/components/forms/mantenimiento/almacen/_components/form-feedback";

interface PaxFlightFormProps {
  company: string;
  initialData?: PaxFlight;
  isEditing?: boolean;
}

interface PaxFlightPrefill {
  flightType?: FlightType;
  passengers?: Omit<PaxPassenger, "id">[];
  source?: string;
}

export const PaxFlightForm = ({
  company,
  initialData,
  isEditing = false,
}: PaxFlightFormProps) => {
  const timeZone = useCompanyTimezone();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Determina si el usuario es personal del counter (ve columnas extra)
  const isCounterStaff = useMemo(() => {
    const roles = user?.roles?.map((r: { name: string }) => r.name) || [];
    return roles.some((r: string) =>
      ["OPERADOR_COUNTER", "DESPACHADOR", "SUPERUSER"].includes(r),
    );
  }, [user]);

  // Prefill one-shot del importador de WhatsApp. Se lee durante el primer
  // render para que el form nazca con los datos y no parpadee en blanco.
  // La lectura es pura (no borra la clave) porque React puede invocar el
  // inicializador dos veces en StrictMode; el borrado va en un effect.
  const [prefill] = useState<PaxFlightPrefill | null>(() => {
    if (isEditing || initialData || typeof window === "undefined") {
      return null;
    }
    const stored = sessionStorage.getItem("sigeac_prefill_pax_flight");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as PaxFlightPrefill;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (prefill) {
      sessionStorage.removeItem("sigeac_prefill_pax_flight");
    }
  }, [prefill]);

  // Form State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [flightDate, setFlightDate] = useState<string>(() => {
    if (initialData?.flight_date_raw) return initialData.flight_date_raw;
    // El día de hoy en la zona de la compañía (toISOString daría el día UTC).
    return instantToCalendarDay(new Date(), timeZone) ?? "";
  });

  const parsedDate = new Date(flightDate + "T12:00:00Z");
  const month = parsedDate.getMonth() + 1;
  const year = parsedDate.getFullYear();

  const [route, setRoute] = useState<string>(initialData?.route || "PZO-CAJ");
  const [flightType, setFlightType] = useState<FlightType>(
    initialData?.flight_type || prefill?.flightType || "PAX",
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

  const hasCargoType = flightType === "CARGO_ONLY" || flightType === "HYBRID";
  const hasLinkedCargo = hasCargoType && !!cargoManifestId;

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
      if (prefill?.passengers && prefill.passengers.length > 0) {
        return prefill.passengers;
      }
      return [];
    },
  );

  const [importedNotice, setImportedNotice] = useState<string | null>(
    prefill?.source ?? null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCargoPreviewOpen, setIsCargoPreviewOpen] = useState(false);

  // Queries externas
  const { data: aircrafts } = useGetAircrafts(company);
  const { data: externalAircrafts } =
    useGetExternalAircraftSuggestions(company);
  const { data: pilots } = useGetPilots(company);
  const { data: externalPilots } = useGetExternalPilots(company);

  // Mismo criterio que el formulario de carga: el capitan solo ve capitanes y
  // el primer oficial ve primer oficiales + capitanes, salvo el ya elegido.
  const selectedCaptainId =
    captainType === "internal" ? captainId : externalCaptainId;
  const selectedFirstOfficerId =
    firstOfficerType === "internal" ? firstOfficerId : externalFirstOfficerId;

  // El seleccionado siempre debe seguir en la lista: Radix toma el texto del
  // trigger del item seleccionado y, si lo filtramos, el input queda vacio.
  const captainOptions = (pilots ?? []).filter((p: any) => isCaptain(p));
  const externalCaptainOptions = (externalPilots ?? []).filter((p: any) =>
    isCaptain(p),
  );
  const firstOfficerOptions = (pilots ?? []).filter(
    (p: any) =>
      (isFirstOfficer(p) || isCaptain(p)) &&
      (p.id !== selectedCaptainId || p.id === selectedFirstOfficerId) &&
      (p.id !== 6 || p.id === selectedFirstOfficerId),
  );
  const externalFirstOfficerOptions = (externalPilots ?? []).filter(
    (p: any) =>
      (isFirstOfficer(p) || isCaptain(p)) &&
      (p.id !== selectedCaptainId || p.id === selectedFirstOfficerId),
  );

  const handleCaptainChange = (
    type: "internal" | "external",
    id: number | null,
  ) => {
    if (type === "internal") {
      setCaptainId(id);
      if (firstOfficerType === "internal" && firstOfficerId === id) {
        setFirstOfficerId(null);
      }
    } else {
      setExternalCaptainId(id);
      if (firstOfficerType === "external" && externalFirstOfficerId === id) {
        setExternalFirstOfficerId(null);
      }
    }
  };

  const { data: nextCode } = useNextFlightCode(company, month, year);
  const { data: availableManifests } = useAvailableCargoManifests(
    company,
    month,
    year,
    hasLinkedCargo ? null : aircraftId,
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

  // El manifiesto actual ya se muestra como opción "(Actual)", así que se
  // excluye del listado para no repetir el mismo valor en el Select.
  const selectableManifests = useMemo(
    () =>
      (availableManifests ?? []).filter(
        (m: AvailableCargoManifestSummary) =>
          m.id !== initialData?.cargo_manifest_id,
      ),
    [availableManifests, initialData?.cargo_manifest_id],
  );

  const cargoFlightData:
    | (Partial<AvailableCargoManifestSummary> & {
        cargo_manifest_number?: string | null;
      })
    | null = hasLinkedCargo
    ? (selectedCargoManifest ?? initialData ?? null)
    : null;

  const linkedAircraftType: "internal" | "external" | null = cargoFlightData
    ? cargoFlightData.external_aircraft
      ? "external"
      : cargoFlightData.aircraft_id
        ? "internal"
        : null
    : null;
  const linkedCaptainType: "internal" | "external" | null = cargoFlightData
    ? cargoFlightData.external_captain_id
      ? "external"
      : cargoFlightData.captain_id
        ? "internal"
        : null
    : null;
  const linkedFirstOfficerType: "internal" | "external" | null = cargoFlightData
    ? cargoFlightData.external_first_officer_id
      ? "external"
      : cargoFlightData.first_officer_id
        ? "internal"
        : null
    : null;

  const linkedAircraftId = cargoFlightData?.aircraft_id
    ? Number(cargoFlightData.aircraft_id)
    : null;
  const linkedExternalAircraft = cargoFlightData?.external_aircraft ?? "";
  const linkedCaptainId = cargoFlightData?.captain_id
    ? Number(cargoFlightData.captain_id)
    : null;
  const linkedExternalCaptainId = cargoFlightData?.external_captain_id
    ? Number(cargoFlightData.external_captain_id)
    : null;
  const linkedFirstOfficerId = cargoFlightData?.first_officer_id
    ? Number(cargoFlightData.first_officer_id)
    : null;
  const linkedExternalFirstOfficerId =
    cargoFlightData?.external_first_officer_id
      ? Number(cargoFlightData.external_first_officer_id)
      : null;

  // Al elegir un manifiesto también se actualiza el estado de los campos, para
  // que si el usuario vuelve a PAX los selects conserven esos mismos valores.
  const handleCargoManifestChange = (id: number | null) => {
    setCargoManifestId(id);
    const manifest =
      (availableManifests as AvailableCargoManifestSummary[] | undefined)?.find(
        (m) => m.id === id,
      ) ?? (id === initialData?.cargo_manifest_id ? initialData : null);
    if (!manifest) return;

    if (manifest.external_aircraft) {
      setAircraftType("external");
      setAircraftId(null);
      setExternalAircraft(manifest.external_aircraft);
    } else if (manifest.aircraft_id) {
      setAircraftType("internal");
      setAircraftId(Number(manifest.aircraft_id));
      setExternalAircraft("");
    }

    if (manifest.external_captain_id) {
      setCaptainType("external");
      setCaptainId(null);
      setExternalCaptainId(Number(manifest.external_captain_id));
    } else if (manifest.captain_id) {
      setCaptainType("internal");
      setCaptainId(Number(manifest.captain_id));
      setExternalCaptainId(null);
    }

    if (manifest.external_first_officer_id) {
      setFirstOfficerType("external");
      setFirstOfficerId(null);
      setExternalFirstOfficerId(Number(manifest.external_first_officer_id));
    } else if (manifest.first_officer_id) {
      setFirstOfficerType("internal");
      setFirstOfficerId(Number(manifest.first_officer_id));
      setExternalFirstOfficerId(null);
    } else {
      setFirstOfficerId(null);
      setExternalFirstOfficerId(null);
    }
  };

  const displayAircraftType = linkedAircraftType ?? aircraftType;
  const displayAircraftId = cargoFlightData ? linkedAircraftId : aircraftId;
  const displayExternalAircraft = cargoFlightData
    ? linkedExternalAircraft
    : externalAircraft;
  const displayCaptainType = linkedCaptainType ?? captainType;
  const displayCaptainId = cargoFlightData ? linkedCaptainId : captainId;
  const displayExternalCaptainId = cargoFlightData
    ? linkedExternalCaptainId
    : externalCaptainId;
  const displayFirstOfficerType = linkedFirstOfficerType ?? firstOfficerType;
  const displayFirstOfficerId = cargoFlightData
    ? linkedFirstOfficerId
    : firstOfficerId;
  const displayExternalFirstOfficerId = cargoFlightData
    ? linkedExternalFirstOfficerId
    : externalFirstOfficerId;

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
    setFieldErrors({});

    if (!route.trim()) {
      toast.error("Por favor ingrese la ruta del vuelo.");
      return;
    }

    if (!hasLinkedCargo) {
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
    }

    if (hasCargoType && !cargoManifestId) {
      toast.error(
        "Para vuelos Solo Carga o Híbridos debe vincular un Manifiesto de Carga.",
      );
      return;
    }

    if (
      hasLinkedCargo &&
      (!cargoFlightData?.captain_label ||
        cargoFlightData.captain_label === "N/A")
    ) {
      toast.error(
        "El manifiesto vinculado no tiene capitán registrado en sus guías.",
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

    const basePayload = {
      flight_date: flightDate,
      route: route.trim().toUpperCase(),
      flight_type: flightType,
      cargo_manifest_id: hasCargoType ? cargoManifestId : null,
      manifest_updated_at: hasCargoType
        ? (selectedCargoManifest?.updated_at ?? null)
        : null,
      passengers: flightType === "CARGO_ONLY" ? [] : passengers,
    };

    const payload = hasLinkedCargo
      ? basePayload
      : {
          ...basePayload,
          aircraft_id: aircraftType === "internal" ? aircraftId : null,
          external_aircraft:
            aircraftType === "external"
              ? externalAircraft.trim().toUpperCase()
              : null,
          captain_id: captainType === "internal" ? captainId : null,
          external_captain_id:
            captainType === "external" ? externalCaptainId : null,
          first_officer_id:
            firstOfficerType === "internal" ? firstOfficerId : null,
          external_first_officer_id:
            firstOfficerType === "external" ? externalFirstOfficerId : null,
        };

    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push(`/${company}/operaciones/counter`);
    } catch (error) {
      const response = (
        error as {
          response?: { status?: number; data?: { message?: string } };
        }
      )?.response;

      if (response?.status === 409) {
        // El manifiesto cambió o ya está tomado: recargar la lista sin sacar
        // al usuario del formulario, para que elija otro o refresque.
        await queryClient.invalidateQueries({
          queryKey: ["available-cargo-manifests", company],
        });
        toast.error(
          response.data?.message ??
            "El manifiesto de carga cambió. Actualizá la lista e intentá de nuevo.",
        );
        return;
      }

      const errors = serverFieldErrors(error);
      if (errors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(errors).map(([field, messages]) => [
              field,
              messages[0] ?? "",
            ]),
          ),
        );
      }
      // El toast ya lo mostró notifyError en la acción.
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
            {fieldErrors.route && (
              <p className="text-xs text-destructive">{fieldErrors.route}</p>
            )}
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
              {!cargoFlightData && (
                <button
                  type="button"
                  onClick={() =>
                    setAircraftType(
                      displayAircraftType === "internal"
                        ? "external"
                        : "internal",
                    )
                  }
                  className="text-xs text-primary hover:underline"
                >
                  {displayAircraftType === "internal"
                    ? "Cambiar a Externa"
                    : "Cambiar a Flota"}
                </button>
              )}
            </div>
            {displayAircraftType === "internal" ? (
              <Select
                disabled={!!cargoFlightData}
                value={displayAircraftId ? String(displayAircraftId) : ""}
                onValueChange={(val) => {
                  if (val.startsWith("ext:")) {
                    // Seleccionó una aeronave externa → cambia modo y precarga la matrícula
                    setAircraftType("external");
                    setAircraftId(null);
                    setExternalAircraft(val.slice(4));
                  } else {
                    setAircraftId(Number(val));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione aeronave" />
                </SelectTrigger>
                <SelectContent>
                  {aircrafts && aircrafts.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Flota Propia</SelectLabel>
                      {aircrafts.map((a: any) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.acronym} {a.model ? `- ${a.model}` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {externalAircrafts && externalAircrafts.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Aeronaves Externas</SelectLabel>
                      {externalAircrafts.map((ea: any) => (
                        <SelectItem
                          key={`ext-${ea.acronym}`}
                          value={`ext:${ea.acronym}`}
                        >
                          {ea.acronym} {ea.model ? `- ${ea.model}` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {cargoFlightData &&
                    displayAircraftId &&
                    !(aircrafts ?? []).some(
                      (a: any) => Number(a.id) === displayAircraftId,
                    ) && (
                      <SelectItem value={String(displayAircraftId)}>
                        {cargoFlightData.aircraft_label ??
                          `Aeronave #${displayAircraftId}`}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Matrícula externa (Ej. YV-3450)"
                value={displayExternalAircraft}
                onChange={(e) =>
                  setExternalAircraft(e.target.value.toUpperCase())
                }
                disabled={!!cargoFlightData}
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
              {!cargoFlightData && (
                <button
                  type="button"
                  onClick={() =>
                    setCaptainType(
                      displayCaptainType === "internal"
                        ? "external"
                        : "internal",
                    )
                  }
                  className="text-xs text-primary hover:underline"
                >
                  {displayCaptainType === "internal"
                    ? "Piloto Externo"
                    : "Piloto Interno"}
                </button>
              )}
            </div>
            {displayCaptainType === "internal" ? (
              <Select
                disabled={!!cargoFlightData}
                value={displayCaptainId ? String(displayCaptainId) : ""}
                onValueChange={(val) =>
                  handleCaptainChange("internal", Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione capitán" />
                </SelectTrigger>
                <SelectContent>
                  {captainOptions.map((p: any) => (
                    <SelectItem
                      key={p.id}
                      value={String(p.id)}
                      endAdornment={<Badge variant="outline">Capitán</Badge>}
                    >
                      {p.employee
                        ? `${fullName(p.employee)} (${p.employee_dni})`
                        : p.employee_dni}
                    </SelectItem>
                  ))}
                  {cargoFlightData &&
                    displayCaptainId &&
                    !captainOptions.some(
                      (p: any) => Number(p.id) === displayCaptainId,
                    ) && (
                      <SelectItem value={String(displayCaptainId)}>
                        {cargoFlightData.captain_label ??
                          `Piloto #${displayCaptainId}`}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            ) : (
              <Select
                disabled={!!cargoFlightData}
                value={
                  displayExternalCaptainId
                    ? String(displayExternalCaptainId)
                    : ""
                }
                onValueChange={(val) =>
                  handleCaptainChange("external", Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione capitán externo" />
                </SelectTrigger>
                <SelectContent>
                  {externalCaptainOptions.map((ep: any) => (
                    <SelectItem
                      key={ep.id}
                      value={String(ep.id)}
                      endAdornment={<Badge variant="outline">Capitán</Badge>}
                    >
                      {fullName(ep)} ({ep.dni})
                    </SelectItem>
                  ))}
                  {cargoFlightData &&
                    displayExternalCaptainId &&
                    !externalCaptainOptions.some(
                      (ep: any) => Number(ep.id) === displayExternalCaptainId,
                    ) && (
                      <SelectItem value={String(displayExternalCaptainId)}>
                        {cargoFlightData.captain_label ??
                          `Piloto externo #${displayExternalCaptainId}`}
                      </SelectItem>
                    )}
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
              {!cargoFlightData && (
                <button
                  type="button"
                  onClick={() =>
                    setFirstOfficerType(
                      displayFirstOfficerType === "internal"
                        ? "external"
                        : "internal",
                    )
                  }
                  className="text-xs text-primary hover:underline"
                >
                  {displayFirstOfficerType === "internal"
                    ? "Piloto Externo"
                    : "Piloto Interno"}
                </button>
              )}
            </div>
            {displayFirstOfficerType === "internal" ? (
              <Select
                disabled={!!cargoFlightData}
                value={
                  displayFirstOfficerId ? String(displayFirstOfficerId) : "none"
                }
                onValueChange={(val) =>
                  setFirstOfficerId(val === "none" ? null : Number(val))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin primer oficial</SelectItem>
                  {firstOfficerOptions.map((p: any) => (
                    <SelectItem
                      key={p.id}
                      value={String(p.id)}
                      endAdornment={
                        <Badge variant="outline">
                          {isCaptain(p) ? "Capitán" : "Primer oficial"}
                        </Badge>
                      }
                    >
                      {p.employee
                        ? `${fullName(p.employee)} (${p.employee_dni})`
                        : p.employee_dni}
                    </SelectItem>
                  ))}
                  {cargoFlightData &&
                    displayFirstOfficerId &&
                    !firstOfficerOptions.some(
                      (p: any) => Number(p.id) === displayFirstOfficerId,
                    ) && (
                      <SelectItem value={String(displayFirstOfficerId)}>
                        {cargoFlightData.first_officer_label ??
                          `Piloto #${displayFirstOfficerId}`}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            ) : (
              <Select
                disabled={!!cargoFlightData}
                value={
                  displayExternalFirstOfficerId
                    ? String(displayExternalFirstOfficerId)
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
                  {externalFirstOfficerOptions.map((ep: any) => (
                    <SelectItem
                      key={ep.id}
                      value={String(ep.id)}
                      endAdornment={
                        <Badge variant="outline">
                          {isCaptain(ep) ? "Capitán" : "Primer oficial"}
                        </Badge>
                      }
                    >
                      {fullName(ep)} ({ep.dni})
                    </SelectItem>
                  ))}
                  {cargoFlightData &&
                    displayExternalFirstOfficerId &&
                    !externalFirstOfficerOptions.some(
                      (ep: any) =>
                        Number(ep.id) === displayExternalFirstOfficerId,
                    ) && (
                      <SelectItem value={String(displayExternalFirstOfficerId)}>
                        {cargoFlightData.first_officer_label ??
                          `Piloto externo #${displayExternalFirstOfficerId}`}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            )}
          </div>

          {cargoFlightData && (
            <div className="md:col-span-3 flex flex-col gap-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Datos cargados desde la información del manifiesto de carga
                vinculado
                {cargoFlightData.manifest_number
                  ? ` N° ${cargoFlightData.manifest_number}`
                  : cargoFlightData.cargo_manifest_number
                    ? ` N° ${cargoFlightData.cargo_manifest_number}`
                    : ""}
                . Para modificarlos, editá la guía de carga.
              </p>
              {cargoFlightData.crew_conflict && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Las guías no coinciden en tripulación; se usa la primera.
                </p>
              )}
            </div>
          )}
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
            <div className="w-full max-w-xl flex flex-col gap-2">
              <Label htmlFor="cargo_manifest">Manifiesto de Carga *</Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select
                  value={cargoManifestId ? String(cargoManifestId) : ""}
                  onValueChange={(val) =>
                    handleCargoManifestChange(Number(val))
                  }
                >
                  <SelectTrigger id="cargo_manifest" className="flex-1">
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
                    {selectableManifests.length > 0 ? (
                      <SelectGroup>
                        <SelectLabel>Disponibles para este mes</SelectLabel>
                        {selectableManifests.map((m: any) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.manifest_number} — Total: {m.total_weight} kg
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

                <Button
                  type="button"
                  variant="outline"
                  disabled={!cargoManifestId}
                  onClick={() => setIsCargoPreviewOpen(true)}
                  title={
                    cargoManifestId
                      ? "Ver documento PDF del manifiesto de carga"
                      : "Seleccione un manifiesto para previsualizarlo"
                  }
                  className="shrink-0 flex items-center justify-center gap-1.5 border-amber-300 hover:bg-amber-100/60 dark:border-amber-800 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                >
                  <Eye className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  <span>Ver Manifiesto</span>
                </Button>
              </div>
              {(fieldErrors.cargo_manifest_id ||
                fieldErrors.manifest_updated_at) && (
                <p className="text-xs text-destructive">
                  {fieldErrors.cargo_manifest_id ??
                    fieldErrors.manifest_updated_at}
                </p>
              )}
            </div>

            {/* Vista previa y cotejo del Manifiesto de Carga seleccionado contra hoja física */}
            {manifestDetails && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3 mt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                    <span className="font-semibold text-sm text-foreground">
                      Detalles del Manifiesto: N° {manifestDetails.number}
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
              isCounterStaff={isCounterStaff}
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

      {cargoManifestId && (
        <PdfEndpointPreviewDialog
          open={isCargoPreviewOpen}
          onOpenChange={setIsCargoPreviewOpen}
          endpoint={`/${company}/cargo-manifests/${cargoManifestId}/pdf`}
          fileName={`MANIFIESTO_CARGA_${manifestDetails?.number || cargoManifestId}`}
          title={`Vista Previa — Manifiesto de Carga N° ${manifestDetails?.number || cargoManifestId}`}
          description="Documento oficial del manifiesto de carga seleccionado para este vuelo."
        />
      )}
    </form>
  );
};
