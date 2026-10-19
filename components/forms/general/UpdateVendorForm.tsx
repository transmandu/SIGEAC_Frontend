"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { useUpdateVendor } from "@/actions/ajustes/proveedores/actions";
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
  diffVendor,
  VENDOR_FIELD_LABELS,
  type VendorFormValues,
} from "./vendorSchema";
import { toPhoneValue } from "@/lib/phone";

interface Props {
  vendor: Vendor;
  onClose: () => void;
}

export default function UpdateVendorForm({ vendor, onClose }: Props) {
  const { selectedCompany } = useCompanyStore();
  const { data: vendors } = useGetVendors(selectedCompany?.slug);
  const updateVendor = useUpdateVendor(selectedCompany?.slug);

  const schema = useMemo(
    () => buildVendorSchema(vendors, vendor.id, vendor.phone),
    [vendors, vendor.id, vendor.phone],
  );

  // Los valores iniciales se fijan al montar: el diálogo desmonta su contenido
  // al cerrarse, así que cada apertura parte de lo guardado y un refetch de la
  // lista no pisa lo que el usuario está escribiendo.
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: vendor.name ?? "",
      phone: toPhoneValue(vendor.phone),
      email: vendor.email ?? "",
      address: vendor.address ?? "",
      type: vendor.type,
    },
  });

  const onSubmit = async (values: VendorFormValues) => {
    const changes = diffVendor(vendor, values);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      await updateVendor.mutateAsync({ id: vendor.id, ...changes });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, VENDOR_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        isEditing
        busy={updateVendor.isPending}
        canSave={form.formState.isDirty}
        onCancel={onClose}
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
          disabled={updateVendor.isPending}
        />
      </ArticleFormShell>
    </Form>
  );
}
