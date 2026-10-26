"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Building2 } from "lucide-react";

import { useCreateCompanyLoan } from "@/actions/ajustes/convenios/actions";
import {
  applyServerFieldErrors,
  invalidFormHandler,
  serverFieldErrors,
} from "@/components/forms/mantenimiento/almacen/_components/form-feedback";
import {
  FieldLabelRow,
  FormSection,
  hintClass,
  labelClass,
  selectTriggerClass,
} from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { ArticleFormShell } from "@/components/forms/mantenimiento/almacen/articulos/ArticleFormShell";
import { RequiredIndicator } from "@/components/misc/RequiredIndicator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCompanyLoans } from "@/hooks/ajustes/convenios/useGetCompanyLoans";
import type { CompanyScope } from "@/hooks/ajustes/convenios/types";
import { useGetCompanies } from "@/hooks/sistema/useGetCompanies";
import { zodResolver } from "@/lib/zod-resolver";
import { useCompanyStore } from "@/stores/CompanyStore";
import {
  createLoanSchema,
  LOAN_FIELD_LABELS,
  type CreateLoanValues,
} from "./loanSchema";
import { LoanScopesField } from "./LoanScopesField";

export default function CreateCompanyLoanForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const { selectedCompany } = useCompanyStore();
  const slug = selectedCompany?.slug;
  const { data: companies = [], isLoading } = useGetCompanies();
  const { data: loans } = useGetCompanyLoans(slug);
  const createLoan = useCreateCompanyLoan(slug);

  const form = useForm<CreateLoanValues>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: { borrower_company_slug: "", scopes: [] },
  });

  // Una empresa ya habilitada no se ofrece: el convenio es uno por empresa y
  // sus alcances se cambian desde "Configurar alcances".
  const available = useMemo(() => {
    const already = new Set(loans?.granted.map((l) => l.borrower_company_slug));
    return companies.filter((c) => c.slug !== slug && !already.has(c.slug));
  }, [companies, loans, slug]);

  const onSubmit = async (values: CreateLoanValues) => {
    try {
      await createLoan.mutateAsync({
        borrowerCompanySlug: values.borrower_company_slug,
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
        busy={createLoan.isPending}
        canSave
        submitLabel="Habilitar empresa"
        onCancel={onClose}
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit, invalidFormHandler(LOAN_FIELD_LABELS))(e);
        }}
      >
        <FormSection
          icon={Building2}
          title="Empresa"
          hint="La que podrá usar módulos de la suya."
        >
          <FormField
            control={form.control}
            name="borrower_company_slug"
            render={({ field, fieldState }) => (
              <FormItem>
                <FieldLabelRow>
                  <FormLabel className={labelClass}>
                    Empresa a habilitar
                    <RequiredIndicator invalid={!!fieldState.error} />
                  </FormLabel>
                </FieldLabelRow>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={createLoan.isPending}
                >
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Seleccione una empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading && (
                      <SelectItem value="loading" disabled>
                        Cargando empresas...
                      </SelectItem>
                    )}
                    {!isLoading && available.length === 0 && (
                      <SelectItem value="empty" disabled>
                        No hay más empresas para habilitar
                      </SelectItem>
                    )}
                    {available.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className={hintClass}>
                  El sentido contrario requiere su propio convenio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <LoanScopesField
          companySlug={slug}
          disabled={createLoan.isPending}
          hint="Qué podrá hacer. Esa empresa elegirá después qué personas y departamentos suyos lo usan."
        />
      </ArticleFormShell>
    </Form>
  );
}
