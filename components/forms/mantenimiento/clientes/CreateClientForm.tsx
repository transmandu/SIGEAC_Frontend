"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateClient } from "@/actions/mantenimiento/clientes/actions";
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
  type AeronauticalClientFormValues,
} from "./clientSchema";

interface CreateClientFormProps {
  onClose: () => void;
  onCreated?: (client: AeronauticalClient) => void;
}

export function CreateClientForm({
  onClose,
  onCreated,
}: CreateClientFormProps) {
  const { selectedCompany } = useCompanyStore();
  const { data: clients, isSuccess: clientsLoaded } = useGetClients(
    selectedCompany?.slug,
  );
  const { createClient } = useCreateClient();

  const schema = useMemo(
    () => buildAeronauticalClientSchema(clients),
    [clients],
  );

  const form = useForm<AeronauticalClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      authorizing: undefined,
      dni_type: "",
      dni: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (clientsLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [clientsLoaded, clients, form]);

  const onSubmit = async (values: AeronauticalClientFormValues) => {
    try {
      const client = await createClient.mutateAsync({
        company: selectedCompany!.slug,
        data: { ...values, dni_type: values.dni ? values.dni_type : undefined },
      });
      if (client) onCreated?.(client);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
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
        busy={createClient.isPending}
        canSave
        submitLabel="Crear cliente"
        submitTourId="clientes-crear-submit"
        onCancel={onClose}
        // stopPropagation: este form se renderiza dentro de otros formularios.
        // React propaga el submit por su árbol aunque el Dialog viva en un
        // portal, y dispararía el submit del form padre.
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
          disabled={createClient.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
