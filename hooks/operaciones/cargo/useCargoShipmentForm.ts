"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    pilot_id: z.string().min(1, "Debe elegir un piloto"),
    copilot_id: z.string().min(1, "Debe elegir un copiloto"),
    external_pilot_id: z.number().optional().nullable(),
    external_copilot_id: z.number().optional().nullable(),
    client_id: z.coerce.number().min(1, "Debe elegir un cliente"),
    aircraft_id: z.coerce.number().min(1, "Debe seleccionar una aeronave"),
    items: z.array(itemSchema).min(1, "Debe agregar al menos un producto"),
  })
  .refine((data) => data.pilot_id || data.external_pilot_id, {
    message: "Debe asignar un piloto interno o externo",
    path: ["pilot_id"],
  })
  .refine((data) => data.copilot_id || data.external_copilot_id, {
    message: "Debe asignar un copiloto interno o externo",
    path: ["copilot_id"],
  });

export type CargoShipmentFormValues = z.infer<typeof formSchema>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCargoShipmentForm(
  initialData?: any,
) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const company = params.company as string;
  const aircraftIdFromUrl = params.aircraft_id;
  const externalNameFromUrl = params.name
  ? decodeURIComponent(params.name as string)
  : null;

  const isEditing = !!initialData;

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: clients, isLoading: loadingClients } = useGetClients(company);
  const { data: carriers, isLoading: loadingCarriers } =
    useGetCarriers(company);
  const { data: aircrafts, isLoading: loadingAircrafts } =
    useGetAircrafts(company);
  const { data: employees, isLoading: loadingEmployees } =
    useGetEmployeesByCompany(company);
  const { data: pilots, isLoading: loadingPilots } = useGetPilots(company);

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

  const { data: guideData, isLoading: loadingGuide } = useGetNextGuide(
    company,
    (() => {
      if (!registrationDate) return format(new Date(), "yyyy-MM-dd");
      const d =
        registrationDate instanceof Date
          ? registrationDate
          : parseISO(registrationDate);
      return isValid(d)
        ? format(d, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
    })(),
    watchedAircraftId ?? null,
    null,
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
    if(externalNameFromUrl && !isEditing && aircrafts) {
      const match = (aircrafts as any[]).find(
        (a) => a.acronym === externalNameFromUrl,
      );
      if(match){
        form.setValue("aircraft_id", match.id);
      }
    }
  }, [externalNameFromUrl, isEditing, form, aircrafts]);

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
    : !watchedAircraftId
      ? "Selec. Aeronave"
      : loadingGuide
        ? "..."
        : (guideData?.guide_number ?? "Cargando...");

  // ── Submit ─────────────────────────────────────────────────────────────────
  function buildRedirectPath(data: CargoShipmentFormValues) {
    if (data.aircraft_id)
      return `/${company}/operaciones/cargo/${data.aircraft_id}`;
    return `/${company}/operaciones/cargo`;
  }

  const onSubmit = async (values: CargoShipmentFormValues) => {
    // Detectar y agrupar productos duplicados
    const itemMap = new Map<string, { product_description: string; units: number; weight: number }>();
    let hasDuplicates = false;

    values.items.forEach((item) => {
      const key = item.product_description.trim().toUpperCase();
      if (itemMap.has(key)) {
        hasDuplicates = true;
        const existing = itemMap.get(key)!;
        existing.units += Number(item.units);
        existing.weight += Number(item.weight);
      } else {
        itemMap.set(key, {
          product_description: item.product_description,
          units: Number(item.units),
          weight: Number(item.weight),
        });
      }
    });

    const finalItems = Array.from(itemMap.values());

    if (hasDuplicates) {
      toast.info("Productos duplicados agrupados", {
        description: "Se detectaron productos repetidos y se han agrupado automáticamente sumando sus unidades y pesos.",
      });
      // Actualizar el formulario para que el usuario vea los cambios
      form.setValue("items", finalItems);
    }

    const parsePilot = (key: string) => {
      const [type, id] = key.split(":");
      return { type, id: parseInt(id) };
    };

    const p = parsePilot(values.pilot_id);
    const cp = parsePilot(values.copilot_id);

    const payload = {
      ...values,
      items: finalItems,
      registration_date: format(values.registration_date, "yyyy-MM-dd"),
      pilot_id: p.type === "int" ? p.id : null,
      copilot_id: cp.type === "int" ? cp.id : null,
      external_pilot_id: p.type === "ext" ? p.id : null,
      external_copilot_id: cp.type === "ext" ? cp.id : null,
    } as any;

    const path = buildRedirectPath(values);

    if (isEditing) {
      updateCargoShipment.mutate(
        { id: initialData.id, data: payload },
        { onSuccess: () => router.push(path) },
      );
    } else {
      createCargoShipment.mutate(payload, {
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
    // parámetros de url
    company,
    aircraftIdFromUrl,
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
  const safeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? new Date() : d;
  };

  if (!initialData) {
    return {
      registration_date: new Date(),
      carrier_id: 0,
      issuer: 0,
      pilot_id: "",
      copilot_id: "",
      client_id: 0,
      aircraft_id: 0,
      items: [{ product_description: "", units: 0, weight: 0 }],
    };
  }

  return {
    registration_date: safeDate(initialData.registration_date),
    carrier_id: initialData.carrier_id,
    issuer: initialData.issuer,
    pilot_id: initialData.pilot_id
      ? `int:${initialData.pilot_id}`
      : initialData.external_pilot_id
        ? `ext:${initialData.external_pilot_id}`
        : "",
    copilot_id: initialData.copilot_id
      ? `int:${initialData.copilot_id}`
      : initialData.external_copilot_id
        ? `ext:${initialData.external_copilot_id}`
        : "",
    client_id: initialData.client_id ?? initialData.client?.id ?? null,
    aircraft_id: initialData.aircraft_id ?? initialData.aircraft?.id ?? undefined,
    items: initialData.items.map((item: any) => ({
      product_description: item.product_description,
      units: item.units,
      weight: Number(item.weight),
    })),
  };
}

function buildCalendarDisabledDates(initialData: any, isEditing: boolean) {
  const safeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const ref = isEditing ? safeDate(initialData?.registration_date) : new Date();
  return [{ before: startOfMonth(ref) }, { after: endOfMonth(ref) }];
}
