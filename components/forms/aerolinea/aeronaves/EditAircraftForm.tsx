"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateAircraft } from "@/actions/aerolinea/aeronaves/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { parseApiDate } from "@/lib/airline-aircraft";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AirlineAircraft } from "@/types";
import { AircraftFormFields } from "./AircraftFormFields";
import {
  AIRCRAFT_FIELD_LABELS,
  buildAircraftSchema,
  diffAircraft,
  NO_MANUFACTURER,
  type AircraftFormValues,
} from "./aircraftSchema";

interface Props {
  aircraft: AirlineAircraft;
  onClose: () => void;
}

export function EditAircraftForm({ aircraft, onClose }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts } = useGetAircrafts(selectedCompany?.slug, {
    includeExternal: true,
  });
  const { updateAircraft } = useUpdateAircraft();

  const schema = useMemo(
    () => buildAircraftSchema(aircrafts, aircraft.id),
    [aircrafts, aircraft.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<AircraftFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      acronym: aircraft.acronym ?? "",
      serial: aircraft.serial ?? "",
      brand: aircraft.brand ?? "",
      model: aircraft.model ?? "",
      owner: aircraft.owner ?? "",
      fabricant_date: parseApiDate(aircraft.fabricant_date),
      status: aircraft.status,
      location_id: String(aircraft.location_id),
      manufacturer_id: aircraft.manufacturer_id
        ? String(aircraft.manufacturer_id)
        : aircraft.is_external
          ? NO_MANUFACTURER
          : "",
      comments: aircraft.comments ?? "",
      is_external: aircraft.is_external,
      inac: aircraft.inac,
    },
  });

  const onSubmit = async (values: AircraftFormValues) => {
    const changes = diffAircraft(aircraft, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateAircraft.mutateAsync({
        company: selectedCompany!.slug,
        acronym: aircraft.acronym,
        data: changes,
      });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, AIRCRAFT_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateAircraft.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(AIRCRAFT_FIELD_LABELS),
          )(e);
        }}
      >
        <AircraftFormFields form={form} disabled={updateAircraft.isPending} />
      </ArticleFormShell>
    </Form>
  );
}
