"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  useCreateCargoShipment,
  useUpdateCargoShipment,
} from "@/actions/cargo/actions";
import { useGetClients } from "@/hooks/general/clientes/useGetClients";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { useGetEmployeesByCompany } from "@/hooks/sistema/empleados/useGetEmployees";
import { useGetNextGuide } from "@/hooks/operaciones/cargo/useGetNextGuide";
import { useGetPilots } from "@/hooks/sms/useGetPilots";
import { useGetExternalAircraftSuggestions } from "@/hooks/operaciones/cargo/useGetExternalAircraftSuggestions";
import { useGetCarriers } from "@/hooks/operaciones/cargo/useGetCarriers";

// ─── Esquema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  product_description: z.string().min(1, "La descripción es requerida"),
  units: z.coerce.number().min(1, "Debe ser al menos 1 unidad"),
  weight: z.coerce.number().min(0.01, "El peso debe ser mayor a 0"),
});

export const formSchema = z
  .object({
    registration_date: z.date({ required_error: "La fecha es requerida" }),
    carrier_id: z.coerce.number().min(1, "El transportista es requerido"),
    issuer: z.number().min(1, "El emisor es requerido"),
    pilot_id: z.number().min(1, "Debe elegir un piloto"),
    copilot_id: z.number().min(1, "Debe elegir un copiloto"),
    external_aircraft: z.string().optional().nullable(),
    client_id: z.coerce.number().min(1, "Debe elegir un cliente"),
    aircraft_id: z.coerce.number().optional().nullable(),
    items: z.array(itemSchema).min(1, "Debe agregar al menos un producto"),
  })
  .refine((data) => data.aircraft_id || data.external_aircraft, {
    message: "Debe seleccionar una aeronave registrada o ingresar una externa",
    path: ["aircraft_id"],
  })
  .refine((data) => data.pilot_id !== data.copilot_id, {
    message: "El piloto y copiloto no pueden ser la misma persona",
    path: ["copilot_id"],
  });

