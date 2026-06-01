"use client";

import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import {
  useGetExternalAircraftSuggestions,
  type ExternalAircraftSuggestion,
} from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CreateCarrierForm } from "@/components/forms/operaciones/cargo/CreateCarrierForm";
import { CreateClientForm } from "@/components/forms/general/CreateClientForm";
import { ComboboxField } from "@/components/ui/ComboboxField";
import { ItemsTable } from "./ItemsTable";
import { useCargoShipmentForm } from "@/hooks/operaciones/cargo/useCargoShipmentForm";
import { useState } from "react";
import { useGetExternalPilots } from "@/hooks/operaciones/cargo/useGetExternalPilots";
import type { ComboboxOption } from "@/components/ui/ComboboxField";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateCargoShipmentFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateCargoShipmentForm({
  onSuccess,
  initialData,
}: CreateCargoShipmentFormProps) {
  const {
    form,
    onSubmit,
    isPending,
    isEditing,
    aircraftIdFromUrl,
    clients,
    loadingClients,
    carriers,
    loadingCarriers,
    aircrafts,
    loadingAircrafts,
    pilots,
    loadingPilots,
    guideNumber,
    totalUnits,
    totalWeight,
    calendarDisabledDates,
    user,
    company,
  } = useCargoShipmentForm(initialData);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [openNewCarrier, setOpenNewCarrier] = useState(false);
  const [openNewClient, setOpenNewClient] = useState(false);
  const { data: externalPilots, isLoading: loadingExternalPilots } =
    useGetExternalPilots(company);

  const searchParams = useSearchParams();
  const isExternalMode =
    searchParams.get("external") === "true" && !aircraftIdFromUrl;

  const { data: externalSuggestions, isLoading: loadingExternalSuggestions } =
    useGetExternalAircraftSuggestions(company);

  // ── Constructores de opciones ────────────────────────────────────────────────────────
  // Opciones solo de aeronaves de la empresa
  const internalAircraftOptions: ComboboxOption[] = (aircrafts ?? []).map(
    (a: any) => ({
      value: a.id,
      label: a.model
        ? `${a.model} - ${a.acronym}`
        : (a.acronym ?? a.serial ?? `Aeronave ${a.id}`),
    })
  );

  // Opciones solo de aeronaves externas
  const externalAircraftOptions: ComboboxOption[] = (
    externalSuggestions ?? []
  ).map((a: ExternalAircraftSuggestion) => ({
    value: a.id as number,
    label: a.model ? `${a.model} - ${a.acronym}` : a.acronym,
  }));

  // Opciones combinadas (usado para resolver la etiqueta si viene bloqueado por URL)
  const allAircraftOptions: ComboboxOption[] = [
    ...internalAircraftOptions,
    ...(externalSuggestions ?? []).map((a: ExternalAircraftSuggestion) => ({
      value: a.id as number,
      label: a.model
        ? `${a.model} - ${a.acronym} (Externa)`
        : `${a.acronym} (Externa)`,
    })),
  ];

  const carrierOptions = (carriers ?? []).map((c: any) => ({
    value: c.id,
    label: `${c.name} ${c.last_name}`,
  }));

  const clientOptions = (clients ?? []).map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  // IDs raw seleccionados para evitar duplicados entre piloto/copiloto
  const selectedCopilotRawId = (() => {
    const v = form.watch("copilot_id");
    if (!v) return null;
    return parseInt(v.split(":")[1]);
  })();
  const selectedPilotRawId = (() => {
    const v = form.watch("pilot_id");
    if (!v) return null;
    return parseInt(v.split(":")[1]);
  })();
  const pilotOptions: ComboboxOption[] = [
    ...(pilots ?? [])
      .filter((p: any) => p.rank === "CAPITAN" && p.id !== selectedCopilotRawId)
      .map((p: any) => ({
        value: `int:${p.id}`,
        label: `${p.employee?.first_name} ${p.employee?.last_name}`,
        badge: p.rank,
        group: "Pilotos internos",
      })),
    ...(externalPilots ?? [])
      .filter(
        (p: any) =>
          (p.rank === "Capitán" || p.rank === "CAPITAN") &&
          p.id !== selectedCopilotRawId,
      )
      .map((p: any) => ({
        value: `ext:${p.id}`,
        label: `${p.first_name} ${p.last_name}`,
        badge: p.rank,
        group: "Pilotos externos",
      })),
  ];

  const copilotOptions: ComboboxOption[] = [
    ...(pilots ?? [])
      .filter(
        (p: any) =>
          p.rank === "PRIMER_OFICIAL" &&
          p.id !== selectedPilotRawId &&
          p.id !== 6,
      )
      .map((p: any) => ({
        value: `int:${p.id}`,
        label: `${p.employee?.first_name} ${p.employee?.last_name}`,
        badge: p.rank,
        group: "Copilotos internos",
      })),
    ...(externalPilots ?? [])
      .filter(
        (p: any) =>
          (p.rank === "Primer Oficial" || p.rank === "PRIMER_OFICIAL") &&
          p.id !== selectedPilotRawId,
      )
      .map((p: any) => ({
        value: `ext:${p.id}`,
        label: `${p.first_name} ${p.last_name}`,
        badge: p.rank,
        group: "Copilotos externos",
      })),
  ];

  // ── Sugerencias de aeronaves externas ──────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.target as HTMLElement).tagName === "INPUT"
            )
              e.preventDefault();
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 border border-border p-4 rounded-xl shadow-sm bg-card">
            {/* Aeronave */}
            <div className="flex flex-col space-y-2">
              <ComboboxField
                form={form}
                name="aircraft_id"
                label={isExternalMode ? "Aeronave Externa" : "Aeronave"}
                placeholder={
                  isExternalMode
                    ? "Seleccionar aeronave externa..."
                    : "Seleccionar aeronave..."
                }
                searchPlaceholder="Buscar aeronave..."
                emptyText="No se encontró la aeronave."
                options={
                  isExternalMode
                    ? [
                        { value: "", label: "Ninguna" },
                        ...externalAircraftOptions,
                      ]
                    : aircraftIdFromUrl
                      ? [{ value: "", label: "Ninguna" }, ...allAircraftOptions]
                      : [{ value: "", label: "Ninguna" }, ...internalAircraftOptions]
                }
                disabled={
                  isExternalMode
                    ? loadingExternalSuggestions
                    : loadingAircrafts || isEditing || !!aircraftIdFromUrl
                }
              />
            </div>

            {/* Fecha */}
            <FormField
              control={form.control}
              name="registration_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Fecha
                  </FormLabel>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal h-9",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value && isValid(new Date(field.value))
                            ? format(new Date(field.value), "PP", {
                                locale: es,
                              })
                            : "Seleccione fecha"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenCalendar(false);
                        }}
                        disabled={calendarDisabledDates}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transportista */}
            <ComboboxField
              form={form}
              name="carrier_id"
              label="Transportista"
              placeholder="Seleccionar transportista..."
              searchPlaceholder="Buscar transportista..."
              emptyText="No se encontraron transportistas."
              options={carrierOptions}
              disabled={loadingCarriers}
              onCreateNew={() => setOpenNewCarrier(true)}
              createNewLabel="Registrar nuevo transportista"
            />

            {/* Piloto */}
            <ComboboxField
              form={form}
              name="pilot_id"
              label="Piloto"
              placeholder="Seleccionar piloto..."
              searchPlaceholder="Buscar piloto..."
              emptyText="No se encontraron pilotos."
              options={pilotOptions}
              disabled={loadingPilots || loadingExternalPilots}
            />

            {/* Nro de guía */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nº Guía
              </label>
              <Input
                className="h-9 bg-muted/50 font-bold tracking-widest text-primary"
                readOnly
                value={guideNumber}
              />
            </div>

            {/* Cliente */}
            <ComboboxField
              form={form}
              name="client_id"
              label="Cliente"
              placeholder="Seleccionar cliente..."
              searchPlaceholder="Buscar cliente..."
              emptyText="No se encontró cliente."
              options={clientOptions}
              disabled={loadingClients}
              onCreateNew={() => setOpenNewClient(true)}
              createNewLabel="Registrar nuevo cliente"
            />

            {/* Emisor */}
            <FormField
              control={form.control}
              name="issuer"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Emisor
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-9 bg-muted/50 cursor-not-allowed uppercase"
                      readOnly
                      value={user ? `${user.first_name} ${user.last_name}` : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Copiloto */}
            <ComboboxField
              form={form}
              name="copilot_id"
              label="Copiloto"
              placeholder="Seleccionar copiloto..."
              searchPlaceholder="Buscar copiloto..."
              emptyText="No se encontraron pilotos."
              options={copilotOptions}
              disabled={loadingPilots || loadingExternalPilots}
            />
          </div>

          {/* ═══ TABLA DE PRODUCTOS ═══════════════════════════════════════════════ */}
          <ItemsTable
            form={form}
            totalUnits={totalUnits}
            totalWeight={totalWeight}
          />

          {/* ═══ SUBMIT ══════════════════════════════════════════════════════ */}
          <Button
            disabled={isPending}
            type="submit"
            className="w-full text-sm font-semibold h-11"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Actualizar Carga" : "Registrar Carga"}
          </Button>
        </form>
      </Form>

      {/* ═══ MODALES ══════════════════════════════════════════════════════════ */}
      <Dialog open={openNewCarrier} onOpenChange={setOpenNewCarrier}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Registrar Transportista</DialogTitle>
            <DialogDescription>
              Cree un nuevo transportista para asignarlo a esta guía de carga.
            </DialogDescription>
          </DialogHeader>
          <CreateCarrierForm
            onClose={() => setOpenNewCarrier(false)}
            onCreated={(newCarrier) =>
              form.setValue("carrier_id", newCarrier.id)
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openNewClient} onOpenChange={setOpenNewClient}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Registrar Cliente</DialogTitle>
            <DialogDescription>
              Cree un nuevo cliente para asignarlo a esta guía de carga.
            </DialogDescription>
          </DialogHeader>
          <CreateClientForm
            onClose={() => setOpenNewClient(false)}
            onCreated={(newClient) => form.setValue("client_id", newClient.id)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
