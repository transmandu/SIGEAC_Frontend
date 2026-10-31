"use client";

import { useForm } from "react-hook-form";

import { useSetCompanyLoanScopes } from "@/actions/ajustes/convenios/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { Form } from "@/components/ui/form";
import type { CompanyScope } from "@/hooks/ajustes/convenios/types";
import type { CompanyLoanAgreement } from "@/hooks/ajustes/convenios/types";
import { zodResolver } from "@/lib/zod-resolver";
import {
  LOAN_FIELD_LABELS,
  updateLoanScopesSchema,
  type UpdateLoanScopesValues,
} from "./loanSchema";
import { LoanScopesField } from "./LoanScopesField";

export default function UpdateCompanyLoanScopesForm({
  agreement,
  companySlug,
  onClose,
}: {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  onClose: () => void;
}) {
  const setScopes = useSetCompanyLoanScopes(companySlug);

  // El diálogo desmonta al cerrar: los valores iniciales se fijan al montar.
  const form = useForm<UpdateLoanScopesValues>({
    resolver: zodResolver(updateLoanScopesSchema),
    defaultValues: {
      scopes: agreement.scopes.filter((s) => s.is_active).map((s) => s.scope),
    },
  });

  const onSubmit = async (values: UpdateLoanScopesValues) => {
    // Sin cambios no hay petición.
    if (!form.formState.isDirty) {
      onClose();
      return;
    }

    try {
      await setScopes.mutateAsync({
        id: agreement.id,
        scopes: values.scopes as CompanyScope[],
      });
      onClose();
    } catch (error) {
      const errors = serverFieldErrors(error);
      if (errors) {
        applyServerFieldErrors(form.setError, errors, LOAN_FIELD_LABELS);
      }
    }
  };

  return (
    <Form {...form}>
      <ArticleFormShell
        className="min-h-0 flex-1"
        busy={setScopes.isPending}
        canSave={form.formState.isDirty}
        isEditing
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(LOAN_FIELD_LABELS))(e);
        }}
      >
        <LoanScopesField
          companySlug={companySlug}
          disabled={setScopes.isPending}
          hint="Cerrar un alcance impide nuevas operaciones de esa empresa; lo ya registrado se conserva."
        />
      </ArticleFormShell>
    </Form>
  );
}