export type CargoShipmentFormValues = z.infer<typeof formSchema>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCargoShipmentForm(initialData?: any) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const company = params.company as string;
  const aircraftIdFromUrl = params.aircraft_id;
  const externalNameFromUrl = params.name
    ? decodeURIComponent(params.name as string)
    : null;

  const isEditing = !!initialData;
  const isExternalAircraft = !!(
    params.name ||
    externalNameFromUrl ||
    initialData?.external_aircraft
  );

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: clients, isLoading: loadingClients } = useGetClients(company);
  const { data: carriers, isLoading: loadingCarriers } =
    useGetCarriers(company);
  const { data: aircrafts, isLoading: loadingAircrafts } =
    useGetAircrafts(company);
  const { data: employees, isLoading: loadingEmployees } =
    useGetEmployeesByCompany(company);
  const { data: pilots, isLoading: loadingPilots } = useGetPilots(company);
  const { data: externalSuggestions } =
    useGetExternalAircraftSuggestions(company);

  // ── Mutaciones ──────────────────────────────────────────────────────────────
  const { createCargoShipment } = useCreateCargoShipment(company);
  const { updateCargoShipment } = useUpdateCargoShipment(company);

  // ── Formulario ───────────────────────────────────────────────────────────────────
  const form = useForm<CargoShipmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  // ── Observadores ─────────────────────────────────────────────────────────
  const watchedItems = form.watch("items");
  const registrationDate = form.watch("registration_date");
  const watchedAircraftId = form.watch("aircraft_id");
  const watchedExternalAircraft = form.watch("external_aircraft");

  const { data: guideData, isLoading: loadingGuide } = useGetNextGuide(
    company,
    registrationDate
      ? format(registrationDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    watchedAircraftId ?? null,
    watchedExternalAircraft ?? null,
  );

  // ── use Effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) form.setValue("issuer", Number(user.id));
  }, [user, form]);

  useEffect(() => {
    if (aircraftIdFromUrl && !isEditing)
      form.setValue("aircraft_id", Number(aircraftIdFromUrl));
  }, [aircraftIdFromUrl, isEditing, form]);

  useEffect(() => {
    if (externalNameFromUrl && !isEditing)
      form.setValue("external_aircraft", externalNameFromUrl);
  }, [externalNameFromUrl, isEditing, form]);

  // ── Derivados ────────────────────────────────────────────────────────────────
  const totalUnits = watchedItems?.reduce(
    (acc, curr) => acc + (Number(curr.units) || 0),
    0,
  );
  const totalWeight = watchedItems?.reduce(
    (acc, curr) => acc + (Number(curr.weight) || 0),
    0,
  );

  const guideNumber = isEditing
    ? initialData.guide_number
    : !watchedAircraftId && !watchedExternalAircraft
      ? "Selec. Aeronave"
      : loadingGuide
        ? "..."
        : (guideData?.guide_number ?? "Cargando...");

  // ── Submit ─────────────────────────────────────────────────────────────────
  function buildRedirectPath(data: CargoShipmentFormValues) {
    if (data.aircraft_id)
      return `/${company}/operaciones/cargo/${data.aircraft_id}`;
    if (data.external_aircraft)
      return `/${company}/operaciones/cargo/externa/${encodeURIComponent(data.external_aircraft)}`;
    return `/${company}/operaciones/cargo`;
  }

  const onSubmit = async (values: CargoShipmentFormValues) => {
    const data = {
      ...values,
      registration_date: format(values.registration_date, "yyyy-MM-dd"),
    };
    const path = buildRedirectPath(values);

    if (isEditing) {
      updateCargoShipment.mutate(
        { id: initialData.id, data },
        { onSuccess: () => router.push(path) },
      );
    } else {
      createCargoShipment.mutate(data, {
        onSuccess: () => {
          form.reset();
          router.push(path);
        },
      });
    }
  };

  return {
    // formulario
    form,
    fields,
    append,
    remove,
    onSubmit: form.handleSubmit(onSubmit),
    isPending: createCargoShipment.isPending || updateCargoShipment.isPending,
    isEditing,
    isExternalAircraft,
    // parámetros de url
    company,
    aircraftIdFromUrl,
    externalNameFromUrl,
    // datos
    clients,
    loadingClients,
    carriers,
    loadingCarriers,
    aircrafts,
    loadingAircrafts,
    employees,
    loadingEmployees,
    pilots,
    loadingPilots,
    externalSuggestions,
    guideNumber,
    // totales
    totalUnits,
    totalWeight,
    // funciones auxiliares de calendario
    calendarDisabledDates: buildCalendarDisabledDates(initialData, isEditing),
    user,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultValues(initialData?: any): CargoShipmentFormValues {
  if (!initialData) {
    return {
      registration_date: new Date(),
      carrier_id: 0,
      issuer: 0,
      pilot_id: 0,
      copilot_id: 0,
      client_id: 0,
      aircraft_id: null,
      external_aircraft: null,
      items: [{ product_description: "", units: 0, weight: 0 }],
    };
  }

  return {
    registration_date: new Date(initialData.registration_date + "T00:00:00"),
    carrier_id: initialData.carrier_id,
    issuer: initialData.issuer,
    pilot_id: initialData.pilot_id ? Number(initialData.pilot_id) : 0,
    copilot_id: initialData.copilot_id ? Number(initialData.copilot_id) : 0,
    client_id: initialData.client_id ?? initialData.client?.id ?? null,
    aircraft_id: initialData.aircraft_id ?? initialData.aircraft?.id ?? null,
    external_aircraft: initialData.external_aircraft ?? null,
    items: initialData.items.map((item: any) => ({
      product_description: item.product_description,
      units: item.units,
      weight: Number(item.weight),
    })),
  };
}

function buildCalendarDisabledDates(initialData: any, isEditing: boolean) {
  const ref = isEditing
    ? new Date(initialData.registration_date + "T00:00:00")
    : new Date();
  return [{ before: startOfMonth(ref) }, { after: endOfMonth(ref) }];
}
