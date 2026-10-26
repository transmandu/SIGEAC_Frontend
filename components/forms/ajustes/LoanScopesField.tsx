"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { CheckboxCard } from "@/components/forms/mantenimiento/almacen/_components/CheckboxCard";
import { FormSection } from "@/components/forms/mantenimiento/almacen/_components/form-theme";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useGetCompanyLoanScopes } from "@/hooks/ajustes/convenios/useGetCompanyLoanScopes";

/**
 * Alcances de un convenio como casillas con su explicación. Lo comparten el
 * alta y la edición; necesita el contexto de un `<Form>` con un campo `scopes`.
 */
export function LoanScopesField({
  companySlug,
  disabled,
  hint,
}: {
  companySlug?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const { control } = useFormContext<{ scopes: string[] }>();
  const { data: catalog = [], isLoading } =
    useGetCompanyLoanScopes(companySlug);

  return (
    <FormSection
      className="flex min-h-0 flex-1 flex-col"
      icon={ShieldCheck}
      title="Alcances"
      hint={hint ?? "Qué módulos de su empresa podrá usar la otra."}
    >
      <FormField
        control={control}
        name="scopes"
        render={({ field }) => (
          <FormItem className="flex min-h-0 flex-1 flex-col">
            {/* Es lo único que desplaza: el diálogo fija su altura y esta lista
                toma el espacio que sobra. El padding evita recortar el realce
                de las casillas. */}
            <div className="-mx-1 min-h-40 flex-1 space-y-2.5 overflow-y-auto px-1 py-0.5">
              {isLoading && (
                <Loader2 className="mx-auto my-6 size-5 animate-spin text-muted-foreground" />
              )}
              {catalog.map((scope) => (
                <CheckboxCard
                  key={scope.scope}
                  id={`scope-${scope.scope}`}
                  checked={field.value.includes(scope.scope)}
                  disabled={disabled}
                  label={`${scope.label} · ${scope.module}`}
                  description={scope.description}
                  onCheckedChange={(on) =>
                    field.onChange(
                      on
                        ? [...field.value, scope.scope]
                        : field.value.filter((s) => s !== scope.scope),
                    )
                  }
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
