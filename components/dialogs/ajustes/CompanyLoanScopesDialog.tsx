"use client";

import { SlidersHorizontal } from "lucide-react";
import { FormDialogContent } from "@/components/dialogs/shared/FormDialogContent";
import UpdateCompanyLoanScopesForm from "@/components/forms/ajustes/UpdateCompanyLoanScopesForm";
import { Dialog } from "@/components/ui/dialog";
import type { CompanyLoanAgreement } from "@/hooks/ajustes/convenios/types";

interface Props {
  agreement: CompanyLoanAgreement;
  companySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** El otorgante decide qué módulos abre a la empresa del convenio. */
export function CompanyLoanScopesDialog({
  agreement,
  companySlug,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent
        icon={SlidersHorizontal}
        title="Configurar alcances"
        description={
          <>
            Qué puede hacer{" "}
            <span className="font-medium text-foreground">
              {" "}
              {agreement.borrower_company_name}{" "}
            </span>{" "}
            en su empresa; solo se guardará lo que cambie.
          </>
        }
        fill
        className="sm:max-w-lg"
      >
        {open && (
          <UpdateCompanyLoanScopesForm
            agreement={agreement}
            companySlug={companySlug}
            onClose={() => onOpenChange(false)}
          />
        )}
      </FormDialogContent>
    </Dialog>
  );
}
