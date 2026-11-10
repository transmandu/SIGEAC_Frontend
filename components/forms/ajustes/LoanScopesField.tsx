"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { PanelSection } from "@/components/forms/PanelSection";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useGetCompanyLoanScopes } from "@/hooks/ajustes/convenios/useGetCompanyLoanScopes";

/**
 * Alcances de un convenio, uno por fila con su interruptor y su explicación.
 * Lo comparten el alta y la edición; necesita el contexto de un `<Form>` con un
 * campo `scopes`.
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
    <PanelSection
      className="flex min-h-0 flex-1 flex-col"
      icon={ShieldCheck}
      title="Alcances"
      hint={hint ?? "Qué módulos de su empresa podrá usar la otra."}
      flush
    >
      <FormField
        control={control}
        name="scopes"
        render={({ field }) => (
          <FormItem className="flex min-h-0 flex-1 flex-col space-y-0">
            {/* Es lo único que desplaza: el diálogo fija su altura y esta lista
                toma el espacio que sobra. Las filas llegan a los bordes del
                panel, separadas por una línea. */}
            <ul className="min-h-40 flex-1 divide-y divide-border/60 overflow-y-auto rounded-b-xl">
              {isLoading && (
                <li>
                  <Loader2 className="mx-auto my-6 size-5 animate-spin text-muted-foreground" />
                </li>
              )}
              {catalog.map((scope) => {
                const checked = field.value.includes(scope.scope);

                return (
                  <li key={scope.scope}>
                    <label
                      htmlFor={`scope-${scope.scope}`}
                      className="flex cursor-pointer items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/30 has-disabled:cursor-not-allowed has-disabled:opacity-60"
                    >
                      <span className="min-w-0 space-y-0.5">
                        <span className="block text-sm font-medium leading-tight">
                          {scope.label} · {scope.module}
                        </span>
                        <span className="block text-[13px] leading-snug text-muted-foreground">
                          {scope.description}
                        </span>
                      </span>

                      <Switch
                        id={`scope-${scope.scope}`}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(on) =>
                          field.onChange(
                            on
                              ? [...field.value, scope.scope]
                              : field.value.filter((s) => s !== scope.scope),
                          )
                        }
                        className="mt-0.5"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            <FormMessage className="px-4 pb-3" />
          </FormItem>
        )}
      />
    </PanelSection>
  );
}
