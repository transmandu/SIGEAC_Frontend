"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateClient } from "@/actions/mantenimiento/clientes/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetClients } from "@/hooks/mantenimiento/clientes/useGetClients";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { AeronauticalClient } from "@/types";
import { ClientFormFields } from "./ClientFormFields";
import {
  AERONAUTICAL_CLIENT_FIELD_LABELS,
  buildAeronauticalClientSchema,
  diffAeronauticalClient,
  type AeronauticalClientFormValues,
} from "./clientSchema";

interface EditClientFormProps {
  client: AeronauticalClient;
  onClose: () => void;
}

export function EditClientForm({ onClose, client }: EditClientFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: clients } = useGetClients(selectedCompany?.slug);
  const { updateClient } = useUpdateClient();

  const schema = useMemo(
    () => buildAeronauticalClientSchema(clients, client.id),
    [clients, client.id],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<AeronauticalClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: client.name ?? "",
      authorizing: client.authorizing ?? undefined,
      dni_type: client.dni_type ?? "",
      dni: client.dni ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
    },
  });

  const onSubmit = async (values: AeronauticalClientFormValues) => {
    const changes = diffAeronauticalClient(client, values);

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
          AERONAUTICAL_CLIENT_FIELD_LABELS,
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
            invalidFormHandler(AERONAUTICAL_CLIENT_FIELD_LABELS),
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
