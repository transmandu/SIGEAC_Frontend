"use client";

import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import { Loader2, UsersRound } from "lucide-react";

import { PanelSection } from "@/components/forms/PanelSection";
import { EmptyState } from "@/components/misc/EmptyState";
import { TagBadge } from "@/components/misc/TagBadge";
import { Dialog } from "@/components/ui/dialog";
import type { CompanyLoanAgreement } from "@/hooks/ajustes/convenios/types";
import { useGetLoanPersonnel } from "@/hooks/ajustes/convenios/useGetLoanPersonnel";

interface Props {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Detalle de solo lectura: cierra con clic fuera, no hay nada que perder. */
export function LoanPersonnelDialog({
  agreement,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  const { data, isLoading, isError } = useGetLoanPersonnel(
    open ? companySlug : undefined,
    agreement.id,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={UsersRound}
        title="Personal autorizado"
        description={
          <>
            Personas de{" "}
            <span className="font-medium text-foreground">
              {" "}
              {agreement.borrower_company_name}{" "}
            </span>{" "}
            que esa empresa eligió, una a una o por departamento, para actuar en
            los alcances que usted le abrió.
          </>
        }
        lockOutside={false}
        className="sm:max-w-3xl"
      >
        {isLoading ? (
          <Loader2 className="mx-auto my-10 size-5 animate-spin text-muted-foreground" />
        ) : isError ? (
          <EmptyState
            tone="error"
            icon={UsersRound}
            title="No se pudo cargar el personal"
            description="Cierre el diálogo e inténtelo de nuevo."
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="Aún no hay personal autorizado"
            description={`${agreement.borrower_company_name} todavía no ha autorizado a nadie.`}
          />
        ) : (
          <PanelSection
            icon={UsersRound}
            title="Personal"
            hint={`${data.length} ${data.length === 1 ? "persona" : "personas"}`}
            flush
          >
            <ul className="divide-y divide-border/60 overflow-hidden rounded-b-xl">
              {data.map((person) => (
                <li key={person.dni} className="space-y-1.5 px-4 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium wrap-anywhere">
                      {person.first_name} {person.last_name}
                    </p>
                    <p className="font-mono text-[13px] tabular-nums text-muted-foreground">
                      {person.dni}
                    </p>
                  </div>

                  <p className="text-[13px] text-muted-foreground wrap-anywhere">
                    {[person.department, person.job_title]
                      .filter(Boolean)
                      .join(" · ") || "Sin departamento ni cargo"}
                  </p>

                  {person.scopes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {person.scopes.map((scope) => (
                        <TagBadge key={scope} tone="slate">
                          {scope}
                        </TagBadge>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </PanelSection>
        )}
      </FormDialogContent>
    </Dialog>
  );
}
