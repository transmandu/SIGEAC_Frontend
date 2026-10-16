"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateShippingAgency } from "@/actions/ajustes/agencias_envio/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetShippingAgencies } from "@/hooks/general/agencias_envio/useGetShippingAgencies";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { ShippingAgency } from "@/types";
import { ShippingAgencyFormFields } from "./ShippingAgencyFormFields";
import {
  buildShippingAgencySchema,
  SHIPPING_AGENCY_FIELD_LABELS,
  type ShippingAgencyFormValues,
} from "./shippingAgencySchema";

interface Props {
  onClose: () => void;
  onCreated?: (agency: ShippingAgency) => void;
}

export function CreateShippingAgencyForm({ onClose, onCreated }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: agencies, isSuccess: agenciesLoaded } = useGetShippingAgencies(
    selectedCompany?.slug,
  );
  const createAgency = useCreateShippingAgency(selectedCompany?.slug);

  const schema = useMemo(() => buildShippingAgencySchema(agencies), [agencies]);

  const form = useForm<ShippingAgencyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      type: "NATIONAL",
      phone: "",
      email: "",
    },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (!agenciesLoaded) return;
    const { name, code } = form.formState.dirtyFields;
    if (name) form.trigger("name");
    if (code) form.trigger("code");
  }, [agenciesLoaded, agencies, form]);

  const onSubmit = async (values: ShippingAgencyFormValues) => {
    try {
      const agency = await createAgency.mutateAsync(values);
      if (agency) onCreated?.(agency);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(
          form.setError,
          errors,
          SHIPPING_AGENCY_FIELD_LABELS,
        );
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createAgency.isPending}
        canSave
        submitLabel="Crear agencia"
        submitTourId="agencias-envio-crear-submit"
        onCancel={onClose}
        // stopPropagation: este form puede renderizarse dentro de otros
        // formularios. React propaga el submit por su árbol aunque el Dialog
        // viva en un portal, y dispararía el submit del form padre.
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(SHIPPING_AGENCY_FIELD_LABELS),
          )(e);
        }}
      >
        <ShippingAgencyFormFields
          control={form.control}
          disabled={createAgency.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
