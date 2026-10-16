"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateClient } from "@/actions/aerolinea/clientes/actions";
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
  type AirlineClientFormValues,
} from "./clientSchema";

interface CreateClientFormProps {
  onClose: () => void;
  onCreated?: (client: AirlineClient) => void;
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

  const schema = useMemo(() => buildAirlineClientSchema(clients), [clients]);

  const form = useForm<AirlineClientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dni_type: "",
      dni: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      pay_credit_days: "0",
    },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (!clientsLoaded) return;
    const { name, dni, email } = form.formState.dirtyFields;
    if (name) form.trigger("name");
    if (dni) form.trigger("dni");
    if (email) form.trigger("email");
  }, [clientsLoaded, clients, form]);

  const onSubmit = async (values: AirlineClientFormValues) => {
    try {
      const client = await createClient.mutateAsync({
        company: selectedCompany!.slug,
        data: { ...values, pay_credit_days: Number(values.pay_credit_days) },
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
          AIRLINE_CLIENT_FIELD_LABELS,
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
        // stopPropagation: este form se renderiza dentro de otros formularios
        // (ej. guía de carga). React propaga el submit por su árbol aunque el
        // Dialog viva en un portal, y dispararía el submit del form padre.
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
          disabled={createClient.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
