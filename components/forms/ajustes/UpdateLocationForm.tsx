"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateLocation } from "@/actions/ajustes/ubicaciones/actions";
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
import type { Location } from "@/types";
import { LocationFormFields } from "./LocationFormFields";
import {
  buildLocationSchema,
  findMainBase,
  diffLocation,
  LOCATION_FIELD_LABELS,
  type LocationFormValues,
} from "./locationSchema";

export default function UpdateLocationForm({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const { data: locations } = useGetLocationsByCompany(selectedCompany?.slug);
  const { updateLocation } = useUpdateLocation();

  const schema = useMemo(
    () => buildLocationSchema(locations, location),
    [locations, location],
  );

  const mainBase = useMemo(
    () => findMainBase(locations, location.id),
    [locations, location.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado.
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: location.address ?? "",
      name: location.name ?? "",
      cod_iata: location.cod_iata ?? "",
      isMainBase: !!location.isMainBase,
    },
  });

  const onSubmit = async (values: LocationFormValues) => {
    const changes = diffLocation(location, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateLocation.mutateAsync({ id: location.id, ...changes });
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
        isEditing
        busy={updateLocation.isPending}
        canSave={form.formState.isDirty}
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
          disabled={updateLocation.isPending}
          mainBase={mainBase}
        />
      </ArticleFormShell>
    </Form>
  );
}
