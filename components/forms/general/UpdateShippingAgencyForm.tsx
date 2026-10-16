"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateShippingAgency } from "@/actions/ajustes/agencias_envio/actions";
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
  diffShippingAgency,
  SHIPPING_AGENCY_FIELD_LABELS,
  type ShippingAgencyFormValues,
} from "./shippingAgencySchema";

interface Props {
  agency: ShippingAgency;
  onClose: () => void;
}

export function UpdateShippingAgencyForm({ agency, onClose }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: agencies } = useGetShippingAgencies(selectedCompany?.slug);
  const updateAgency = useUpdateShippingAgency(selectedCompany?.slug);

  const schema = useMemo(
    () => buildShippingAgencySchema(agencies, agency.id),
    [agencies, agency.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<ShippingAgencyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: agency.name ?? "",
      code: agency.code ?? "",
      description: agency.description ?? "",
      type: agency.type,
      phone: agency.phone ?? "",
      email: agency.email ?? "",
    },
  });

  const onSubmit = async (values: ShippingAgencyFormValues) => {
    const changes = diffShippingAgency(agency, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateAgency.mutateAsync({ id: agency.id, ...changes });
      onClose();
    } catch (error) {
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
        isEditing
        busy={updateAgency.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
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
          disabled={updateAgency.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
