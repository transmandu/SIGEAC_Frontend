"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateClient } from "@/actions/aerolinea/clientes/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetClients } from "@/hooks/aerolinea/clientes/useGetClients";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AirlineClient } from "@/types";
import { ClientFormFields } from "./ClientFormFields";
import {
  AIRLINE_CLIENT_FIELD_LABELS,
  buildAirlineClientSchema,
  diffAirlineClient,
  type AirlineClientFormValues,
} from "./clientSchema";

interface EditClientFormProps {
  client: AirlineClient;
  onClose: () => void;
}

export function EditClientForm({ onClose, client }: EditClientFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: clients } = useGetClients(selectedCompany?.slug);
  const { updateClient } = useUpdateClient();

  const schema = useMemo(
    () => buildAirlineClientSchema(clients, client.id),
    [clients, client.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<AirlineClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dni_type: client.dni_type ?? "",
      dni: client.dni ?? "",
      name: client.name ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
      pay_credit_days: String(client.pay_credit_days ?? 0),
    },
  });

  const onSubmit = async (values: AirlineClientFormValues) => {
    const changes = diffAirlineClient(client, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateClient.mutateAsync({
        id: client.id.toString(),
        data: changes,
        company: selectedCompany!.slug,
      });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(
          form.setError,
          errors,
          AIRLINE_CLIENT_FIELD_LABELS,
        );
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateClient.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(AIRLINE_CLIENT_FIELD_LABELS),
          )(e);
        }}
      >
        <ClientFormFields
          control={form.control}
          disabled={updateClient.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
