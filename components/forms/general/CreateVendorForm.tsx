"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { useCreateVendor } from "@/actions/ajustes/proveedores/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import { useGetVendors } from "@/hooks/general/proveedores/useGetVendors";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import type { Vendor } from "@/types";
import { VendorFormFields } from "./VendorFormFields";
import {
  buildVendorSchema,
  VENDOR_FIELD_LABELS,
  type VendorFormValues,
} from "./vendorSchema";

interface Props {
  onClose: () => void;
  /** Recibe el proveedor creado (con su id), p. ej. para seleccionarlo. */
  onCreated?: (vendor: Vendor) => void;
}

export default function CreateVendorForm({ onClose, onCreated }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: vendors, isSuccess: vendorsLoaded } = useGetVendors(
    selectedCompany?.slug,
  );
  const createVendor = useCreateVendor(selectedCompany?.slug);

  const schema = useMemo(() => buildVendorSchema(vendors), [vendors]);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      type: undefined,
    },
  });

  // Los duplicados se validan contra el catálogo: si este llega después de que
  // el usuario ya escribió, hay que volver a validar lo escrito.
  useEffect(() => {
    if (vendorsLoaded && form.formState.dirtyFields.name) {
      form.trigger("name");
    }
  }, [vendorsLoaded, vendors, form]);

  const onSubmit = async (values: VendorFormValues) => {
    try {
      const vendor = await createVendor.mutateAsync(values);
      if (vendor) onCreated?.(vendor);
      onClose();
    } catch (error) {
      // El toast lo muestra la mutación; aquí se marca el campo rechazado.
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, VENDOR_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        busy={createVendor.isPending}
        canSave
        submitLabel="Crear proveedor"
        submitTourId="proveedores-dialog-submit"
        onCancel={onClose}
        // stopPropagation: este form se renderiza dentro de otros formularios
        // (ej. cotización). React propaga el submit por su árbol aunque el
        // Dialog viva en un portal, y dispararía el submit del form padre.
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(
            onSubmit,
            invalidFormHandler(VENDOR_FIELD_LABELS),
          )(e);
        }}
      >
        <VendorFormFields
          control={form.control}
          disabled={createVendor.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
