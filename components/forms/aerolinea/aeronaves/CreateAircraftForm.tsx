"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateAircraft } from "@/actions/aerolinea/aeronaves/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetAircrafts } from "@/hooks/aerolinea/aeronaves/useGetAircrafts";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { AircraftFormFields } from "./AircraftFormFields";
import {
  AIRCRAFT_FIELD_LABELS,
  buildAircraftSchema,
  toCreatePayload,
  type AircraftFormValues,
} from "./aircraftSchema";

interface Props {
  onClose: () => void;
}

export function CreateAircraftForm({ onClose }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: aircrafts, isSuccess: aircraftsLoaded } = useGetAircrafts(
    selectedCompany?.slug,
    { includeExternal: true },
  );
  const { createAircraft } = useCreateAircraft();

  const schema = useMemo(() => buildAircraftSchema(aircrafts), [aircrafts]);

  const form = useForm<AircraftFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      acronym: "",
      serial: "",
      brand: "",
      model: "",
      owner: "",
      fabricant_date: undefined,
      status: "EN POSESION",
      location_id: "",
      manufacturer_id: "",
      comments: "",
      is_external: false,
      inac: true,
    },
  });

  // Los duplicados se validan contra la flota: si esta llega después de que el
  // usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (!aircraftsLoaded) return;
    const { acronym, serial } = form.formState.dirtyFields;
    if (acronym) form.trigger("acronym");
    if (serial) form.trigger("serial");
  }, [aircraftsLoaded, aircrafts, form]);

  const onSubmit = async (values: AircraftFormValues) => {
    try {
      await createAircraft.mutateAsync({
        company: selectedCompany!.slug,
        data: toCreatePayload(values),
      });
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, AIRCRAFT_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createAircraft.isPending}
        canSave
        submitLabel="Crear aeronave"
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(AIRCRAFT_FIELD_LABELS),
          )(e);
        }}
      >
        <AircraftFormFields
          form={form}
          disabled={createAircraft.isPending}
          // Una externa no está registrada ante el INAC de la empresa.
          onExternalChange={(isExternal) => form.setValue("inac", !isExternal)}
        />
      </ArticleFormShell>
    </Form>
  );
}
