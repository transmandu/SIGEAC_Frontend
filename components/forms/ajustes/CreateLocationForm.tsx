"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateLocation } from "@/actions/ajustes/ubicaciones/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetLocationsByCompany } from "@/hooks/sistema/useGetLocationsByCompany";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import { LocationFormFields } from "./LocationFormFields";
import {
  buildLocationSchema,
  findMainBase,
  LOCATION_FIELD_LABELS,
  toCreatePayload,
  type LocationFormValues,
} from "./locationSchema";

export default function CreateLocationForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: locations, isSuccess: locationsLoaded } =
    useGetLocationsByCompany(selectedCompany?.slug);
  const { createLocation } = useCreateLocation();

  const schema = useMemo(() => buildLocationSchema(locations), [locations]);

  const mainBase = useMemo(() => findMainBase(locations), [locations]);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: "",
      name: "",
      cod_iata: "",
      isMainBase: false,
    },
  });

  // La pareja código + tipo se valida contra la lista de sedes: si esta llega
  // después de que el usuario ya escribió, hay que volver a validar.
  useEffect(() => {
    if (!locationsLoaded) return;
    if (form.formState.dirtyFields.cod_iata) form.trigger("cod_iata");
  }, [locationsLoaded, locations, form]);

  const onSubmit = async (values: LocationFormValues) => {
    try {
      await createLocation.mutateAsync(toCreatePayload(values));
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, LOCATION_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createLocation.isPending}
        canSave
        submitLabel="Crear sede"
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(LOCATION_FIELD_LABELS),
          )(e);
        }}
      >
        <LocationFormFields
          control={form.control}
          disabled={createLocation.isPending}
          mainBase={mainBase}
        />
      </ArticleFormShell>
    </Form>
  );
}
